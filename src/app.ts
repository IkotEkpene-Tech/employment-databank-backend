import applyAssociations from "./models/associations";
import express, { NextFunction, Request, Response, Application } from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { errorUtilities } from "./utilities";
import configurations from "./configurations";
import { syncDatabases } from "./configurations/syncDb";
import routers from "./routes";

const app: Application = express();

app.disable("x-powered-by");

// Model associations
applyAssociations();

app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Auth"],
  exposedHeaders: ["X-Refresh-Auth", "verif-hash"],
};

app.use(cors(corsOptions));

app.use(logger("dev"));
app.use(cookieParser());

app.use('/api/v1', routers)

// Health Check
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome To Ikot Ekpene Employment Portal");
});

// Global Error Handler
app.use(errorUtilities.globalErrorHandler);


(async () => {
  await syncDatabases();
  app.listen(configurations.PORT, () => {
    console.log(`Server running on Port ${configurations.PORT}`);
  });
})();

export default app;
