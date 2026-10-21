CREATE TABLE Locations (
    location_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building         VARCHAR(100) NOT NULL,
    room_or_area     VARCHAR(100),
    is_dropoff_point BOOLEAN DEFAULT FALSE
);