using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemsController(NpgsqlDataSource dataSource) : ControllerBase
{
    // Shared by every read so items always come back with their category and building names.
    private const string SelectItems = """
        SELECT i.item_id, i.name, i.description,
               i.category_id, c.name AS category_name,
               i.found_location_id, l.building,
               i.date_found, i.status, i.photo_url
        FROM items i
        LEFT JOIN categories c ON c.category_id = i.category_id
        LEFT JOIN locations l ON l.location_id = i.found_location_id
        """;

    [HttpGet]
    public async Task<IEnumerable<Item>> Search([FromQuery] ItemSearch filters)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<Item>(
            SelectItems + """
             WHERE (@Search IS NULL OR i.name ILIKE '%' || @Search || '%' OR i.description ILIKE '%' || @Search || '%')
               AND (@CategoryId IS NULL OR i.category_id = @CategoryId)
               AND (@LocationId IS NULL OR i.found_location_id = @LocationId)
               AND (@Status IS NULL OR i.status = @Status)
             ORDER BY i.date_found DESC, i.item_id DESC
            """,
            filters);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Item>> GetById(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var item = await FindItem(connection, id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Item>> Create(ItemRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var id = await connection.ExecuteScalarAsync<int>(
                """
                INSERT INTO items (name, description, category_id, found_location_id, date_found, status, photo_url)
                VALUES (@Name, @Description, @CategoryId, @FoundLocationId, @DateFound, @Status, @PhotoUrl)
                RETURNING item_id
                """,
                request);
            return CreatedAtAction(nameof(GetById), new { id }, await FindItem(connection, id));
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The category or location does not exist.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Item>> Update(int id, ItemRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var updated = await connection.ExecuteAsync(
                """
                UPDATE items
                SET name = @Name, description = @Description, category_id = @CategoryId,
                    found_location_id = @FoundLocationId, date_found = @DateFound,
                    status = @Status, photo_url = @PhotoUrl
                WHERE item_id = @Id
                """,
                new { Id = id, request.Name, request.Description, request.CategoryId,
                      request.FoundLocationId, request.DateFound, request.Status, request.PhotoUrl });
            return updated == 0 ? NotFound() : (await FindItem(connection, id))!;
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("The category or location does not exist.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        try
        {
            var deleted = await connection.ExecuteAsync("DELETE FROM items WHERE item_id = @Id", new { Id = id });
            return deleted == 0 ? NotFound() : NoContent();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict("This item has claims or verification attempts and can't be deleted.");
        }
    }

    private static Task<Item?> FindItem(NpgsqlConnection connection, int id) =>
        connection.QuerySingleOrDefaultAsync<Item>(SelectItems + " WHERE i.item_id = @Id", new { Id = id });
}
