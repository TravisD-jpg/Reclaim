CREATE TABLE VerificationAttempts (
    attempt_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id      INT NOT NULL REFERENCES Items (item_id),
    user_id      INT NOT NULL REFERENCES Users (user_id),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passed       BOOLEAN NOT NULL
);