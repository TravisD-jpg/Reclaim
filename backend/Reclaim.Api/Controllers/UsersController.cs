using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(NpgsqlDataSource dataSource) : ControllerBase
{
    // Feeds the demo's "Acting as" account switch until login replaces it.
    [HttpGet]
    public async Task<IEnumerable<User>> GetAll()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<User>(
            """
            SELECT user_id, name, email, role
            FROM users
            ORDER BY CASE role WHEN 'dev' THEN 1 WHEN 'staff' THEN 2 ELSE 3 END, name
            """);
    }
}
