WITH seed_reports (email, name, description, category, building, date_lost, status) AS (
    VALUES
    ('aj118@uakron.edu', 'Gray earbuds', 'Gray wireless earbuds, my name is engraved on the case.', 'Electronics', 'Dave''s Market', '2026-02-25', 'closed'),
    ('ab391@uakron.edu', 'Black wallet', 'Black wallet with my campus parking pass inside.', 'Wallets & Purses', 'Buchtel Field', '2026-03-02', 'closed'),
    ('pp162@uakron.edu', 'Keys on red lanyard', 'Dorm and car keys on a red lanyard.', 'Keys & Cards', 'Honors Complex', '2026-03-03', 'closed'),
    ('mb248@uakron.edu', 'Navy blue jacket', 'Navy jacket, I left my gloves in the pocket.', 'Clothing', 'Alpha Phi', '2026-03-12', 'open'),
    ('sr305@uakron.edu', 'TI-84 calculator', 'Black graphing calculator with a cracked screen protector.', 'Electronics', 'Auburn Science and Engineering Ctr.', '2026-03-10', 'open'),
    ('th129@uakron.edu', 'Water bottle with stickers', 'Metal water bottle covered in band stickers.', 'Food & Drink Containers', 'Guzzetta Hall', '2026-03-15', 'open')
)
INSERT INTO lostreports (user_id, name, description, category_id, last_seen_location_id, date_lost, status)
SELECT u.user_id, r.name, r.description, c.category_id, l.location_id, CAST(r.date_lost AS DATE), r.status
FROM seed_reports AS r
JOIN users AS u ON u.email = r.email
JOIN categories AS c ON c.name = r.category
JOIN locations AS l ON l.building = r.building AND l.room_or_area IS NULL
WHERE NOT EXISTS ( -- Safe to rerun
    SELECT 1 FROM lostreports AS lr
    WHERE lr.user_id = u.user_id AND lr.name = r.name AND lr.date_lost = CAST(r.date_lost AS DATE)
);
