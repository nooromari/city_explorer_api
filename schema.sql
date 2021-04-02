DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query varchar(255),
    formatted_query varchar(255),
    latitude varchar(255),
    longitude varchar(255)
);