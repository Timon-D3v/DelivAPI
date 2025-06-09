import { Request, Response, Router } from "express";
import crypto from "crypto";
import multer from "multer";
import { createRawData } from "delivapi-client";
import { CONFIG } from "../config";
import { getEntryForUser } from "../helper/getEntry";

// This router serves under "/api"
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024 * 1024, // 1 GB
    },
});

router.post("/upload", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { mimeType, fileExtension, user } = req.body;
        const signature = req.headers["x-signature"];
        const timestamp = req.headers["x-timestamp"] as string;

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        if (!file || typeof file === "undefined" || !file.buffer || typeof file.buffer === "undefined" || file.buffer.length === 0) {
            throw new Error("No file provided or file is empty.");
        }

        const raw = await createRawData(file?.buffer as Buffer, user, mimeType, fileExtension, timestamp);

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(raw).digest("hex");

        if (signature !== expectedSignature) {
            res.status(403).json({
                error: "Invalid signature",
                message: "The provided signature does not match the expected signature.",
            });

            return;
        }

        res.json({
            error: false,
            message: "File uploaded successfully",
            url: `http://${CONFIG.HOST}:${CONFIG.PORT}/uploads/hallo`,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);

            res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
            });
        } else {
            console.error("An unexpected error occurred:", error);

            res.status(500).json({
                error: "Internal Server Error",
                message: "An unexpected error occurred while processing your request.",
            });
        }
    }
});

export default router;
