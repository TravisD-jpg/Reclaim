CREATE TABLE Users (
    user_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    uakron_id     VARCHAR(20) NOT NULL UNIQUE,
    role          VARCHAR(10) NOT NULL CHECK (role IN ('user', 'staff', 'dev')),
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);