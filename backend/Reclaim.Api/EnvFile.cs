namespace Reclaim.Api;

public static class EnvFile
{
    // Loads KEY=value lines from the nearest .env.local (written by `neon deploy`).
    // Variables already set in the environment are not overridden.
    public static void Load(string fileName = ".env.local")
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (directory != null && !File.Exists(Path.Combine(directory.FullName, fileName)))
        {
            directory = directory.Parent;
        }

        if (directory == null)
        {
            return;
        }

        foreach (var line in File.ReadAllLines(Path.Combine(directory.FullName, fileName)))
        {
            var parts = line.Split('=', 2);
            if (parts.Length != 2 || line.TrimStart().StartsWith('#'))
            {
                continue;
            }

            var key = parts[0].Trim();
            if (Environment.GetEnvironmentVariable(key) == null)
            {
                Environment.SetEnvironmentVariable(key, parts[1].Trim().Trim('"', '\''));
            }
        }
    }
}
