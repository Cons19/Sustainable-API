const Koa = require("koa");
const { koaBody } = require("koa-body");

const app = new Koa();

// middleware
app.use(koaBody());

// Require the routers
let courses = require("./courses.js");

// use the routes
app.use(courses.routes());

app.listen(3003);
