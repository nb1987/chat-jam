CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  userImgSrc TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  password_reset_token TEXT,
  password_reset_requested_at TIMESTAMP
);

CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user1_id INT REFERENCES users(id) ON DELETE CASCADE,
  user2_id INT REFERENCES users(id) ON DELETE CASCADE,
  user_low INT GENERATED ALWAYS AS (LEAST(user1_id, user2_id)) STORED,
  user_high INT GENERATED ALWAYS AS (GREATEST(user1_id, user2_id)) STORED,

  CONSTRAINT unique_room_pair UNIQUE (user_low, user_high)
); 

-- ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  room_id INT REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  friend_id INT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL
  is_deleted BOOLEAN DEFAULT false
  is_read BOOLEAN DEFAULT false 
); 

CREATE INDEX index_msg_room_created ON messages (room_id, created_at)

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

-- Read chat messages
-- SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC;
