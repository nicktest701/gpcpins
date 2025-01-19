/**
 * @type {Knex}
 */
let knex;
if (process.env.NODE_ENV !== 'production') {
  knex = require('knex')({
    client: process.env.DB_LOCAL_CLIENT,
    connection: {
      // host: process.env.DB_LOCAL_HOST,
      // port: process.env.DB_LOCAL_PORT,
      // user: process.env.DB_LOCAL_USER,
      // password: process.env.DB_LOCAL_PASSWORD,
      // database: process.env.DB_LOCAL_NAME,

      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,


    },
    pool: {
      max: 50,
      min: 2,
      "createTimeoutMillis": 3000,
      "acquireTimeoutMillis": 30000,
      "idleTimeoutMillis": 30000,
      "reapIntervalMillis": 1000,
      "createRetryIntervalMillis": 100,
      "propagateCreateError": false

    },
    log: {
      warn(message) {
        console.warn(`[WARN] ${message}`);
      },
      error(message) {
        console.error(`[ERROR] ${message}`);
      },
      deprecate(message) {
        console.error(`[DEPRECATE] ${message}`);
      },
      debug(message) {
        console.error(`[DEBUG] ${message}`);
      },
    },
  });
} else {
  knex = require('knex')({
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    // pool: { min: 0, max: 10 },
    pool: {
      max: 50,
      min: 2,
      "createTimeoutMillis": 3000,
      "acquireTimeoutMillis": 30000,
      "idleTimeoutMillis": 30000,
      "reapIntervalMillis": 1000,
      "createRetryIntervalMillis": 100,
      "propagateCreateError": false

    },
  });
}

// Log pool activity
knex.on('query', (query) => {
  // console.log(`SQL Query: ${query.sql}`);
});

knex.on('query-error', (error, obj) => {
  console.error(`Query Error: ${error.message}`);
});

knex.on('query-response', (response, obj, builder) => {
  // console.log('Query Response:', response);
});


module.exports = knex;
