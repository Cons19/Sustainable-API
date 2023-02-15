import { Meteor } from "meteor/meteor";
import { LinksCollection } from "/imports/api/links";
import url from "url";
import bodyParser from "body-parser";

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

// Query parameter: /example?param=something
// Path parameter: /example/1
// Both: /example/something?param=somethingElse

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use("/courses", (req, res, next) => {
  switch (req.method) {
    case "GET":
      res.setHeader("Content-Type", "application/json");
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
      var index = courses.indexOf(course);
      courses.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify(course));
      break;

    default:
      res.writeHead(400);
      res.end("HTTP method not supported");
      break;
  }
});

Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if ((await LinksCollection.find().countAsync()) === 0) {
    await insertLink({
      title: "Do the Tutorial",
      url: "https://www.meteor.com/tutorials/react/creating-an-app",
    });

    await insertLink({
      title: "Follow the Guide",
      url: "https://guide.meteor.com",
    });

    await insertLink({
      title: "Read the Docs",
      url: "https://docs.meteor.com",
    });

    await insertLink({
      title: "Discussions",
      url: "https://forums.meteor.com",
    });
  }
});
