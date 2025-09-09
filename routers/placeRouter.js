const { Router } = require("express");

const PlaceRouter = Router();

PlaceRouter.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = {
  PlaceRouter,
};
