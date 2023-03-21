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
  await request.query("SELECT TOP 10 * FROM dbo.employees").then((results) => {
    if (results.recordset.length == 0) {
      return res.status(404).send({
        error: "No employees are found",
      });
    }
    return res.status(200).send(results.recordset);
  });
});

app.get("/api/employees/:id", async (req, res) => {
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${req.params.id}`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The employee with the ID ${req.params.id} was not found!`,
        });
      }
      res.status(200).send(results.recordset[0]);
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
    return res.status(400).send({
      error: "A new employee could not be created! All fields are required!",
      details:
        "Please provide the birth_date, first_name, last_name, gender and hire_date of the new employee!",
    });
  }
  await request
    .query("SELECT TOP 1 * FROM dbo.employees ORDER BY emp_no DESC")
    .then((lastEmployee) => {
      let employeeNumber = parseInt(lastEmployee.recordset[0].emp_no) + 1;
      const employee = {
        emp_no: employeeNumber,
        birth_date: req.body.birth_date,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        hire_date: req.body.hire_date,
      };

      if (employee.gender !== "M" && employee.gender !== "F") {
        res.status(400).send({
          error: "A new employee could not be created! The gender is invalid!",
          details: "Gender must be either 'M' or 'F'!",
        });
      } else {
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
          .then(() => {
            return res.status(201).send(employee);
          });
      }
    });
});

app.put("/api/employees/:id", async (req, res) => {
  request = new sql.Request(conn);
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${req.params.id}`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The employee with the ID ${req.params.id} was not found!`,
        });
      }
      if (
        !req.body.birth_date ||
        !req.body.first_name ||
        !req.body.last_name ||
        !req.body.gender ||
        !req.body.hire_date
      ) {
        return res.status(400).send({
          error: "The employee could not be updated! All fields are required!",
          details:
            "Please provide the birth_date, first_name, last_name, gender and hire_date of the employee!",
        });
      }
      const employee = {
        emp_no: req.params.id,
        birth_date: req.body.birth_date,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        hire_date: req.body.hire_date,
      };
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
        .then(() => {
          return res.status(200).send(employee);
        });
    });
});

app.delete("/api/employees/:id", async (req, res) => {
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${req.params.id}`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The employee with the ID ${req.params.id} was not found!`,
        });
      }
      request
        .query(`DELETE FROM dbo.employees WHERE emp_no = ${req.params.id}`)
        .then(() => {
          return res.status(204);
        });
    });
});

// ---------------------------------------------------------------------------

app.get("/api/departments", async (req, res) => {
  await request
    .query("SELECT * FROM dbo.departments ORDER BY dept_no")
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: "No departments are found",
        });
      }
      return res.status(200).send(results.recordset);
    });
});

app.get("/api/departments/:id", async (req, res) => {
  await request
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${req.params.id}'`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The department with the ID ${req.params.id} was not found!`,
        });
      }
      res.status(200).send(results.recordset[0]);
    });
});

app.post("/api/departments", async (req, res) => {
  request = new sql.Request(conn);
  await request
    .query("SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC")
    .then((lastDepartment) => {
      const getNumberFromString = parseInt(
        lastDepartment.recordset[0].dept_no.replace(/[^\d.]/g, "")
      );
      const departmentNumber =
        "d" + String(getNumberFromString + 1).padStart(3, "0");
      let result = createDepartmentName(50);

      const department = {
        dept_no: departmentNumber,
        dept_name: result,
      };

      request.input("dept_no", sql.NVarChar, department.dept_no);
      request.input("dept_name", sql.NVarChar, department.dept_name);
      request
        .query("INSERT INTO dbo.departments VALUES (@dept_no, @dept_name)")
        .then(() => {
          return res.status(201).send(department);
        });
    });
});

app.put("/api/departments/:id", async (req, res) => {
  request = new sql.Request(conn);
  await request
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${req.params.id}'`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The department with the ID ${req.params.id} was not found!`,
        });
      }
      let result = createDepartmentName(50);
      const department = {
        dept_no: req.params.id,
        dept_name: result,
      };
      request.input("dept_no", sql.NVarChar, req.params.id);
      request.input("dept_name", sql.NVarChar, department.dept_name);
      request
        .query(
          "UPDATE dbo.departments SET dept_name = @dept_name WHERE dept_no = @dept_no"
        )
        .then(() => {
          return res.status(200).send(department);
        });
    });
});

app.delete("/api/departments/:id", async (req, res) => {
  await request
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${req.params.id}'`)
    .then((results) => {
      if (results.recordset.length == 0) {
        return res.status(404).send({
          error: `The department with the ID ${req.params.id} was not found!`,
        });
      }
      request
        .query(`DELETE FROM dbo.departments WHERE dept_no = '${req.params.id}'`)
        .then(() => {
          return res.status(204);
        });
    });
});

function createDepartmentName(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
