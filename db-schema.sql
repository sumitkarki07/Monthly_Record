-- Residents table
CREATE TABLE IF NOT EXISTS residents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT
);

-- Monthly registers (e.g. December 2025)
CREATE TABLE IF NOT EXISTS registers (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT registers_month_year_unique UNIQUE (month, year)
);

-- Entries within a register
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  register_id INTEGER REFERENCES registers(id) ON DELETE CASCADE,
  resident_id INTEGER REFERENCES residents(id),
  date DATE NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

