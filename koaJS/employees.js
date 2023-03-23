require("dotenv").config({ path: "../db-connection/.env" });
const {
  getConnection,
  sqlConfig,
} = require("../db-connection/db-connection.js");

const sql = require("mssql");
const conn = getConnection(sqlConfig);
let request = new sql.Request(conn);
const Router = require("koa-router");

const router = new Router({
  prefix: "/api/employees",
});

router.get("/", async (ctx, next) => {
  await request.query("SELECT TOP 10 * FROM dbo.employees").then((results) => {
    if (results.recordset.length === 0) {
      ctx.status = 404;
      ctx.body = {
        error: "No employees are found!",
      };
    } else {
      ctx.status = 200;
      ctx.body = results.recordset;
    }
  });
  next();
});

router.get("/:id", async (ctx, next) => {
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${ctx.params.id}`)
    .then((results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The employee with the ID ${ctx.params.id} was not found!`,
        };
      } else {
        ctx.status = 200;
        ctx.body = results.recordset[0];
      }
    });
  next();
});

router.post("/", async (ctx, next) => {
  request = new sql.Request(conn);
  if (
    !ctx.request.body.birth_date ||
    !ctx.request.body.first_name ||
    !ctx.request.body.last_name ||
    !ctx.request.body.gender ||
    !ctx.request.body.hire_date
  ) {
    ctx.status = 400;
    ctx.body = {
      error: "A new employee could not be created! All fields are required!",
      details:
        "Please provide the birth_date, first_name, last_name, gender and hire_date of the new employee!",
    };
  } else {
    await request
      .query("SELECT TOP 1 * FROM dbo.employees ORDER BY emp_no DESC")
      .then(async (lastEmployee) => {
        const newEmployee = {
          emp_no: parseInt(lastEmployee.recordset[0].emp_no) + 1,
          birth_date: ctx.request.body.birth_date,
          first_name: ctx.request.body.first_name,
          last_name: ctx.request.body.last_name,
          gender: ctx.request.body.gender,
          hire_date: ctx.request.body.hire_date,
        };

        if (!isValidDate(newEmployee.birth_date)) {
          ctx.status = 400;
          ctx.body = {
            error:
              "A new employee could not be created! The birth_date is invalid!",
            details: "Birth date must have the format yyyy-mm-dd!",
          };
        } else if (
          newEmployee.first_name.length < 2 ||
          newEmployee.first_name.length > 14
        ) {
          ctx.status = 400;
          ctx.body = {
            error:
              "A new employee could not be created! The first_name is invalid!",
            details:
              "First name must have at least 2 characters and at most 14 characters!",
          };
        } else if (
          newEmployee.last_name.length < 2 ||
          newEmployee.last_name.length > 16
        ) {
          ctx.status = 400;
          ctx.body = {
            error:
              "A new employee could not be created! The last_name is invalid!",
            details:
              "Last name must have at least 2 characters and at most 16 characters!",
          };
        } else if (newEmployee.gender !== "M" && newEmployee.gender !== "F") {
          ctx.status = 400;
          ctx.body = {
            error:
              "A new employee could not be created! The gender is invalid!",
            details: "Gender must be either 'M' or 'F'!",
          };
        } else if (!isValidDate(newEmployee.hire_date)) {
          ctx.status = 400;
          ctx.body = {
            error:
              "A new employee could not be created! The hire_date is invalid!",
            details: "Hire date must have the format yyyy-mm-dd!",
          };
        } else {
          request.input("emp_no", sql.BigInt, newEmployee.emp_no);
          request.input("birth_date", sql.Date, newEmployee.birth_date);
          request.input("first_name", sql.NVarChar, newEmployee.first_name);
          request.input("last_name", sql.NVarChar, newEmployee.last_name);
          request.input("gender", sql.NVarChar, newEmployee.gender);
          request.input("hire_date", sql.Date, newEmployee.hire_date);
          await request
            .query(
              "INSERT INTO dbo.employees VALUES (@emp_no, @birth_date, @first_name, @last_name, @gender, @hire_date)"
            )
            .then(() => {
              ctx.status = 201;
              ctx.body = newEmployee;
            });
        }
      });
  }
  next();
});

router.put("/:id", async (ctx, next) => {
  request = new sql.Request(conn);
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${ctx.params.id}`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The employee with the ID ${ctx.params.id} was not found!`,
        };
      } else {
        if (
          !ctx.request.body.birth_date ||
          !ctx.request.body.first_name ||
          !ctx.request.body.last_name ||
          !ctx.request.body.gender ||
          !ctx.request.body.hire_date
        ) {
          ctx.status = 400;
          ctx.body = {
            error:
              "The employee could not be updated! All fields are required!",
            details:
              "Please provide the birth_date, first_name, last_name, gender and hire_date of the employee!",
          };
        } else {
          const updatedEmployee = {
            emp_no: ctx.params.id,
            birth_date: ctx.request.body.birth_date,
            first_name: ctx.request.body.first_name,
            last_name: ctx.request.body.last_name,
            gender: ctx.request.body.gender,
            hire_date: ctx.request.body.hire_date,
          };

         if (!isValidDate(updatedEmployee.birth_date)) {
           ctx.status = 400;
           ctx.body = {
             error:
               "The employee could not be updated! The birth_date is invalid!",
             details: "Birth date must have the format yyyy-mm-dd!",
           };
         } else if (
           updatedEmployee.first_name.length < 2 ||
           updatedEmployee.first_name.length > 14
         ) {
           ctx.status = 400;
           ctx.body = {
             error:
               "The employee could not be updated! The first_name is invalid!",
             details:
               "First name must have at least 2 characters and at most 14 characters!",
           };
         } else if (
           updatedEmployee.last_name.length < 2 ||
           updatedEmployee.last_name.length > 16
         ) {
           ctx.status = 400;
           ctx.body = {
             error:
               "The employee could not be updated! The last_name is invalid!",
             details:
               "Last name must have at least 2 characters and at most 16 characters!",
           };
         } else if (updatedEmployee.gender !== "M" && updatedEmployee.gender !== "F") {
           ctx.status = 400;
           ctx.body = {
             error: "The employee could not be updated! The gender is invalid!",
             details: "Gender must be either 'M' or 'F'!",
           };
         } else if (!isValidDate(updatedEmployee.hire_date)) {
           ctx.status = 400;
           ctx.body = {
             error:
               "The employee could not be updated! The hire_date is invalid!",
             details: "Hire date must have the format yyyy-mm-dd!",
           };
         } else {
           request.input("emp_no", sql.BigInt, updatedEmployee.emp_no);
           request.input("birth_date", sql.Date, updatedEmployee.birth_date);
           request.input(
             "first_name",
             sql.NVarChar,
             updatedEmployee.first_name
           );
           request.input("last_name", sql.NVarChar, updatedEmployee.last_name);
           request.input("gender", sql.NVarChar, updatedEmployee.gender);
           request.input("hire_date", sql.Date, updatedEmployee.hire_date);
           await request
             .query(
               "UPDATE dbo.employees SET birth_date = @birth_date, first_name = @first_name, last_name = @last_name, gender = @gender, hire_date = @hire_date WHERE emp_no = @emp_no"
             )
             .then(() => {
               ctx.status = 200;
               ctx.body = updatedEmployee;
             });
         }
        }
      }
    });
  next();
});

router.delete("/:id", async (ctx, next) => {
  await request
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${ctx.params.id}`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The employee with the ID ${ctx.params.id} was not found!`,
        };
      } else {
        await request
          .query(`DELETE FROM dbo.employees WHERE emp_no = ${ctx.params.id}`)
          .then(() => {
            ctx.status = 204;
          });
      }
    });
  next();
});

function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) != null;
}

module.exports = router;
