CREATE TABLE MatchCandidates (
    report_id    INT REFERENCES "LostReports" (report_id),
    item_id      INT REFERENCES "Items" (item_id),
    score        DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id, item_id)
);
