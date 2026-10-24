using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/locations")]
public class LocationsController(NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Location>> GetAll()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<Location>(
            """
            SELECT location_id, building, room_or_area, is_dropoff_point
            FROM locations
            ORDER BY building, room_or_area NULLS FIRST
            """);
    }
}
