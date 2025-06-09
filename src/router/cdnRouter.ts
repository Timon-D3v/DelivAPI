import { type Request, type Response, Router } from "express";
import { filenameToPrimaryId, verifyFilename } from "../helper/filenames.ts";
import { getFile } from "../helper/getFile.ts";

// This router serves under "/cdn"
const router = Router();

router.get("/:database/:filename", async (req: Request, res: Response): Promise<void> => {
    const { database, filename } = req.params;

    const valid = verifyFilename(filename);

    if (!valid) {
        res.status(400).json({
            error: true,
            message: "Invalid filename format. Please ensure the filename is a valid hexadecimal string and meets the required criteria.",
        });
        return;
    }

    const id = filenameToPrimaryId(filename);

    const fileDetails = await getFile(database, id);

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

    res.set({
        "Content-Type": fileDetails.mimetype,
        "Content-Length": fileDetails.file.length,
        "Content-Disposition": `inline; filename="${filename}"`,
    });

    res.send(fileDetails.file);
    res.end();
});

export default router;
