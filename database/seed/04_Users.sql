-- Every account's demo password is "reclaim".
-- Bad security practice to encode passwords, not hash, but this is a demo application.
INSERT INTO Users (name, email, uakron_id, role, password_hash)
SELECT name, email, uakron_id, role, encode(convert_to('reclaim', 'UTF8'), 'base64')
FROM (VALUES
    -- Developers (admin)
    ('Travis Dumire', 'trd61@uakron.edu', '7010607', 'dev'),
    ('Davonte Martin', 'dm538@uakron.edu', '7020538', 'dev'),
    -- Lost and found staff: Student Union, Bierce Library, UAPD
    ('Maria Lopez', 'ml57@uakron.edu', '3104862', 'staff'),
    ('Kevin Okafor', 'ko23@uakron.edu', '3217495', 'staff'),
    ('Dana Price', 'dp88@uakron.edu', '3329051', 'staff'),
    -- Students
    ('Jordan Kim', 'jk214@uakron.edu', '4182736', 'user'),
    ('Aaliyah Brooks', 'ab391@uakron.edu', '4290518', 'user'),
    ('Arthur Johnson', 'aj118@uakron.edu', '4318822', 'user'),
    ('Priya Patel', 'pp162@uakron.edu', '4401937', 'user'),
    ('Marcus Bell', 'mb248@uakron.edu', '4527384', 'user'),
    ('Sofia Romano', 'sr305@uakron.edu', '4619250', 'user'),
    ('Tyler Huang', 'th129@uakron.edu', '4703361', 'user'),
    ('Grace Okonkwo', 'go44@uakron.edu', '4815472', 'user'),
    ('Liam Schultz', 'ls218@uakron.edu', '4926583', 'user'),
    ('Hannah Reyes', 'hr93@uakron.edu', '5031694', 'user'),
    ('Noah Fischer', 'nf156@uakron.edu', '5142705', 'user'),
    ('Zoe Carter', 'zc67@uakron.edu', '5253816', 'user'),
    ('Arjun Mehta', 'am402@uakron.edu', '5364927', 'user'),
    ('Olivia Grant', 'og31@uakron.edu', '5475038', 'user'),
    ('Caleb Turner', 'ct288@uakron.edu', '5586149', 'user')
) AS seed_users (name, email, uakron_id, role)
ON CONFLICT (email) DO NOTHING; -- Safe to rerun
