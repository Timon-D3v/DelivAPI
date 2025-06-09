import express from "express";
import rootRouter from "./router/rootRouter";
import apiRouter from "./router/apiRouter";
import { CONFIG } from "./config";

const app = express();


app.use(express.static("public"))

app.use("/", rootRouter);
app.use("/api", apiRouter);

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.info(`Server is running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
});
