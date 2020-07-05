DROP TABLE IF EXISTS pokemon;

CREATE TABLE pokemon (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url TEXT,
  pokedex_number VARCHAR(255),
  image TEXT
);