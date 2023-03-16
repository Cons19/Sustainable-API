require("dotenv").config({ path: "../db-connection/.env" });
const {
  getConnection,
  sqlConfig,
} = require("../db-connection/db-connection.js");
const express = require("express");
const app = express();
const sql = require("mssql");
const conn = getConnection(sqlConfig);
const query = new sql.Request(conn);
app.use(express.json());

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

app.get("/api/employees", async (req, res) => {
  await query.query("SELECT TOP 100 * FROM dbo.employees").then((results) => {
    console.log(results.recordset);
    res.status(200).send(results.recordset);
  });
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given ID was not found");
  return res.status(200).send(course);
});

app.post("/api/courses", (req, res) => {
  if (!req.body.name || req.body.name.length < 3) {
    return res
      .status(400)
      .send("Name is required and should be minimum 3 characters");
  }
  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  return res.status(201).send(course);
});

app.put("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given ID was not found");

  if (!req.body.name || req.body.name.length < 3) {
    return res
      .status(400)
      .send("Name is required and should be minimum 3 characters");
  }

  course.name = req.body.name;
  return res.status(200).send(course);
});

app.delete("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given ID was not found");

  const index = courses.indexOf(course);
  courses.splice(index, 1);
  return res.status(200).send(course);
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
