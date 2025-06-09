import { type Request, type Response, Router } from "express";
import crypto from "crypto";
import multer from "multer";
import { createRawData, type DelivApiResponse } from "delivapi-client";
import { getEntryForUser } from "../helper/getEntry.ts";
import { saveFile } from "../helper/saveFile.ts";
import { primaryIdToFilename } from "../helper/filenames.ts";
import { CONFIG } from "../config.ts";

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

        try {
            if (!file || typeof file === "undefined" || !file.buffer || typeof file.buffer === "undefined" || file.buffer.length === 0) {
                throw new Error("No file provided or file is empty.");
            }

            if (!mimeType || typeof mimeType !== "string") {
                throw new Error("Invalid or missing mimeType.");
            }

            if (typeof fileExtension === "undefined") {
                // Check only if the fileExtension is undefined
                // To upload a file without a fileExtension is ok
                throw new Error("Missing fileExtension. If you want to upload a file without a fileExtension, please send an empty string.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }

            if (!timestamp || typeof timestamp !== "string") {
                throw new Error("Missing or invalid timestamp header.");
            }
        } catch (error) {
            const response: DelivApiResponse = {
                error: true,
                message: `Bad Request - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request. Please check the request format and try again."}`,
            };

            res.status(400).json(response);
            return;
        }

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        const raw = await createRawData(file?.buffer as Buffer, user, mimeType, fileExtension, timestamp);

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(raw).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
            };

            res.status(403).json(response);
            return;
        }

        // Everything is fine, we can save the file

        //! Note: The file extension is not used anywhere, remove it in future versions if not needed
        const saveResult = await saveFile(user, mimeType, file?.buffer as Buffer);

        if (typeof saveResult !== "number") {
            throw saveResult;
        }

        const filename = primaryIdToFilename(saveResult);
        const URL = CONFIG.ORIGIN + "/cdn/" + user + "/" + filename;

        const response: DelivApiResponse = {
            error: false,
            message: "File uploaded successfully.",
            url: URL,
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

export default router;
