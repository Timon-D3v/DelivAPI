import { json, type Request, type Response, Router } from "express";
import crypto from "crypto";
import multer from "multer";
import { DelivApiUpdateInitialChunkResponse, DelivApiUpdateResponse, DelivApiUploadChunkResponse, DelivApiUploadInitialChunkResponse, DelivApiUploadResponse, type DelivApiResponse } from "delivapi-client";
import { getEntryForUser } from "../helper/getEntry.ts";
import { saveChunk, saveFile } from "../helper/saveFile.ts";
import { CONFIG } from "../config.ts";
import { updateFile } from "../helper/updateFile.ts";
import { getFile } from "../helper/getFile.ts";
import { getAllMetadata, getAllUuids } from "../helper/getAllFileUuids.ts";
import { fileTypeFromBuffer } from "file-type";
import { deleteAllChunksForId, deleteFile } from "../helper/deleteFile.ts";

// This router serves under "/api"
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
    },
});

router.use(
    json({
        limit: "100mb",
    }),
);

router.post("/upload", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const user = req.body?.user;
        const signature = req.headers["x-signature"];

        try {
            if (!file || typeof file === "undefined" || !file.buffer || typeof file.buffer === "undefined" || file.buffer.length === 0) {
                throw new Error("No file provided or file is empty.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }
        } catch (error) {
            const response: DelivApiUploadResponse = {
                error: true,
                message: `Bad Request - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request. Please check the request format and try again."}`,
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        const mimeType = await fileTypeFromBuffer(file.buffer);

        if (!mimeType || !mimeType.mime) {
            const response: DelivApiUploadResponse = {
                error: true,
                message: "Unable to determine MIME type of the uploaded file. Please ensure the file is valid and try again.",
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(file.buffer).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiUploadResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
                url: null,
            };

            res.status(403).json(response);
            return;
        }

        // Everything is fine, we can save the file

        const randomUUID = crypto.randomUUID();

        const saveResult = await saveFile(user, randomUUID, mimeType.mime, file?.buffer as Buffer);

        if (typeof saveResult !== "number") {
            // It is possible that the UUID is already in use, but mysql will throw an error in this case, so we can just return an error response.
            // Since this is a very rare case, we can just ask the user to try again with a new file, which will generate a new UUID.
            throw saveResult;
        }

        const URL = CONFIG.ORIGIN + "/cdn/" + user + "/" + randomUUID;

        const response: DelivApiUploadResponse = {
            error: false,
            message: "File uploaded successfully.",
            url: URL,
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiUploadResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
            url: null,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

router.post("/update", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const user = req.body?.user;
        const filename = req.body?.filename;
        const signature = req.headers["x-signature"];

        try {
            if (!file || typeof file === "undefined" || !file.buffer || typeof file.buffer === "undefined" || file.buffer.length === 0) {
                throw new Error("No file provided or file is empty.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!filename || typeof filename !== "string") {
                throw new Error("Please provide a valid filename.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }
        } catch (error) {
            const response: DelivApiUpdateResponse = {
                error: true,
                message: `Bad Request - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request. Please check the request format and try again."}`,
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(file.buffer).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiUpdateResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
                url: null,
            };

            res.status(403).json(response);
            return;
        }

        const existingFile = await getFile(user, filename);

        if (existingFile instanceof Error) {
            const response: DelivApiUpdateResponse = {
                error: true,
                message: "File not found - The file you are trying to update does not exist.",
                url: null,
            };

            res.status(404).json(response);
            return;
        }

        const mimeType = await fileTypeFromBuffer(file.buffer);

        if (!mimeType || !mimeType.mime) {
            const response: DelivApiUpdateResponse = {
                error: true,
                message: "Unable to determine MIME type of the uploaded file. Please ensure the file is valid and try again.",
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        // Everything is fine, we can save the file

        const saveResult = await updateFile(user, mimeType.mime, file?.buffer as Buffer, filename);

        if (typeof saveResult !== "number") {
            throw saveResult;
        }

        const URL = CONFIG.ORIGIN + "/cdn/" + user + "/" + filename;

        const response: DelivApiUpdateResponse = {
            error: false,
            message: "File uploaded successfully.",
            url: URL,
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiUpdateResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
            url: null,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

router.post("/uploadInitialChunk", upload.single("chunk"), async (req: Request, res: Response): Promise<void> => {
    try {
        const chunk = req.file;
        const user = req.body?.user;
        const chunkCount = req.body?.chunkCount;
        const signature = req.headers["x-signature"];

        try {
            if (!chunk || typeof chunk === "undefined" || !chunk.buffer || typeof chunk.buffer === "undefined" || chunk.buffer.length === 0) {
                throw new Error("No chunk provided or chunk is empty.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!chunkCount || typeof chunkCount === "undefined" || isNaN(Number(chunkCount)) || Number(chunkCount) <= 0) {
                throw new Error("Please provide a valid chunk count.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }
        } catch (error) {
            const response: DelivApiUploadInitialChunkResponse = {
                error: true,
                message: `Bad Request - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request. Please check the request format and try again."}`,
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        const mimeType = await fileTypeFromBuffer(chunk.buffer);

        if (!mimeType || !mimeType.mime) {
            const response: DelivApiUploadInitialChunkResponse = {
                error: true,
                message: "Unable to determine MIME type of the uploaded chunk. Please ensure the chunk is valid and try again.",
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(chunk.buffer).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiUploadInitialChunkResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
                url: null,
            };

            res.status(403).json(response);
            return;
        }

        // Everything is fine, we can create the chunked file

        const randomUUID = crypto.randomUUID();

        const placeholder = {
            type: "chunked",
            uuid: randomUUID,
            mimetype: mimeType.mime,
            length: Number(chunkCount),
        };

        const placeholderBuffer = Buffer.from(JSON.stringify(placeholder));

        const saveResult = await saveFile(user, randomUUID, "application/json", placeholderBuffer);

        if (typeof saveResult !== "number") {
            // It is possible that the UUID is already in use, but mysql will throw an error in this case, so we can just return an error response.
            // Since this is a very rare case, we can just ask the user to try again with a new file, which will generate a new UUID.
            throw saveResult;
        }

        // The file is saved, now we can save the first chunk to the chunks table

        const chunkSaveResult = await saveChunk(user, randomUUID, 0, chunk.buffer);

        if (typeof chunkSaveResult !== "number") {
            // It is possible that the UUID is already in use, but mysql will throw an error in this case, so we can just return an error response.
            // Since this is a very rare case, we can just ask the user to try again with a new file, which will generate a new UUID.
            throw chunkSaveResult;
        }

        const URL = CONFIG.ORIGIN + "/cdn/" + user + "/" + randomUUID;

        const response: DelivApiUploadInitialChunkResponse = {
            error: false,
            message: "First Chunk uploaded successfully.",
            url: URL,
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiUploadInitialChunkResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
            url: null,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

router.post("/updateInitialChunk", upload.single("chunk"), async (req: Request, res: Response): Promise<void> => {
    try {
        const chunk = req.file;
        const user = req.body?.user;
        const chunkCount = req.body?.chunkCount;
        const filename = req.body?.filename;
        const signature = req.headers["x-signature"];

        try {
            if (!chunk || typeof chunk === "undefined" || !chunk.buffer || typeof chunk.buffer === "undefined" || chunk.buffer.length === 0) {
                throw new Error("No chunk provided or chunk is empty.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!chunkCount || typeof chunkCount === "undefined" || isNaN(Number(chunkCount)) || Number(chunkCount) <= 0) {
                throw new Error("Please provide a valid chunk count.");
            }

            if (!filename || typeof filename !== "string") {
                throw new Error("Please provide a valid filename.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }
        } catch (error) {
            const response: DelivApiUpdateInitialChunkResponse = {
                error: true,
                message: `Bad Request - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request. Please check the request format and try again."}`,
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        const entry = await getEntryForUser(user);

        if (entry instanceof Error) {
            throw entry;
        }

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(chunk.buffer).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiUpdateInitialChunkResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
                url: null,
            };

            res.status(403).json(response);
            return;
        }

        const existingFile = await getFile(user, filename);

        if (existingFile instanceof Error) {
            const response: DelivApiUpdateInitialChunkResponse = {
                error: true,
                message: "File not found - The file you are trying to update does not exist.",
                url: null,
            };

            res.status(404).json(response);
            return;
        }

        const mimeType = await fileTypeFromBuffer(chunk.buffer);

        if (!mimeType || !mimeType.mime) {
            const response: DelivApiUpdateInitialChunkResponse = {
                error: true,
                message: "Unable to determine MIME type of the uploaded chunk. Please ensure the chunk is valid and try again.",
                url: null,
            };

            res.status(400).json(response);
            return;
        }

        // Everything is fine, we can update the file

        const placeholder = {
            type: "chunked",
            uuid: filename,
            mimetype: mimeType.mime,
            length: Number(chunkCount),
        };

        const placeholderBuffer = Buffer.from(JSON.stringify(placeholder));

        const saveResult = await updateFile(user, "application/json", placeholderBuffer, filename);

        if (typeof saveResult !== "number") {
            // It is possible that the UUID is already in use, but mysql will throw an error in this case, so we can just return an error response.
            // Since this is a very rare case, we can just ask the user to try again with a new file, which will generate a new UUID.
            throw saveResult;
        }

        // The metadata for the old file is deleted, now we have to delete all existing chunks for this file if there are any.
        const chunkDeleteResult = await deleteAllChunksForId(user, filename);

        if (typeof chunkDeleteResult !== "number") {
            throw chunkDeleteResult;
        }

        // The file is saved, now we can save the first chunk to the chunks table

        const chunkSaveResult = await saveChunk(user, filename, 0, chunk.buffer);

        if (typeof chunkSaveResult !== "number") {
            // It is possible that the UUID is already in use, but mysql will throw an error in this case, so we can just return an error response.
            // Since this is a very rare case, we can just ask the user to try again with a new file, which will generate a new UUID.
            throw chunkSaveResult;
        }

        const URL = CONFIG.ORIGIN + "/cdn/" + user + "/" + filename;

        const response: DelivApiUpdateInitialChunkResponse = {
            error: false,
            message: "File uploaded successfully.",
            url: URL,
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiUpdateInitialChunkResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
            url: null,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

router.post("/uploadChunk", upload.single("chunk"), async (req: Request, res: Response): Promise<void> => {
    try {
        const chunk = req.file;
        const user = req.body?.user;
        const chunkIndex = req.body?.chunkIndex;
        const filename = req.body?.filename;

        const signature = req.headers["x-signature"];

        try {
            if (!chunk || typeof chunk === "undefined" || !chunk.buffer || typeof chunk.buffer === "undefined" || chunk.buffer.length === 0) {
                throw new Error("No chunk provided or chunk is empty.");
            }

            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!chunkIndex || typeof chunkIndex === "undefined" || isNaN(Number(chunkIndex)) || Number(chunkIndex) < 0) {
                throw new Error("Please provide a valid chunk index.");
            }

            if (!filename || typeof filename !== "string") {
                throw new Error("Please provide a valid filename.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
            }
        } catch (error) {
            const response: DelivApiUploadChunkResponse = {
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

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(chunk.buffer).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiUploadChunkResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
            };

            res.status(403).json(response);
            return;
        }

        const existingFile = await getFile(user, filename);

        if (existingFile instanceof Error) {
            const response: DelivApiUploadChunkResponse = {
                error: true,
                message: "File not found - The file you are trying to update does not exist.",
            };

            res.status(404).json(response);
            return;
        }

        try {
            const json = JSON.parse(existingFile.file.toString());

            if (json.type !== "chunked") {
                const response: DelivApiUploadChunkResponse = {
                    error: true,
                    message: "The existing file is not a chunked file. Cannot upload chunk.",
                };

                res.status(400).json(response);
                return;
            }

            if (Number(chunkIndex) >= Number(json.length)) {
                const response: DelivApiUploadChunkResponse = {
                    error: true,
                    message: "Chunk index out of bounds. Cannot upload chunk.",
                };

                res.status(400).json(response);
                return;
            }
        } catch (error) {
            const response: DelivApiUploadChunkResponse = {
                error: true,
                message: "The existing file is not a chunked file. Cannot upload chunk.",
            };

            res.status(400).json(response);
            return;
        }

        // Everything is fine, we can append the chunk to the existing file

        const saveResult = await saveChunk(user, filename, chunkIndex, chunk.buffer);

        if (typeof saveResult !== "number") {
            throw saveResult;
        }

        const response: DelivApiUploadChunkResponse = {
            error: false,
            message: "File uploaded successfully.",
        };

        res.json(response);
    } catch (error) {
        const response: DelivApiUploadChunkResponse = {
            error: true,
            message: `Internal Server Error - ${error instanceof Error ? error.message : "An unexpected error occurred while processing your request."}`,
        };

        console.error(response.message);

        res.status(500).json(response);
    }
});

router.post("/deleteFile", upload.none(), async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.body?.user;
        const filename = req.body?.filename;
        console.log("Delete request for user:", user, "filename:", filename);

        const signature = req.headers["x-signature"];

        try {
            if (!user || typeof user !== "string") {
                throw new Error("Please add a user.");
            }

            if (!filename || typeof filename !== "string") {
                throw new Error("Please add a filename.");
            }

            if (!signature || typeof signature !== "string") {
                throw new Error("Missing or invalid signature header.");
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

        const expectedSignature = crypto.createHmac("sha256", entry.key).update(user).update(filename).digest("hex");

        if (signature !== expectedSignature) {
            const response: DelivApiResponse = {
                error: true,
                message: "Invalid signature - The provided signature does not match the expected signature.",
            };

            res.status(403).json(response);
            return;
        }

        // Verification complete, now we can delete the file

        const deleteResult = await deleteFile(user, filename);

        if (typeof deleteResult !== "number") {
            throw deleteResult;
        }

        const chunkDeleteResult = await deleteAllChunksForId(user, filename);

        if (typeof chunkDeleteResult !== "number") {
            throw chunkDeleteResult;
        }

        const response: DelivApiResponse = {
            error: false,
            message: "File deleted successfully or does not exist.",
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

router.post("/getAllFileUrls", async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.body?.user;

        if (!user || typeof user !== "string") {
            const response: DelivApiResponse = {
                error: true,
                message: "Please add a user.",
            };

            res.status(400).json(response);
            return;
        }

        const data = await getAllUuids(user);

        if (data instanceof Error) {
            throw data;
        }

        const urls = data.map((item) => {
            return `${CONFIG.ORIGIN}/cdn/${user}/${item.uuid}`;
        });

        const response: DelivApiResponse & { urls: string[] } = {
            error: false,
            message: "File URLs retrieved successfully.",
            urls,
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

router.post("/getFilesMetadata", async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.body?.user;

        if (!user || typeof user !== "string") {
            const response: DelivApiResponse = {
                error: true,
                message: "Please add a user.",
            };

            res.status(400).json(response);
            return;
        }

        const data = await getAllMetadata(user);

        if (data instanceof Error) {
            throw data;
        }

        const metadata = data.map((item: { uuid: string; mimetype: string }): { uuid: string; url: string; mimetype: string } => {
            return {
                uuid: item.uuid,
                url: `${CONFIG.ORIGIN}/cdn/${user}/${item.uuid}`,
                mimetype: item.mimetype,
            };
        });

        const response: DelivApiResponse & { metadata: { uuid: string; url: string; mimetype: string }[] } = {
            error: false,
            message: "Metadata for all files retrieved successfully.",
            metadata,
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
