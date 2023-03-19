const Koa = require("koa");
const { koaBody } = require("koa-body");

const app = new Koa();

// middleware
app.use(koaBody());

// Require the routers
const employees = require("./employees.js");
const departments = require("./departments.js");

// use the routes
app.use(employees.routes());
app.use(departments.routes());

app.listen(3003, function () {
  console.log("KoaJS server running on port 3003!");
});
