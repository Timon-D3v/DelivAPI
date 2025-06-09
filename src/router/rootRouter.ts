import { type Request, type Response, Router } from "express";

// This router serves under "/"
const router = Router();

router.get("/", (req: Request, res: Response): void => {
    res.status(200).json("DelivAPI is running!");
});

export default router;
