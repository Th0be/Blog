import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import * as queries from "./queries";

//Aliases
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet()); //Header security
app.use(morgan("short")); // Logs
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", queries.root);
app.get("/categories", queries.getCategories);
app.get("/types", queries.getTypes);
app.get("/records", queries.getRecords);
app.get("/record/:id", queries.getRecord);
app.put("/record/:id", queries.editRecord);
app.delete("/record/:id", queries.deleteRecord);
app.post("/record", queries.createRecord);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.log(error);
    response.status(500).json({
      message:
        "Our developers made a mistake, sorry ☹️. He will get a lower salary! 😄",
    });
  }
);

//Port listening
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
