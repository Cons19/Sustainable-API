import bodyParser from "body-parser";

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use("/api/courses", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  switch (req.method) {
    case "GET":
      if (req.url.split("/")[1]) {
        var course = courses.find(
          (c) => c.id === parseInt(req.url.split("/")[1])
        );
        if (!course) {
          res.writeHead(400);
          res.end("The course with the given ID was not found");
        } else {
          res.writeHead(200);
          res.end(JSON.stringify(course));
        }
      } else {
        res.writeHead(200);
        res.end(JSON.stringify(courses));
      }
      break;

    case "POST":
      if (!req.body.name || req.body.name.length < 3) {
        res.writeHead(400);
        res.end("Name is required and should be minimum 3 characters");
      } else {
        var course = {
          id: courses.length + 1,
          name: req.body.name,
        };
        courses.push(course);
        res.writeHead(201);
        res.end(JSON.stringify(course));
      }
      break;

    case "PUT":
      var course = courses.find(
        (c) => c.id === parseInt(req.url.split("/")[1])
      );
      if (!course) {
        res.writeHead(404);
        res.end("The course with the given ID was not found");
      } else if (!req.body.name || req.body.name.length < 3) {
        res.writeHead(400);
        res.end("Name is required and should be minimum 3 characters");
      } else {
        course.name = req.body.name;
        res.writeHead(200);
        res.end(JSON.stringify(course));
      }
      break;

    case "DELETE":
      var course = courses.find(
        (c) => c.id === parseInt(req.url.split("/")[1])
      );
      if (!course) {
        res.writeHead(404);
        res.end("The course with the given ID was not found");
      }
      const index = courses.findIndex((obj) => obj.id === course.id);

      if (index > -1) {
        courses.splice(index, 1);
      }

      res.writeHead(200);
      res.end(JSON.stringify(course));
      break;

    default:
      res.writeHead(400);
      res.end("HTTP method not supported");
      break;
  }
});
