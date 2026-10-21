INSERT INTO categories (name) VALUES -- We may want more, but this works for now, covers all the basics
    ('Wallets & Purses'),
    ('Electronics'),
    ('Keys & Cards'),
    ('Bags & Luggage'),
    ('Food & Drink Containers'),
    ('Clothing'),
    ('Jewelry & Accessories'),
    ('Documents'),
    ('Books & Stationery'),
    ('Sports & Outdoors'),
    ('Personal Care'),
    ('Cash'),
    ('Other')
ON CONFLICT (name) DO NOTHING;
