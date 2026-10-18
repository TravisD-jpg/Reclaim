CREATE TABLE Claims (
    claim_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id     INT NOT NULL UNIQUE REFERENCES "Items" (item_id),
    user_id     INT NOT NULL REFERENCES "Users" (user_id),
    report_id   INT REFERENCES "LostReports" (report_id),
    approved_by INT NOT NULL REFERENCES "Users" (user_id),
    claim_date  TIMESTAMP NOT NULL
);