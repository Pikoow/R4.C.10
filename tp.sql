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

--WBIMPORT -type=text
--         -file='Countries-Continents.csv'
--         -table='pays_continent'
--         -header=true
--         -delimiter=','
--         -quoteChar='"';

--WBIMPORT -type=text
--         -file='worldcities.csv'
--         -table='ville'
--         -header=true
--         -delimiter=','
--         -quoteChar='"';

-- Le nombre de villes par pays
SELECT DISTINCT(pays_continent.country) AS nom_pays, COUNT(ville.id) AS nombre_de_villes
FROM pays_continent JOIN ville ON pays_continent.country = ville.country
GROUP BY pays_continent.country;

-- Le nombre de pays par continent
SELECT DISTINCT(pays_continent.continent) AS nom_continent, COUNT(pays_continent.country) AS nombre_de_pays
FROM pays_continent 
GROUP BY pays_continent.continent;

-- Le nombre de villes par continent
SELECT DISTINCT(pays_continent.continent) AS nom_continent, COUNT(ville.id) AS nombre_de_ville
FROM pays_continent JOIN ville ON pays_continent.country = ville.country
GROUP BY pays_continent.continent;

-- Le nombre moyen de villes par continent
SELECT COUNT(ville.id) / COUNT(DISTINCT pays_continent.continent) AS moyenne_villes_par_continent
FROM pays_continent JOIN ville ON pays_continent.country = ville.country;

-- Le nombre maximum de pays par continent
SELECT pays_continent.continent, COUNT(country) AS nombre_de_pays
FROM pays_continent
GROUP BY continent
ORDER BY nombre_de_pays DESC
LIMIT 1;
