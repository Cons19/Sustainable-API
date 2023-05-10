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
  prefix: "/api/departments",
});

router.get("/", async (ctx, next) => {
  await request
    .query("SELECT * FROM dbo.departments ORDER BY dept_no")
    .then((results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: "No departments are found!",
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
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${ctx.params.id}'`)
    .then((results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The department with the ID ${ctx.params.id} was not found!`,
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
  if (!ctx.request.body.dept_name) {
    ctx.status = 400;
    ctx.body = {
      error: "A new department could not be created! All fields are required!",
      details: "Please provide the dept_name of the new department!",
    };
  } else {
    await request
      .query(
        `SELECT * FROM dbo.departments WHERE dept_name = '${ctx.request.body.dept_name}'`
      )
      .then(async (departments) => {
        if (departments.recordset.length !== 0) {
          ctx.status = 400;
          ctx.body = {
            error:
              "The department could not be created! The dept_name is invalid!",
            details: "The dept_name already exists!",
          };
        } else {
          await request
            .query("SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC")
            .then(async (lastDepartment) => {
              const getNumberFromString = parseInt(
                lastDepartment.recordset[0].dept_no.replace(/[^\d.]/g, "")
              );
              const newDepartmentNumber =
                "d" + String(getNumberFromString + 1).padStart(3, "0");

              const newDepartment = {
                dept_no: newDepartmentNumber,
                dept_name: ctx.request.body.dept_name,
              };

              request.input("dept_no", sql.NVarChar, newDepartment.dept_no);
              request.input("dept_name", sql.NVarChar, newDepartment.dept_name);
              await request
                .query(
                  "INSERT INTO dbo.departments VALUES (@dept_no, @dept_name)"
                )
                .then(() => {
                  ctx.status = 201;
                  ctx.body = newDepartment;
                });
            });
        }
      });
  }
  next();
});

router.put("/:id", async (ctx, next) => {
  request = new sql.Request(conn);
  await request
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${ctx.params.id}'`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The department with the ID ${ctx.params.id} was not found!`,
        };
      } else if (!ctx.request.body.dept_name) {
        ctx.status = 400;
        ctx.body = {
          error:
            "The department could not be updated! All fields are required!",
          details: "Please provide the dept_name of the department!",
        };
      } else {
        await request
          .query(
            `SELECT * FROM dbo.departments WHERE dept_name = '${ctx.request.body.dept_name}' AND dept_no != '${ctx.params.id}'`
          )
          .then(async (departments) => {
            if (departments.recordset.length !== 0) {
              ctx.status = 400;
              ctx.body = {
                error:
                  "The department could not be updated! The dept_name is invalid!",
                details: "The dept_name already exists!",
              };
            } else {
              const updatedDepartment = {
                dept_no: ctx.params.id,
                dept_name: ctx.request.body.dept_name,
              };
              request.input("dept_no", sql.NVarChar, updatedDepartment.dept_no);
              request.input(
                "dept_name",
                sql.NVarChar,
                updatedDepartment.dept_name
              );
              await request
                .query(
                  "UPDATE dbo.departments SET dept_name = @dept_name WHERE dept_no = @dept_no"
                )
                .then(() => {
                  ctx.status = 200;
                  ctx.body = updatedDepartment;
                });
            }
          });
      }
    });
  next();
});

router.delete("/:id", async (ctx, next) => {
  await request
    .query(`SELECT * FROM dbo.departments WHERE dept_no = '${ctx.params.id}'`)
    .then(async (results) => {
      if (results.recordset.length === 0) {
        ctx.status = 404;
        ctx.body = {
          error: `The department with the ID ${ctx.params.id} was not found!`,
        };
      } else {
        await request
          .query(
            `DELETE FROM dbo.departments WHERE dept_no = '${ctx.params.id}'`
          )
          .then(() => {
            ctx.status = 204;
          });
      }
    });
  next();
});

module.exports = router;
