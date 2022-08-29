'use strict';

const path = require('path');

const migrations = {
  directory: path.join(__dirname, 'migrations')
};

const seeds = {
  directory: path.join(__dirname, 'seeds')
};

const baseConfig = {
  client: 'mysql2',
  version: '8.0',
  migrations,
  seeds
};

const connection = {
  host: process.env.AURASCAN_DB_HOST,
  user: process.env.AURASCAN_DB_USER,
  password: process.env.AURASCAN_DB_PASSWORD,
  database: process.env.AURASCAN_DB_NAME,
  port: process.env.AURASCAN_DB_PORT
};


module.exports = {
  development: {
    ...baseConfig,
    connection
  },
  test: {
    ...baseConfig,
    connection: {
      ...connection,
      database: process.env.AURASCAN_DB_NAME
    }
  },
  staging: {
    ...baseConfig,
    connection: {
      host: process.env.AURASCAN_DB_HOST,
      user: process.env.AURASCAN_DB_USER,
      password: process.env.AURASCAN_DB_PASSWORD,
      database: process.env.AURASCAN_DB_NAME,
      port: process.env.AURASCAN_DB_PORT
    }
  },
  production: {
    ...baseConfig,
    connection: {
      host: process.env.AURASCAN_DB_HOST,
      user: process.env.AURASCAN_DB_USER,
      password: process.env.AURASCAN_DB_PASSWORD,
      database: process.env.AURASCAN_DB_NAME,
      port: process.env.AURASCAN_DB_PORT
    },
    pool: {
      min: 1,
      max: 3
    }
  }
};