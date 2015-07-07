#!/bin/bash

# Makes a relative path into a full path. I need it because references to files in PostgreSQL want absolute paths.
dir_resolve() {
    # thanks to http://stackoverflow.com/a/20901614/1218376
    local dir=`dirname "$1"`
    local file=`basename "$1"`
    pushd "$dir" &>/dev/null || return $? # On error, return error code
    echo "`pwd -P`/$file" # output full, link-resolved path with filename
    popd &> /dev/null
}

# Read the _README.md_. You need a PostGIS database for this thing to work.
export DATABASE_NAME=consolidated_centrepoint_geography

psql --set ON_ERROR_STOP=1 -dpostgres -c"DROP DATABASE IF EXISTS $DATABASE_NAME;"
psql --set ON_ERROR_STOP=1 -dpostgres -c"CREATE DATABASE $DATABASE_NAME;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;"

# Import local authority boundaries for Great Britain (England, Scotland and Wales)
# Notes:
# - Here, as in the rest of the script, I don't calculate areas from the geometries, but trust the original area measure
#   provided by the sources that I presume being more reliable.
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS gb_boundaries;"
shp2pgsql -I -c -W "latin1" -s EPSG:27700 "data/great_britain/Local_authority_district_(GB)_2011_Boundaries_(Generalised_Clipped)/LAD_DEC_2011_GB_BGC.shp" gb_boundaries | psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"ALTER TABLE gb_boundaries DROP COLUMN gid, DROP COLUMN lad11cdo, DROP COLUMN lad11nmw;"

# Import population for England and Wales
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS gb_population;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE gb_population (lad11cd CHAR(9), population INTEGER, area NUMERIC);"
csvfix exclude -f 1,2,4,6,7,8,9,10,12 "$(dir_resolve data/england_and_wales/ks101ew.csv)" | tail -n +2 | grep -v "^$" > data/england_and_wales/.temp.csv
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"COPY gb_population (lad11cd, population, area) FROM '$(dir_resolve data/england_and_wales/.temp.csv)' WITH CSV;"

# Import population for Scotland
# Note: the source data has a row for the Scotland total (Scotland's geography code is S92000003), so I need to drop
#       that.
csvfix exclude -f 4 data/scotland/Council\ Area\ blk/QS102SC.csv | csvfix edit -f 2,3 -e 's/,//g' | csvfix remove -f 1 -s 'S92000003' | tail -n +2 | grep -v "^$" > data/scotland/.temp.csv
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"COPY gb_population (lad11cd, population, area) FROM '$(dir_resolve data/scotland/.temp.csv)' WITH CSV;"

# Join the GB shapefile and population tables into a new _gb_ table
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS gb;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE gb AS (SELECT gb_boundaries.*, gb_population.population, gb_population.area FROM gb_boundaries INNER JOIN gb_population ON gb_boundaries.lad11cd = gb_population.lad11cd);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"ALTER TABLE gb ALTER COLUMN geom TYPE Geometry(MultiPolygon, 4326) USING ST_Transform(geom, 4326);"

# Import small area (SA) boundaries for Northern Ireland
# Note:
# - the Ordnance Survey of Northern Ireland uses a different spatial reference system than Great Britain: SRID 29901.
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni_boundaries;"
shp2pgsql -I -c -W "latin1" -s EPSG:29901 "data/ni/SA2011_Esri_Shapefile/SA2011.shp" ni_boundaries | psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"ALTER TABLE ni_boundaries DROP COLUMN gid, DROP COLUMN soa2011, DROP COLUMN x_coord, DROP COLUMN y_coord;"

# Select the relevant parts and convert the MS Excel source files to temporary CSV files
Rscript --vanilla process_ni.R

# Import the SA population data
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni_population;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE ni_population (sa2011 CHAR(9), population INTEGER);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"COPY ni_population FROM '$(dir_resolve data/ni/.temp.SAPE_SA_01_12.csv)' WITH CSV;"

# Import the SA-to-local authority lookup table
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni_sa_la_lookup;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE ni_sa_la_lookup (sa2011 CHAR(9), lgd2014 CHAR(9), lgd2014name VARCHAR);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"COPY ni_sa_la_lookup FROM '$(dir_resolve data/ni/.temp.11DC_Lookup.csv)' WITH CSV;"

# Join the shapefile and population tables into a new _ni_temp_1_ table
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni_temp_1;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE ni_temp_1 AS (SELECT ni_boundaries.*, ni_population.population FROM ni_boundaries INNER JOIN ni_population ON ni_boundaries.sa2011 = ni_population.sa2011);"

# Join the lookup table with _ni_temp_1_ above into _ni_temp_2_
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni_temp_2;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE ni_temp_2 AS (SELECT ni_temp_1.*, ni_sa_la_lookup.lgd2014, ni_sa_la_lookup.lgd2014name FROM ni_temp_1 INNER JOIN ni_sa_la_lookup ON ni_temp_1.sa2011 = ni_sa_la_lookup.sa2011);"

# Produce the final NI data
# Note that:
# - The _geom_ column is created explicitly because I had issues using the CREATE [table_name] AS [SELECT] form, that
#   did not inherit the SRID of the source table but used the default 0.
# - ST_Union returns a Polygon that I convert o MultiPolygon for consistency with the geometries in the _gb_ table.
# - The area is rounded to two digits for consistency with the GB data, and the rounding is done after the SUM to reduce
#   the error.
# - ST_Union is a computation-heavy operation, it takes more than one hour just to do the INSERT below, and because
#   the number of areas is the maximum possible, this takes longer than in the original script where we grouped by
#   districts.
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS ni;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE ni (lgd2014 CHAR(9), lgd2014name VARCHAR, population INTEGER, area NUMERIC);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"SELECT AddGeometryColumn('ni', 'geom', 4326, 'MultiPolygon', 2);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"INSERT INTO ni (lgd2014, lgd2014name, population, geom, area) SELECT 'N92000002' AS lgd2014, 'Northern Ireland' AS lgd2014name, sum(population) AS population, ST_Transform(ST_Multi(ST_SimplifyPreserveTopology(ST_Union(geom), 0.5)), 4326) AS geom, CAST(ROUND(CAST(SUM(hectares) AS NUMERIC), 2) AS NUMERIC) AS area FROM ni_temp_2;"

# Finally, create the UK table including a numeric index, suitable for importing as a QGIS layer, and a spatial index
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS uk;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE TABLE uk (gid SERIAL PRIMARY KEY, la_code CHAR(9), la_name VARCHAR, population INTEGER, area NUMERIC);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"SELECT AddGeometryColumn('uk', 'geom', 4326, 'MultiPolygon', 2);"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"INSERT INTO uk (la_code, la_name, population, geom, area) SELECT lad11cd, lad11nm, population, geom, area FROM gb;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"INSERT INTO uk (la_code, la_name, population, geom, area) SELECT lgd2014, lgd2014name, population, geom, area FROM ni;"
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"CREATE INDEX uk_idx_geom ON uk USING GIST (geom);"

# Clean up the temporary tables and CSV files
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"DROP TABLE IF EXISTS gb_boundaries; DROP TABLE IF EXISTS gb_population; DROP TABLE IF EXISTS gb; DROP TABLE IF EXISTS ni_boundaries; DROP TABLE IF EXISTS ni_population; DROP TABLE IF EXISTS ni_sa_la_lookup; DROP TABLE IF EXISTS ni_temp_1; DROP TABLE IF EXISTS ni_temp_2; DROP TABLE IF EXISTS ni;"
find data -name ".temp.*" -type f -delete

# dump everything to CSV and GeoJSON files
# Note that:
# - the use of _to_char_ is required to avoid PostgreSQL using the scientific format for bigger numbers
rm -rf uk_centrepoint.json uk_centrepoint.csv
psql --set ON_ERROR_STOP=1 -d$DATABASE_NAME -c"COPY (select la_code, la_name, to_char(population, '9999999') AS population, to_char(area, '999999999D99') AS area FROM uk) TO '$(dir_resolve uk_centrepoint.csv)' WITH CSV HEADER;"
ogr2ogr -f GeoJSON uk_centrepoint.json -lco COORDINATE_PRECISION=3 "PG:host=localhost dbname=$DATABASE_NAME" -sql "select * from uk;"
