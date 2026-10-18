CREATE TABLE ItemSecretDetails (
    detail_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id     INT NOT NULL REFERENCES "Items" (item_id) ON DELETE CASCADE,
    detail_text VARCHAR(255) NOT NULL
);