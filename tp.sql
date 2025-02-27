CREATE SCHEMA IF NOT EXISTS r4c10;

SET SCHEMA 'r4c10';

CREATE TABLE IF NOT EXISTS pays_continent (
    continent VARCHAR(50),
    country   VARCHAR(50),
    PRIMARY KEY (country)
);

CREATE TABLE IF NOT EXISTS ville (
    city         VARCHAR(60),
    city_ascii   VARCHAR(60),
    lat          FLOAT,
    lng          FLOAT,
    country      VARCHAR(60),
    iso2         VARCHAR(2), 
    iso3         VARCHAR(3),     
    admin_name   VARCHAR(500),
    capital      VARCHAR(60),
    population   INTEGER,
    id           INTEGER,
    FOREIGN KEY (country) REFERENCES pays_continent(country)
);

WBIMPORT -type=text
         -file='Countries-Continents.csv'
         -table='pays_continent'
         -header=true
         -delimiter=','
         -quoteChar='"';

WBIMPORT -type=text
         -file='worldcities.csv'
         -table='ville'
         -header=true
         -delimiter=','
         -quoteChar='"';
