using System.Web;
using Npgsql;

namespace Reclaim.Api.Data;

public static class DatabaseUrl
{
    // Converts Neon's postgresql://user:password@host/db?sslmode=require URL
    // into the key=value format Npgsql expects.
    public static string ToConnectionString(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var credentials = uri.UserInfo.Split(':', 2);
        var query = HttpUtility.ParseQueryString(uri.Query);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = Uri.UnescapeDataString(credentials[1]),
            SslMode = SslMode.Require,
        };

        if (query["channel_binding"] == "require")
        {
            builder.ChannelBinding = ChannelBinding.Require;
        }

        return builder.ConnectionString;
    }
}
