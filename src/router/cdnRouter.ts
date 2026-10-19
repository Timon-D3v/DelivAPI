import { type Request, type Response, Router } from "express";
import { extension } from "mime-types";
import { getAllChunksForUuid, getFile } from "../helper/getFile.ts";
import { transformImage, transformKeys } from "../helper/transform.ts";
import { assetsCache, transformationCache } from "../middleware/cache.ts";
import { CONFIG } from "../config.ts";

// This router serves under "/cdn"
const router = Router();

router.get("/:database/:filename", assetsCache, transformationCache, async (req: Request, res: Response): Promise<void> => {
    const { database, filename } = req.params;
    const download = req.query?.["download"] === "true";

    if (Array.isArray(database) || Array.isArray(filename)) {
        res.status(400).json({
            error: true,
            message: "Invalid request parameters.",
        });

        return;
    }

    const fileDetails = await getFile(database, filename);

    if (fileDetails instanceof Error) {
        if (fileDetails.message === "File not found") {
            res.status(404).json({
                error: true,
                message: "File not found.",
            });

            return;
        }

        res.status(500).json({
            error: true,
            message: "An unexpected error occurred while retrieving the file.",
        });

        return;
    }

    try {
        const json = JSON.parse(fileDetails.file.toString());

        if (json.type === "chunked") {
            // This is a chunked file, we need to retrieve all chunks and combine them before sending the response
            res.set({
                "Content-Type": json.mimetype,
                "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}${extension(json.mimetype) ? "." + extension(json.mimetype) : ""}"`,
                // We don't set the Content-Length header here because we don't know the total size of the combined chunks yet
            });

            const chunks = await getAllChunksForUuid(database, filename);

            if (chunks instanceof Error) {
                if (chunks.message === "File not found") {
                    res.status(404).json({
                        error: true,
                        message: "File not found.",
                    });

                    return;
                }

                res.status(500).json({
                    error: true,
                    message: "An unexpected error occurred while retrieving the file.",
                });

                return;
            }

            chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

            const concatenatedBuffer = Buffer.concat(chunks.map((chunk) => chunk.chunk));

            const transformedFileDetails = await transformImage(
                {
                    uuid: fileDetails.uuid,
                    mimetype: json.mimetype,
                    file: concatenatedBuffer,
                },
                req.query,
            );

            if (transformedFileDetails.file.length < CONFIG.CACHE_MAX_FILESIZE * 1024 * 1024) {
                // Cache the assets if the file size is less than the maximum cache file size
                if (transformKeys.some((key) => key in req.query)) {
                    req.cacheTransformation(req.originalUrl, transformedFileDetails);
                } else {
                    req.cacheAsset(req.originalUrl, transformedFileDetails);
                }
            }

            res.set({
                "Content-Type": transformedFileDetails.mimetype,
                "Content-Length": transformedFileDetails.file.length,
                "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}${extension(transformedFileDetails.mimetype) ? "." + extension(transformedFileDetails.mimetype) : ""}"`,
            });

            res.send(transformedFileDetails.file);

            res.end();
            return;
        }

        console.warn("File is not chunked but has a JSON structure. This might indicate a problem with the file storage or retrieval logic. Sending the file as is, but this should be investigated.");
    } catch (error) {
        // File is not a JSON, assuming it's a regular file and sending it as is.
    }

    const transformedFileDetails = await transformImage(fileDetails, req.query);

    if (transformedFileDetails.file.length < CONFIG.CACHE_MAX_FILESIZE * 1024 * 1024) {
        // Cache the assets if the file size is less than the maximum cache file size
        if (transformKeys.some((key) => key in req.query)) {
            req.cacheTransformation(req.originalUrl, transformedFileDetails);
        } else {
            req.cacheAsset(req.originalUrl, transformedFileDetails);
        }
    }

    res.set({
        "Content-Type": transformedFileDetails.mimetype,
        "Content-Length": transformedFileDetails.file.length,
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}${extension(transformedFileDetails.mimetype) ? "." + extension(transformedFileDetails.mimetype) : ""}"`,
    });

    res.send(transformedFileDetails.file);
    res.end();
});

export default router;
