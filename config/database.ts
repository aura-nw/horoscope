'use strict';

const environment = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../knexfile')[environment];
// eslint-disable-next-line @typescript-eslint/no-var-requires
module.exports = require('knex')(config);
