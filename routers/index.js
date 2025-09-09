const { Router } = require("express");
const { PlaceRouter } = require("./placeRouter");
const { StatusRouter } = require("./statusRouter");
const { BotRouter } = require("./BotRouter");

const MainRouter = Router();

MainRouter.use("/places", PlaceRouter);
MainRouter.use("/bot", BotRouter);
MainRouter.use("/status", StatusRouter);

module.exports = {
  MainRouter,
};
