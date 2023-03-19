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
  await request
    .query("SELECT TOP 1 * FROM dbo.departments ORDER BY dept_no DESC")
    .then(async (lastDepartment) => {
      const getNumberFromString = parseInt(
        lastDepartment.recordset[0].dept_no.replace(/[^\d.]/g, "")
      );
      const newDepartmentNumber =
        "d" + String(getNumberFromString + 1).padStart(3, "0");
      const randomDepartmentName = createDepartmentName(50);

      const newDepartment = {
        dept_no: newDepartmentNumber,
        dept_name: randomDepartmentName,
      };

      request.input("dept_no", sql.NVarChar, newDepartment.dept_no);
      request.input("dept_name", sql.NVarChar, newDepartment.dept_name);
      await request
        .query("INSERT INTO dbo.departments VALUES (@dept_no, @dept_name)")
        .then(() => {
          ctx.status = 201;
          ctx.body = newDepartment;
        });
    });
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
      } else {
        let randomDepartmentName = createDepartmentName(50);

        const updatedDepartment = {
          dept_no: ctx.params.id,
          dept_name: randomDepartmentName,
        };
        request.input("dept_no", sql.NVarChar, updatedDepartment.dept_no);
        request.input("dept_name", sql.NVarChar, updatedDepartment.dept_name);
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

module.exports = router;
