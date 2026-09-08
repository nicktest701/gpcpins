// db.js
const knexLib = require('knex');


// Validate required environment variables
// const requiredEnvVars = [
//   'DB_CLIENT',
//   'DB_HOST',
//   'DB_PORT',
//   'DB_USER',
//   'DB_PASSWORD',
//   'DB_NAME'
// ];
// for (const envVar of requiredEnvVars) {
//   if (process.env[envVar]) {
//     console.log(process.env[envVar])
//     // throw new Error(`Missing required environment variable: ${envVar}`);
//   }
// }

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create a Knex instance with environment-specific configuration.
 */
function createKnexInstance() {
  // Base connection config
  const connection = {
    host: process.env.DB_HOST,
    port:process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Development only: longer timeout and debug logging
  if (!isProduction) {
    connection.connectTimeout = 60000; // 60 seconds
  }

  // Pool configuration – tuned for stability and performance
  const pool = {
    min: 2,                 // Keep at least 2 connections ready
    max: isProduction ? 20 : 10, // Limit to avoid overloading the DB
    acquireTimeoutMillis: 30000,  // How long to wait for a connection
    idleTimeoutMillis: 30000,     // Close idle connections after 30 sec
    reapIntervalMillis: 1000,     // Check for idle connections every second
    createRetryIntervalMillis: 200, // Retry creating a connection every 200 ms
  };

  // Logging configuration
  const log = {
    warn(message) {
      console.warn(`[DB WARN] ${message}`);
    },
    error(message) {
      console.error(`[DB ERROR] ${message}`);
    },
    deprecate(message) {
      console.warn(`[DB DEPRECATION] ${message}`);
    },
    debug(message) {
      if (!isProduction) {
        console.debug(`[DB DEBUG] ${message}`);
      }
    },
  };

  const knex = knexLib({
    client: process.env.DB_CLIENT,
    connection,
    pool,
    log,
    // Enable query logging in development only
    debug: !isProduction && process.env.DB_DEBUG === 'true',
  });

  // Optional: log queries in development
  if (!isProduction && process.env.DB_QUERY_LOG === 'true') {
    knex.on('query', (query) => {
      console.debug(`[DB QUERY] ${query.sql} [${query.bindings}]`);
    });
  }

  // Log any query errors
  knex.on('query-error', (error, query) => {
    console.error(`[DB QUERY ERROR] ${error.message}`, {
      sql: query.sql,
      bindings: query.bindings,
    });
  });

  // Log pool events in development
  if (!isProduction) {
    knex.on('pool:create', () => console.debug('[DB POOL] Connection created'));
    knex.on('pool:destroy', () => console.debug('[DB POOL] Connection destroyed'));
    knex.on('pool:error', (err) => console.error('[DB POOL ERROR]', err));
  }

  return knex;
}

let knexInstance = null;

/**
 * Get (or create) the Knex instance. Ensures a singleton.
 */
function getKnexInstance() {
  if (!knexInstance) {
    knexInstance = createKnexInstance();

    // Test the connection on startup
    knexInstance.raw('SELECT 1')
      .then(() => {
        console.log('Database connection established successfully.');
      })
      .catch((err) => {
        console.error('Failed to connect to database:', err.message);
        console.error(err);
        // In production you might want to exit or retry
        if (isProduction) {
          process.exit(1);
        }
      });
  }
  return knexInstance;
}

// Graceful shutdown: close the connection pool when the app terminates
const shutdown = async () => {
  if (knexInstance) {
    console.log('Closing database connections...');
    await knexInstance.destroy();
    console.log('Database connections closed.');
  }
};

// Listen for termination signals
process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

// Export the singleton instance
module.exports = getKnexInstance();