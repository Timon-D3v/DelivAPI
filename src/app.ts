import express from "express";
import rootRouter from "./router/rootRouter";
import { CONFIG } from "./config";

const app = express();

app.use("/", rootRouter);

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.info(`Server is running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
});
