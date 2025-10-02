const express = require("express");
const morgan = require("morgan");
const { MainRouter } = require("./apps/reviewer_service/routers");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));
app.use(MainRouter);

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
