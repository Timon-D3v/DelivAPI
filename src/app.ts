import express from "express";
import cors from "cors";
import rootRouter from "./router/rootRouter.ts";
import apiRouter from "./router/apiRouter.ts";
import cdnRouter from "./router/cdnRouter.ts";
import { CONFIG } from "./config.ts";

const app = express();

app.use(
    express.urlencoded({
        extended: true,
        limit: "10gb",
    }),
);

app.use(cors());

app.use("/", rootRouter);
app.use("/api", apiRouter);
app.use("/cdn", cdnRouter);

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.info(`Server is running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
});
