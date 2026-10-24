WITH seed_claims (item_name, building, date_found, claimant_email, report_name, approver_email, claim_date) AS (
    VALUES
    ('Gray Earbuds', 'Dave''s Market', '2026-02-26', 'aj118@uakron.edu', 'Gray earbuds', 'ml57@uakron.edu', '2026-02-27 14:30'),
    ('Black Wallet or purse', 'Buchtel Field', '2026-03-03', 'ab391@uakron.edu', 'Black wallet', 'dp88@uakron.edu', '2026-03-04 10:15'),
    ('Keys', 'Honors Complex', '2026-03-04', 'pp162@uakron.edu', 'Keys on red lanyard', 'ko23@uakron.edu', '2026-03-05 16:45'),
    ('Jewelry', 'Hower House', '2026-03-21', 'jk214@uakron.edu', NULL, 'ml57@uakron.edu', '2026-03-23 11:00') -- Walk-in claim, no lost report
),
new_claims AS (
    INSERT INTO claims (item_id, user_id, report_id, approved_by, claim_date)
    SELECT i.item_id, claimant.user_id, lr.report_id, approver.user_id, CAST(s.claim_date AS TIMESTAMP)
    FROM seed_claims AS s
    JOIN locations AS l ON l.building = s.building AND l.room_or_area IS NULL
    JOIN items AS i ON i.name = s.item_name AND i.found_location_id = l.location_id AND i.date_found = CAST(s.date_found AS DATE)
    JOIN users AS claimant ON claimant.email = s.claimant_email
    JOIN users AS approver ON approver.email = s.approver_email
    LEFT JOIN lostreports AS lr ON lr.user_id = claimant.user_id AND lr.name = s.report_name
    ON CONFLICT (item_id) DO NOTHING -- Safe to rerun
    RETURNING item_id
)
UPDATE items SET status = 'claimed'
WHERE item_id IN (SELECT item_id FROM new_claims);
