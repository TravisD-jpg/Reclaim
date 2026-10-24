using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController(NpgsqlDataSource dataSource) : ControllerBase
{
    public record DatabaseHealth(string Version, long ItemCount);

    // Confirms the API can reach Neon and read seeded data.
    [HttpGet("db")]
    public async Task<ActionResult<DatabaseHealth>> Database()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var health = await connection.QuerySingleAsync<DatabaseHealth>(
            "SELECT version() AS Version, (SELECT count(*) FROM items) AS ItemCount");
        return Ok(health);
    }
}
