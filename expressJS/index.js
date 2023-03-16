require("dotenv").config({ path: "../db-connection/.env" });
const {
  getConnection,
  sqlConfig,
} = require("../db-connection/db-connection.js");
const express = require("express");
const app = express();
const sql = require("mssql");
const conn = getConnection(sqlConfig);
let request = new sql.Request(conn);
app.use(express.json());

app.get("/api/employees", async (req, res) => {
  await request.query("SELECT TOP 100 * FROM dbo.employees").then((results) => {
    if (results.recordset.length == 0) {
      return res.status(404).send("No employees are found");
    }
    return res.status(200).send(results.recordset);
  });
});

app.get("/api/employees/:id", async (req, res) => {
  await request
    .query(
      "SELECT * FROM dbo.employees WHERE emp_no = " + parseInt(req.params.id)
    )
    .then((results) => {
      if (results.recordset.length == 0) {
        return res
          .status(404)
          .send("The employee with the given ID was not found");
      }
      res.status(200).send(results.recordset);
    });
});

app.post("/api/employees", async (req, res) => {
  request = new sql.Request(conn);
  if (
    !req.body.birth_date ||
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.gender ||
    !req.body.hire_date
  ) {
    return res.status(400).send("All fields are required");
  }
  await request
    .query("SELECT COUNT(*) as total FROM dbo.employees")
    .then((results) => {
      let employeeNumber = results.recordset[0].total + 1;
      const employee = {
        emp_no: employeeNumber.toString(),
        birth_date: req.body.birth_date,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        hire_date: req.body.hire_date,
      };
      request.input("emp_no", sql.BigInt, employee.emp_no);
      request.input("birth_date", sql.Date, employee.birth_date);
      request.input("first_name", sql.NVarChar, employee.first_name);
      request.input("last_name", sql.NVarChar, employee.last_name);
      request.input("gender", sql.NVarChar, employee.gender);
      request.input("hire_date", sql.Date, employee.hire_date);
      request
        .query(
          "INSERT INTO dbo.employees VALUES (@emp_no, @birth_date, @first_name, @last_name, @gender, @hire_date)"
        )
        .then((results) => {
          return res.status(201).send(employee);
        });
    });
});

app.put("/api/employees/:id", async (req, res) => {
  request = new sql.Request(conn);
  await request
    .query(
      "SELECT * FROM dbo.employees WHERE emp_no = " + parseInt(req.params.id)
    )
    .then((results) => {
      if (results.recordset.length == 0) {
        return res
          .status(404)
          .send("The employee with the given ID was not found");
      }
      if (
        !req.body.birth_date ||
        !req.body.first_name ||
        !req.body.last_name ||
        !req.body.gender ||
        !req.body.hire_date
      ) {
        return res.status(400).send("All fields are required");
      }
      const employee = {
        emp_no: req.params.id,
        birth_date: req.body.birth_date,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        hire_date: req.body.hire_date,
      };
      console.log(employee);
      request.input("emp_no", sql.BigInt, req.params.id);
      request.input("birth_date", sql.Date, employee.birth_date);
      request.input("first_name", sql.NVarChar, employee.first_name);
      request.input("last_name", sql.NVarChar, employee.last_name);
      request.input("gender", sql.NVarChar, employee.gender);
      request.input("hire_date", sql.Date, employee.hire_date);
      request
        .query(
          "UPDATE dbo.employees SET birth_date = @birth_date, first_name = @first_name, last_name = @last_name, gender = @gender, hire_date = @hire_date WHERE emp_no = @emp_no"
        )
        .then((results) => {
          console.log(results.recordset);
          return res.status(204).send(employee);
        });
    });
});

app.delete("/api/employees/:id", async (req, res) => {
  await request
    .query(
      "SELECT * FROM dbo.employees WHERE emp_no = " + parseInt(req.params.id)
    )
    .then((results) => {
      console.log(results.recordset);
      if (results.recordset.length == 0) {
        return res
          .status(404)
          .send("The employee with the given ID was not found");
      }
      request
        .query(
          "DELETE FROM dbo.employees WHERE emp_no = " + parseInt(req.params.id)
        )
        .then((results) => {
          return res.status(200).send(results.recordset);
        });
    });
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
