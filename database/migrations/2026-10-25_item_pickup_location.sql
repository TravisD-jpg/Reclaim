-- One-time update for databases loaded before 2026-10-25, when items had no pickup location.
-- Adds the three drop-off desks, gives every existing item one, then makes the column required.
BEGIN;

INSERT INTO locations (building, room_or_area, is_dropoff_point)
SELECT src.building, src.room_or_area, TRUE
FROM (VALUES
    ('Student Union, The Jean Hower Taber', 'Information Desk'),
    ('Bierce Library', 'Circulation Desk'),
    ('UA Police Department', 'Front Desk')
) AS src(building, room_or_area)
WHERE NOT EXISTS (
    SELECT 1 FROM locations AS l
    WHERE l.building = src.building AND l.room_or_area = src.room_or_area
);

ALTER TABLE items ADD COLUMN held_at_location_id INT REFERENCES locations (location_id);

-- Same rule as 03_Items.sql.
UPDATE items AS i
SET held_at_location_id = d.location_id
FROM locations AS d
WHERE d.is_dropoff_point
  AND d.building = CASE
      WHEN i.category_id IN (
          SELECT category_id FROM categories
          WHERE name IN ('Wallets & Purses', 'Electronics', 'Keys & Cards', 'Jewelry & Accessories', 'Documents', 'Cash'))
          THEN 'UA Police Department'
      WHEN i.category_id IN (SELECT category_id FROM categories WHERE name = 'Bags & Luggage')
          THEN 'Student Union, The Jean Hower Taber'
      ELSE 'Bierce Library'
  END;

ALTER TABLE items ALTER COLUMN held_at_location_id SET NOT NULL;

COMMIT;
