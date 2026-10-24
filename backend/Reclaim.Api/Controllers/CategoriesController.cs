using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Reclaim.Api.Models;

namespace Reclaim.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Category>> GetAll()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QueryAsync<Category>(
            "SELECT category_id, name FROM categories ORDER BY name");
    }
}
