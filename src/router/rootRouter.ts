import { type Request, type Response, Router } from "express";

// This router serves under "/"
const router = Router();

router.get("/", (req: Request, res: Response): void => {
    res.status(200).json("DelivAPI is running!");
});

router.get("/health", (req: Request, res: Response): void => {
    res.status(200).json({
        healthy: true,
        message: "DelivAPI is running!",
        motd: "Make it work, make it right, make it fast. <3",
    });
});

export default router;
