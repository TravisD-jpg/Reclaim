WITH seed_details (name, building, date_found, detail_text) AS (
    VALUES
    ('Black rolling backpack', 'Administrative Services Building', '2026-03-16', 'Broken zipper'),
    ('White JanSport backpack', 'Alpha Delta Pi', '2026-02-24', 'Nike keychain on bag'),
    ('Purple JanSport backpack', 'Alpha Gamma Delta', '2026-03-13', 'Notebook inside with Calculus work'),
    ('White Nike backpack', 'Alpha Phi', '2026-03-08', 'Pink haircomb inside'),
    ('Black canvas duffel', 'Dave''s Market', '2026-02-28', 'Initials "JM" on tag'),
    ('Black laptop charger', 'Mary Gladwin Hall', '2026-02-26', 'Tape wrapped near plug'),
    ('Black Beats Solo Buds', 'Ayer Hall', '2026-03-04', 'Left earbud missing silicone tip'),
    ('Black Soundcore Life P3 earbuds', 'Chima Family Center', '2026-02-24', 'Case has star sticker'),
    ('Black Bose Sport Earbuds', 'Lincoln Building', '2026-02-22', 'Scratched case lid'),
    ('Gray Galaxy Buds2', 'Dave''s Market', '2026-02-26', 'Arthur Johnson engraved on case'),
    ('Black leather wallet', 'Buchtel Field', '2026-03-03', 'Parking Pass inside'),
    ('Brown Fossil trifold wallet', 'Lincoln Building', '2026-03-16', 'Torn inner lining'),
    ('Green leather bifold wallet', 'Phi Kappa Psi', '2026-02-21', 'Zip coin pocket with wallet in it'),
    ('Purple zip wallet', 'Superior Building', '2026-02-20', 'Library card inside'),
    ('Black faux-leather wallet', 'Computer Center', '2026-02-26', 'Folded receipt from Target'),
    ('Black Stanley bottle', 'Honors Residence Hall', '2026-02-22', 'Dented near the base'),
    ('Black Thermos lunch box', 'Five Guys (Akron)', '2026-02-21', 'Cracked lid latch'),
    ('Blue Rubbermaid lunch kit', 'Whitby Hall', '2026-02-27', 'Name written on lid'),
    ('Stainless steel water bottle', 'Guzzetta Hall', '2026-03-16', 'Covered in Imagine Dragons stickers'),
    ('Black Garmin Forerunner watch', 'Folk Hall', '2026-03-11', 'Cracked screen corner'),
    ('Black prescription glasses', 'E.J. Thomas Performing Arts Hall', '2026-03-06', 'Cracked left arm'),
    ('Silver chain necklace', 'Hower House', '2026-03-21', 'Heart charm pendant'),
    ('Gold ring', 'Quaker Residence Hall', '2026-02-19', 'Engraved "A&M Forever" inside'),
    ('Black jeans', 'Whitby Hall', '2026-02-23', 'Size 32 waist'),
    ('Navy blue Columbia jacket', 'Alpha Phi', '2026-03-13', 'Gloves found in left pocket'),
    ('Gray wool peacoat', 'Superior Building', '2026-03-01', 'Missing multiple buttons'),
    ('Zips track jacket', 'Louis and Freda Stile Athletic Field House', '2026-03-08', 'Hole in the left armpit area'),
    ('Dorm and car keys', 'Honors Complex', '2026-03-04', 'Red lanyard attached'),
    ('Capital One credit card', 'Schrank Hall (North)', '2026-02-20', 'Expires 05/2027'),
    ('UA Zip Card in badge holder', 'Superior Building', '2026-03-05', 'Name is "Kalya"'),
    ('Black compact umbrella', 'Einstein Bros Bagels', '2026-02-26', 'Bent on side'),
    ('Green field hockey stick', 'Sisler-McFawn Residence Hall', '2026-02-27', 'Initials taped on handle, "DM"'),
    ('Red tennis racket', 'Lincoln Building', '2026-02-20', 'Ripping grip tape'),
    ('Rubik''s Cube', 'Crouse Hall', '2026-03-17', 'Small cartoon cat sticker'),
    ('Silver compact mirror', 'Dave''s Market', '2026-03-18', 'Scratch on back'),
    ('Blue career fair padfolio', 'Louis and Freda Stile Athletic Field House', '2026-03-17', 'Paper-clipped resume inside'),
    ('Stapled lab report', 'Einstein Bros Bagels', '2026-03-04', 'Chemistry lab report for Chem 102'),
    ('Calculus textbook', 'Ayer Hall', '2026-03-15', 'Ripped front page'),
    ('Folded bills', 'Subway (East Exchange)', '2026-02-26', 'Two twenty-dollar bills and a ACME card'),
    ('Lip balm', 'Leigh Hall', '2026-03-18', 'Mint-flavored Chapstick')
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