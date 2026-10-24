-- Neon defaults to UTC. Timestamps in this schema are local campus time, so DEFAULT CURRENT_TIMESTAMP
-- should record Akron time. Applies to new connections on whichever database this runs in.
DO $$
BEGIN
    EXECUTE format('ALTER DATABASE %I SET timezone TO %L', current_database(), 'America/New_York');
END $$;
