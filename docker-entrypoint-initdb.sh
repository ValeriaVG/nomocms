#!/bin/bash

set -e
set -u

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE nomotest;
	    GRANT ALL PRIVILEGES ON DATABASE nomotest TO $POSTGRES_USER;
EOSQL