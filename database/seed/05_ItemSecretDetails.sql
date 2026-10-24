WITH seed_details (name, building, date_found, detail_text) AS (
    VALUES
    ('Bag', 'Administrative Services Building', '2026-03-16', 'Broken zipper'),
    ('Bag', 'Alpha Delta Pi', '2026-02-24', 'Nike keychain on bag'),
    ('Bag', 'Alpha Gamma Delta', '2026-03-13', 'Notebook inside with Calculus work'),
    ('Bag', 'Alpha Phi', '2026-03-08', 'Pink haircomb inside'),
    ('Black Bag', 'Dave''s Market', '2026-02-28', 'Initials "JM" on tag'),
    ('Black Charger', 'Mary Gladwin Hall', '2026-02-26', 'Tape wrapped near plug'),
    ('Black Earbuds', 'Ayer Hall', '2026-03-04', 'Left earbud missing silicone tip'),
    ('Black Earbuds', 'Chima Family Center', '2026-02-24', 'Case has star sticker'),
    ('Black Earbuds', 'Lincoln Building', '2026-02-22', 'Scratched case lid'),
    ('Gray Earbuds', 'Dave''s Market', '2026-02-26', 'Authur Johnson engraved on case'),
    ('Black Wallet or purse', 'Buchtel Field', '2026-03-03', 'Parking Pass inside'),
    ('Brown Wallet or purse', 'Lincoln Building', '2026-03-16', 'Torn inner lining'),
    ('Green Wallet or purse', 'Phi Kappa Psi', '2026-02-21', 'Zip coin pocket with wallet in it'),
    ('Purple Wallet or purse', 'Superior Building', '2026-02-20', 'Library card inside'),
    ('Wallet or purse', 'Computer Center', '2026-02-26', 'Folded receipt from Target'),
    ('Black Bottle', 'Honors Residence Hall', '2026-02-22', 'Dented near the base'),
    ('Black Lunch container', 'Five Guys (Akron)', '2026-02-21', 'Cracked lid latch'),
    ('Blue Lunch container', 'Whitby Hall', '2026-02-27', 'Name written on lid'),
    ('Bottle', 'Guzzetta Hall', '2026-03-16', 'Covered in imagine dragon stickers'),
    ('Black Watch', 'Folk Hall', '2026-03-11', 'Cracked screen corner'),
    ('Glasses', 'E.J. Thomas Performing Arts Hall', '2026-03-06', 'Cracked left arm'),
    ('Jewelry', 'Hower House', '2026-03-21', 'Heart charm pendant'),
    ('Jewelry', 'Quaker Residence Hall', '2026-02-19', 'Engraved "A&M Forever" inside'),
    ('Black Pants', 'Whitby Hall', '2026-02-23', 'Size 32 waist'),
    ('Blue Jacket', 'Alpha Phi', '2026-03-13', 'Gloves found in left pocket'),
    ('Gray Jacket', 'Superior Building', '2026-03-01', 'Missing multiple buttons'),
    ('Jacket', 'Louis and Freda Stile Athletic Field House', '2026-03-08', 'Hole in the left armpit area'),
    ('Keys', 'Honors Complex', '2026-03-04', 'Red lanyard attached'),
    ('Card', 'Schrank Hall (North)', '2026-02-20', 'Expires 05/2027'),
    ('Card', 'Superior Building', '2026-03-05', 'Named is "Kalya"'),
    ('Black Umbrella', 'Einstein Bros Bagels', '2026-02-26', 'Bent on side'),
    ('Green Sports equipment', 'Sisler-McFawn Residence Hall', '2026-02-27', 'Initials taped on handle, "DM"'),
    ('Red Sports equipment', 'Lincoln Building', '2026-02-20', 'Ripping grip tape'),
    ('Found item', 'Crouse Hall', '2026-03-17', 'Small cartoon cat sticker'),
    ('Silver Found item', 'Dave''s Market', '2026-03-18', 'Scratch on back'),
    ('Blue Documents', 'Louis and Freda Stile Athletic Field House', '2026-03-17', 'Paper-clipped resume inside'),
    ('Documents', 'Einstein Bros Bagels', '2026-03-04', 'Chemistry lab report for Chem 102'),
    ('Book', 'Ayer Hall', '2026-03-15', 'Ripped front page'),
    ('Cash', 'Subway (East Exchange)', '2026-02-26', 'Two twenty-dollar bills and a ACME card'),
    ('Personal care item', 'Leigh Hall', '2026-03-18', 'Mint-flavored Chapstick')
),
building_locations AS (
    SELECT building, MIN(location_id) AS location_id
    FROM Locations
    WHERE room_or_area IS NULL
    GROUP BY building
)
INSERT INTO ItemSecretDetails (item_id, detail_text)
SELECT
    i.item_id,
    d.detail_text
FROM seed_details AS d
JOIN building_locations AS l ON l.building = d.building
JOIN Items AS i
    ON i.name = d.name
    AND i.found_location_id = l.location_id
    AND i.date_found = CAST(d.date_found AS DATE);