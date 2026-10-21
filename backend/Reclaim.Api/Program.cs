using Npgsql;
using Reclaim.Api;
using Reclaim.Api.Data;

EnvFile.Load();

var builder = WebApplication.CreateBuilder(args);

var databaseUrl = builder.Configuration["DATABASE_URL"]
    ?? throw new InvalidOperationException("DATABASE_URL is not set. Run `neon env pull` to create .env.local.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(DatabaseUrl.ToConnectionString(databaseUrl)));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
