import express from "express";
import loggerMiddleware from "./src/loggerMiddleware.js";
import helmet from "helmet";

const app = express();
const port = process.env.PORT;

app.use(helmet())
app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
