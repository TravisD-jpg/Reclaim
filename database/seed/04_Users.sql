INSERT INTO Users (name, email, uakron_id, role, password_hash)
VALUES -- Bad security practice to encode passwords, not hash, but this is a demo application.
('dev', 'dev@example.com', '1111111', 'dev', encode(convert_to('dev', 'UTF8'), 'base64')), 
('staff', 'staff@example.com', '2222222', 'staff', encode(convert_to('staff', 'UTF8'), 'base64')),
('user', 'user@example.com', '3333333', 'user', encode(convert_to('user', 'UTF8'), 'base64'));