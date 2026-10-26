CREATE TABLE Items (
    item_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    category_id         INT REFERENCES Categories (category_id),
    found_location_id   INT REFERENCES Locations (location_id),
    held_at_location_id INT NOT NULL REFERENCES Locations (location_id),
    date_found          DATE NOT NULL,
    status              VARCHAR(15) CHECK (status IN ('stored', 'claimed', 'disposed')),
    photo_url           VARCHAR(255),
    logged_by           INT REFERENCES Users (user_id)
);