using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/claims")]
public class ClaimsController(NpgsqlDataSource dataSource) : ControllerBase
{
    private const string SelectClaims = """
        SELECT cl.claim_id, cl.item_id, i.name AS item_name,
               cl.user_id, claimant.name AS claimant_name,
               cl.report_id, lr.name AS report_name,
               cl.approved_by, approver.name AS approved_by_name,
               cl.claim_date
        FROM claims cl
        JOIN items i ON i.item_id = cl.item_id
        JOIN users claimant ON claimant.user_id = cl.user_id
        JOIN users approver ON approver.user_id = cl.approved_by
        LEFT JOIN lostreports lr ON lr.report_id = cl.report_id
        """;

    private record ClaimLinks(int ItemId, int? ReportId);

    [HttpGet]
    public async Task<IEnumerable<Claim>> Search([FromQuery] ClaimSearch filters)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<Claim>(
            SelectClaims + """
             WHERE (@ItemId IS NULL OR cl.item_id = @ItemId)
               AND (@UserId IS NULL OR cl.user_id = @UserId)
               AND (@ApprovedBy IS NULL OR cl.approved_by = @ApprovedBy)
             ORDER BY cl.claim_date DESC
            """,
            filters);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Claim>> GetById(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var claim = await FindClaim(connection, id);
        return claim == null ? NotFound() : claim;
    }

    // Creating a claim also marks the item claimed and closes the linked report, all in one transaction.
    [HttpPost]
    public async Task<ActionResult<Claim>> Create(ClaimRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        var error = await Validate(connection, transaction, request);
        if (error != null)
        {
            return BadRequest(error);
        }

        var itemStatus = await connection.ExecuteScalarAsync<string?>(
            "SELECT status FROM items WHERE item_id = @ItemId FOR UPDATE", request, transaction);
        if (itemStatus == null)
        {
            return BadRequest("The item does not exist.");
        }
        if (itemStatus != "stored")
        {
            return Conflict($"This item is already {itemStatus}.");
        }

        try
        {
            var id = await connection.ExecuteScalarAsync<int>(
                """
                INSERT INTO claims (item_id, user_id, report_id, approved_by, claim_date)
                VALUES (@ItemId, @UserId, @ReportId, @ApprovedBy, COALESCE(@ClaimDate, CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York'))
                RETURNING claim_id
                """,
                request, transaction);
            await connection.ExecuteAsync(
                "UPDATE items SET status = 'claimed' WHERE item_id = @ItemId", request, transaction);
            await connection.ExecuteAsync(
                "UPDATE lostreports SET status = 'closed' WHERE report_id = @ReportId", request, transaction);
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetById), new { id }, await FindClaim(connection, id));
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The claimant does not exist.");
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Conflict("This item already has a claim.");
        }
    }

    // If the linked report changes, the old report reopens and the new one closes.
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Claim>> Update(int id, ClaimChanges changes)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        var current = await connection.QuerySingleOrDefaultAsync<ClaimLinks>(
            "SELECT item_id, report_id FROM claims WHERE claim_id = @Id FOR UPDATE", new { Id = id }, transaction);
        if (current == null)
        {
            return NotFound();
        }

        var error = await Validate(connection, transaction, changes);
        if (error != null)
        {
            return BadRequest(error);
        }

        try
        {
            await connection.ExecuteAsync(
                """
                UPDATE claims
                SET user_id = @UserId, report_id = @ReportId, approved_by = @ApprovedBy,
                    claim_date = COALESCE(@ClaimDate, claim_date)
                WHERE claim_id = @Id
                """,
                new { Id = id, changes.UserId, changes.ReportId, changes.ApprovedBy, changes.ClaimDate },
                transaction);

            if (current.ReportId != changes.ReportId)
            {
                await connection.ExecuteAsync(
                    "UPDATE lostreports SET status = 'open' WHERE report_id = @ReportId", current, transaction);
                await connection.ExecuteAsync(
                    "UPDATE lostreports SET status = 'closed' WHERE report_id = @ReportId", changes, transaction);
            }
            await transaction.CommitAsync();

            return (await FindClaim(connection, id))!;
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The claimant does not exist.");
        }
    }

    // Undoes a claim: the item goes back to stored and the linked report reopens.
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        var deleted = await connection.QuerySingleOrDefaultAsync<ClaimLinks>(
            "DELETE FROM claims WHERE claim_id = @Id RETURNING item_id, report_id", new { Id = id }, transaction);
        if (deleted == null)
        {
            return NotFound();
        }

        await connection.ExecuteAsync(
            "UPDATE items SET status = 'stored' WHERE item_id = @ItemId", deleted, transaction);
        await connection.ExecuteAsync(
            "UPDATE lostreports SET status = 'open' WHERE report_id = @ReportId", deleted, transaction);
        await transaction.CommitAsync();

        return NoContent();
    }

    // Rules the schema can't express: the approver must be staff, and a linked report must be the claimant's own.
    private static async Task<string?> Validate(NpgsqlConnection connection, NpgsqlTransaction transaction, ClaimChanges claim)
    {
        var approverRole = await connection.ExecuteScalarAsync<string?>(
            "SELECT role FROM users WHERE user_id = @ApprovedBy", claim, transaction);
        if (approverRole is not ("staff" or "dev"))
        {
            return "Claims must be approved by a staff member.";
        }

        if (claim.ReportId != null)
        {
            var reportOwner = await connection.ExecuteScalarAsync<int?>(
                "SELECT user_id FROM lostreports WHERE report_id = @ReportId", claim, transaction);
            if (reportOwner != claim.UserId)
            {
                return "The lost report must exist and belong to the claimant.";
            }
        }

        return null;
    }

    private static Task<Claim?> FindClaim(NpgsqlConnection connection, int id) =>
        connection.QuerySingleOrDefaultAsync<Claim>(SelectClaims + " WHERE cl.claim_id = @Id", new { Id = id });
}
