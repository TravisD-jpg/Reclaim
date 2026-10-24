CREATE TABLE LostReports (
    report_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id               INT NOT NULL REFERENCES Users (user_id),
    name                  VARCHAR(100) NOT NULL,
    description           TEXT,
    category_id           INT REFERENCES Categories (category_id),
    last_seen_location_id INT REFERENCES Locations (location_id),
    date_lost             DATE,
    status                VARCHAR(15) CHECK (status IN ('open', 'matched', 'closed'))
);