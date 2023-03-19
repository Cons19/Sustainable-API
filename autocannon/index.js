const autocannon = require("autocannon");

autocannon(
  {
    url: "http://localhost:3000/api/courses",
    connections: 300, //default
    pipelining: 1, // default
    duration: 10, // default
  },
  console.log
);
