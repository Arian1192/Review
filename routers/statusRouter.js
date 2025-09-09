const { Router } = require("express");

const StatusRouter = Router();

StatusRouter.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = {
  StatusRouter,
};
