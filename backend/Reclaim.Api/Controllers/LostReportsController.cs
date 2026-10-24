using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/lost-reports")]
public class LostReportsController(NpgsqlDataSource dataSource) : ControllerBase
{
    // Shared by every read so reports come back with the reporter, category and building names.
    private const string SelectReports = """
        SELECT lr.report_id, lr.user_id, u.name AS reporter_name,
               lr.name, lr.description,
               lr.category_id, c.name AS category_name,
               lr.last_seen_location_id, l.building,
               lr.date_lost, lr.status
        FROM lostreports lr
        JOIN users u ON u.user_id = lr.user_id
        LEFT JOIN categories c ON c.category_id = lr.category_id
        LEFT JOIN locations l ON l.location_id = lr.last_seen_location_id
        """;

    [HttpGet]
    public async Task<IEnumerable<LostReport>> Search([FromQuery] LostReportSearch filters)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<LostReport>(
            SelectReports + """
             WHERE (@Search IS NULL OR lr.name ILIKE '%' || @Search || '%' OR lr.description ILIKE '%' || @Search || '%')
               AND (@UserId IS NULL OR lr.user_id = @UserId)
               AND (@Status IS NULL OR lr.status = @Status)
             ORDER BY lr.date_lost DESC NULLS LAST, lr.report_id DESC
            """,
            filters);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LostReport>> GetById(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var report = await FindReport(connection, id);
        return report == null ? NotFound() : report;
    }

    [HttpPost]
    public async Task<ActionResult<LostReport>> Create(LostReportRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var id = await connection.ExecuteScalarAsync<int>(
                """
                INSERT INTO lostreports (user_id, name, description, category_id, last_seen_location_id, date_lost, status)
                VALUES (@UserId, @Name, @Description, @CategoryId, @LastSeenLocationId, @DateLost, @Status)
                RETURNING report_id
                """,
                request);
            return CreatedAtAction(nameof(GetById), new { id }, await FindReport(connection, id));
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The user, category, or location does not exist.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LostReport>> Update(int id, LostReportRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var updated = await connection.ExecuteAsync(
                """
                UPDATE lostreports
                SET user_id = @UserId, name = @Name, description = @Description, category_id = @CategoryId,
                    last_seen_location_id = @LastSeenLocationId, date_lost = @DateLost, status = @Status
                WHERE report_id = @Id
                """,
                new { Id = id, request.UserId, request.Name, request.Description, request.CategoryId,
                      request.LastSeenLocationId, request.DateLost, request.Status });
            return updated == 0 ? NotFound() : (await FindReport(connection, id))!;
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The user, category, or location does not exist.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var deleted = await connection.ExecuteAsync("DELETE FROM lostreports WHERE report_id = @Id", new { Id = id });
            return deleted == 0 ? NotFound() : NoContent();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict("This report is linked to a claim or match and can't be deleted. Close it instead.");
        }
    }

    private static Task<LostReport?> FindReport(NpgsqlConnection connection, int id) =>
        connection.QuerySingleOrDefaultAsync<LostReport>(SelectReports + " WHERE lr.report_id = @Id", new { Id = id });
}
