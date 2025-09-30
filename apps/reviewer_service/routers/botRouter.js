const { Router } = require("express");
const { BotController } = require("../controllers/botController");
const BotRouter = Router();

BotRouter.post("/generate-review", BotController.generateReview);

module.exports = {
  BotRouter,
};
