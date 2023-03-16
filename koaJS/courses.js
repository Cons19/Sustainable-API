const Router = require("koa-router");

// Prefix all routes with: /items
const router = new Router({
  prefix: "/api/courses",
});

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

// Routes
router.get("/", (ctx, next) => {
  ctx.body = courses;
  next();
});

router.get("/:id", (ctx, next) => {
  let getCurrentCourse = courses.filter(function (course) {
    if (course.id == ctx.params.id) {
      return true;  
    }
  });

  if (getCurrentCourse.length) {
    ctx.body = getCurrentCourse[0];
  } else {
    ctx.response.status = 404;
    ctx.body = "Coourse not Found";
  }
  next();
});

router.post("/", (ctx, next) => {
  if (
    !ctx.request.body.id ||
    !ctx.request.body.name
  ) {
    ctx.response.status = 400;
    ctx.body = "Please enter the data";
  } else {
    let newCourse = courses.push({
      id: ctx.request.body.id,
      name: ctx.request.body.name
    });
    ctx.response.status = 201;
    ctx.body = `New course = added with id: ${ctx.request.body.id} & name: ${ctx.request.body.name}`;
  }
  next();
});

module.exports = router;
