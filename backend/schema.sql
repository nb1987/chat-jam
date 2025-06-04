CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  userImgSrc TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL
);

CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user1_id INT REFERENCES users(id) ON DELETE CASCADE,
  user2_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  room_id INT REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL
);

CREATE TABLE friends (
  user1_id INT REFERENCES users(id) ON DELETE CASCADE,
  user2_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user1_id, user2_id)
);

INSERT INTO users (username, email, password, city, state)
VALUES
('Sammy', 'bot1@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Los Angeles', 'California'),
('Harry', 'bot2@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'New York', 'New York'),
('Lena', 'bot3@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Austin', 'Texas'),
('Carlos', 'bot4@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Chicago', 'Illinois'),
('Ava', 'bot5@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Miami', 'Florida'),
('Noah', 'bot6@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Denver', 'Colorado'),
('Zara', 'bot7@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Seattle', 'Washington'),
('Miles', 'bot8@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Phoenix', 'Arizona'),
('Chloe', 'bot9@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Atlanta', 'Georgia'),
('Ethan', 'bot10@example.com', '{"salt":"73ada13ae6ae68146afcfa2524446b97","hashedPassword":"1153321487be392d9903bf4b74968332d84077ef9877c6228fc2fa011bce49803ceaedd70f11f6378306f55572cf80051af395be857586e7389c9989365c513b"}', 'Boston', 'Massachusetts');
