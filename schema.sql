DROP TABLE IF EXISTS covid;
CREATE TABLE covid(
    id SERIAL PRIMARY KEY,
    country VARCHAR(200),
    totalconfirmed VARCHAR(200),
    totaldeaths VARCHAR(200),
    totalrecovered VARCHAR(200),
    date DATE
)