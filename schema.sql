DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    search_query VARCHAR (255) PRIMARY KEY,
    formatted_query VARCHAR (255),
    latitude FLOAT,
    longitude FLOAT
); 