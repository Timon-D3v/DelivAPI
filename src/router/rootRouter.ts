import { Request, Response, Router } from "express";

// This router serves under "/"
const router = Router();

router.get("/", (req: Request, res: Response): void => {
    res.sendFile("./public/index.html", {
        root: "./",
    });
});

export default router;
