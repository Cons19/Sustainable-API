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

function getCustomers() {
  // Create connection instance
  var conn = new sql.ConnectionPool(sqlConfig);

  conn
    .connect()
    // Successfull connection
    .then(function (con) {
      // Create request instance, passing in connection instance
      var req = new sql.Request(conn);

      // Call mssql's query method passing in params
      req.query("SELECT * FROM dbo.departments").then((results) => {
        // all `int` columns will return a manipulated value as per the callback above
        console.log(results.recordset);
      });
    })
    // Handle connection errors
    .catch(function (err) {
      console.log(err);
      conn.close();
    });
}

getCustomers();
