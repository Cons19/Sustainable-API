const sql = require("mssql");
require("dotenv").config();

const sqlConfig = {
  user: process.env.DB_USER, // better stored in an app setting such as process.env.DB_USER
  password: process.env.DB_PASS, // better stored in an app setting such as process.env.DB_PASSWORD
  server: process.env.DB_HOST, // better stored in an app setting such as process.env.DB_SERVER
  port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
  database: process.env.DB_NAME, // better stored in an app setting such as process.env.DB_NAME
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

function getConnection(config) {
  // Create connection instance
  const conn = new sql.ConnectionPool(config);
  conn
    .connect()
    // Successfull connection
    .then(function () {
      // Create request instance, passing in connection instance
    })
    // Handle connection errors
    .catch(function (err) {
      console.log(err);
      conn.close();
    });
    return conn;
}

module.exports = { getConnection, sqlConfig };
