require("dotenv").config({ path: "../db-connection/.env" });
const {
  getConnection,
  sqlConfig,
} = require("../db-connection/db-connection.js");
const fastify = require("fastify")({
  logger: false,
});
const sql = require("mssql");
const conn = getConnection(sqlConfig);
let req = new sql.Request(conn);

fastify.get("/api/employees", async (request, reply) => {
  await req.query("SELECT TOP 10 * FROM dbo.employees").then((results) => {
    if (results.recordset.length === 0) {
      reply.code(404).send({
        error: "No employees are found",
      });
    } else {
      reply.code(200).send(results.recordset);
    }
  });
});

fastify.get("/api/employees/:id", async (request, reply) => {
  await req
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${request.params.id}`)
    .then((results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The employee with the ID ${request.params.id} was not found!`,
        });
      } else {
        reply.code(200).send(results.recordset[0]);
      }
    });
});

fastify.post("/api/employees", async (request, reply) => {
  req = new sql.Request(conn);
  if (
    !request.body.birth_date ||
    !request.body.first_name ||
    !request.body.last_name ||
    !request.body.gender ||
    !request.body.hire_date
  ) {
    reply.code(400).send({
      error: "A new employee could not be created! All fields are required!",
      details:
        "Please provide the birth_date, first_name, last_name, gender and hire_date of the new employee!",
    });
  } else {
    await req
      .query("SELECT TOP 1 * FROM dbo.employees ORDER BY emp_no DESC")
      .then(async (lastEmployee) => {
        const newEmployee = {
          emp_no: parseInt(lastEmployee.recordset[0].emp_no) + 1,
          birth_date: request.body.birth_date,
          first_name: request.body.first_name,
          last_name: request.body.last_name,
          gender: request.body.gender,
          hire_date: request.body.hire_date,
        };

        if (!isValidDate(newEmployee.birth_date)) {
          reply.code(400).send({
            error:
              "A new employee could not be created! The birth_date is invalid!",
            details: "Birth date must have the format yyyy-mm-dd!",
          });
        } else if (
          newEmployee.first_name.length < 2 ||
          newEmployee.first_name.length > 14
        ) {
          reply.code(400).send({
            error:
              "A new employee could not be created! The first_name is invalid!",
            details:
              "First name must have at least 2 characters and at most 14 characters!",
          });
        } else if (
          newEmployee.last_name.length < 2 ||
          newEmployee.last_name.length > 16
        ) {
          reply.code(400).send({
            error:
              "A new employee could not be created! The last_name is invalid!",
            details:
              "Last name must have at least 2 characters and at most 16 characters!",
          });
        } else if (newEmployee.gender !== "M" && newEmployee.gender !== "F") {
          reply.code(400).send({
            error:
              "A new employee could not be created! The gender is invalid!",
            details: "Gender must be either 'M' or 'F'!",
          });
        } else if (!isValidDate(newEmployee.hire_date)) {
          reply.code(400).send({
            error:
              "A new employee could not be created! The hire_date is invalid!",
            details: "Hire date must have the format yyyy-mm-dd!",
          });
        } else {
          req.input("emp_no", sql.BigInt, newEmployee.emp_no);
          req.input("birth_date", sql.Date, newEmployee.birth_date);
          req.input("first_name", sql.NVarChar, newEmployee.first_name);
          req.input("last_name", sql.NVarChar, newEmployee.last_name);
          req.input("gender", sql.NVarChar, newEmployee.gender);
          req.input("hire_date", sql.Date, newEmployee.hire_date);
          await req
            .query(
              "INSERT INTO dbo.employees VALUES (@emp_no, @birth_date, @first_name, @last_name, @gender, @hire_date)"
            )
            .then(() => {
              reply.code(201).send(newEmployee);
            });
        }
      });
  }
});

fastify.put("/api/employees/:id", async (request, reply) => {
  req = new sql.Request(conn);
  await req
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${request.params.id}`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The employee with the ID ${request.params.id} was not found!`,
        });
      } else {
        if (
          !request.body.birth_date ||
          !request.body.first_name ||
          !request.body.last_name ||
          !request.body.gender ||
          !request.body.hire_date
        ) {
          reply.code(400).send({
            error:
              "The employee could not be updated! All fields are required!",
            details:
              "Please provide the birth_date, first_name, last_name, gender and hire_date of the employee!",
          });
        } else {
          const updatedEmployee = {
            emp_no: request.params.id,
            birth_date: request.body.birth_date,
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            gender: request.body.gender,
            hire_date: request.body.hire_date,
          };

          if (!isValidDate(updatedEmployee.birth_date)) {
            reply.code(400).send({
              error:
                "The employee could not be updated! The birth_date is invalid!",
              details: "Birth date must have the format yyyy-mm-dd!",
            });
          } else if (
            updatedEmployee.first_name.length < 2 ||
            updatedEmployee.first_name.length > 14
          ) {
            reply.code(400).send({
              error:
                "The employee could not be updated! The first_name is invalid!",
              details:
                "First name must have at least 2 characters and at most 14 characters!",
            });
          } else if (
            updatedEmployee.last_name.length < 2 ||
            updatedEmployee.last_name.length > 16
          ) {
            reply.code(400).send({
              error:
                "The employee could not be updated! The last_name is invalid!",
              details:
                "Last name must have at least 2 characters and at most 16 characters!",
            });
          } else if (
            updatedEmployee.gender !== "M" &&
            updatedEmployee.gender !== "F"
          ) {
            reply.code(400).send({
              error:
                "The employee could not be updated! The gender is invalid!",
              details: "Gender must be either 'M' or 'F'!",
            });
          } else if (!isValidDate(updatedEmployee.hire_date)) {
            reply.code(400).send({
              error:
                "The employee could not be updated! The hire_date is invalid!",
              details: "Hire date must have the format yyyy-mm-dd!",
            });
          } else {
            req.input("emp_no", sql.BigInt, updatedEmployee.emp_no);
            req.input("birth_date", sql.Date, updatedEmployee.birth_date);
            req.input("first_name", sql.NVarChar, updatedEmployee.first_name);
            req.input("last_name", sql.NVarChar, updatedEmployee.last_name);
            req.input("gender", sql.NVarChar, updatedEmployee.gender);
            req.input("hire_date", sql.Date, updatedEmployee.hire_date);
            await req
              .query(
                "UPDATE dbo.employees SET birth_date = @birth_date, first_name = @first_name, last_name = @last_name, gender = @gender, hire_date = @hire_date WHERE emp_no = @emp_no"
              )
              .then(() => {
                reply.code(200).send(updatedEmployee);
              });
          }
        }
      }
    });
});

fastify.delete("/api/employees/:id", async (request, reply) => {
  await req
    .query(`SELECT * FROM dbo.employees WHERE emp_no = ${request.params.id}`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The employee with the ID ${request.params.id} was not found!`,
        });
      } else {
        await req
          .query(
            `DELETE FROM dbo.employees WHERE emp_no = ${request.params.id}`
          )
          .then(() => {
            reply.code(204);
          });
      }
    });
});

// ---------------------------------------------------------------------------

fastify.get("/api/departments", async (request, reply) => {
  await req
    .query("SELECT * FROM dbo.departments ORDER BY dept_no")
    .then((results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: "No departments are found",
        });
      } else {
        reply.code(200).send(results.recordset);
      }
    });
});

fastify.get("/api/departments/:id", async (request, reply) => {
  await req
    .query(
      `SELECT * FROM dbo.departments WHERE dept_no = '${request.params.id}'`
    )
    .then((results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The department with the ID ${request.params.id} was not found!`,
        });
      } else {
        reply.code(200).send(results.recordset[0]);
      }
    });
});

fastify.post("/api/departments", async (request, reply) => {
  req = new sql.Request(conn);
  if (!request.body.dept_name) {
    return reply.code(400).send({
      error: "A new department could not be created! All fields are required!",
      details: "Please provide the dept_name of the new department!",
    });
  } else {
    await req
      .query(
        `SELECT * FROM dbo.departments WHERE dept_name = '${request.body.dept_name}'`
      )
      .then(async (departments) => {
        if (departments.recordset.length !== 0) {
          return reply.code(400).send({
            error:
              "The department could not be created! The dept_name is invalid!",
            details: "The dept_name already exists!",
          });
        } else {
          await req
            .query("SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC")
            .then(async (lastDepartment) => {
              const getNumberFromString = parseInt(
                lastDepartment.recordset[0].dept_no.replace(/[^\d.]/g, "")
              );
              const newDepartmentNumber =
                "d" + String(getNumberFromString + 1).padStart(3, "0");

              const newDepartment = {
                dept_no: newDepartmentNumber,
                dept_name: request.body.dept_name,
              };

              req.input("dept_no", sql.NVarChar, newDepartment.dept_no);
              req.input("dept_name", sql.NVarChar, newDepartment.dept_name);
              await req
                .query(
                  "INSERT INTO dbo.departments VALUES (@dept_no, @dept_name)"
                )
                .then(() => {
                  reply.code(201).send(newDepartment);
                });
            });
        }
      });
  }
});

fastify.put("/api/departments/:id", async (request, reply) => {
  req = new sql.Request(conn);
  await req
    .query(
      `SELECT * FROM dbo.departments WHERE dept_no = '${request.params.id}'`
    )
    .then(async (results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The department with the ID ${request.params.id} was not found!`,
        });
      } else if (!request.body.dept_name) {
        return reply.code(400).send({
          error:
            "The department could not be updated! All fields are required!",
          details: "Please provide the dept_name of the department!",
        });
      } else {
        await req
          .query(
            `SELECT * FROM dbo.departments WHERE dept_name = '${request.body.dept_name}' AND dept_no != '${request.params.id}'`
          )
          .then(async (departments) => {
            if (departments.recordset.length !== 0) {
              return reply.code(400).send({
                error:
                  "The department could not be updated! The dept_name is invalid!",
                details: "The dept_name already exists!",
              });
            } else {
              const newDepartment = {
                dept_no: request.params.id,
                dept_name: request.body.dept_name,
              };

              req.input("dept_no", sql.NVarChar, newDepartment.dept_no);
              req.input("dept_name", sql.NVarChar, newDepartment.dept_name);
              await req
                .query(
                  "UPDATE dbo.departments SET dept_name = @dept_name WHERE dept_no = @dept_no"
                )
                .then(() => {
                  reply.code(201).send(newDepartment);
                });
            }
          });
      }
    });
});

fastify.delete("/api/departments/:id", async (request, reply) => {
  await req
    .query(
      `SELECT * FROM dbo.departments WHERE dept_no = '${request.params.id}'`
    )
    .then(async (results) => {
      if (results.recordset.length === 0) {
        reply.code(404).send({
          error: `The department with the ID ${request.params.id} was not found!`,
        });
      } else {
        await req
          .query(
            `DELETE FROM dbo.departments WHERE dept_no = '${request.params.id}'`
          )
          .then(() => {
            reply.code(204);
          });
      }
    });
});

function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) != null;
}

fastify.listen({ port: 3002, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});
