import { type FieldPacket, type ResultSetHeader } from "mysql2";
import connection from "./connection.ts";

/**
 * Updates a file in the user's CDN table in the database.
 *
 * @param {string} user - The username whose table the file will be updated in.
 * @param {string} mimeType - The MIME type of the file being updated.
 * @param {Buffer} blob - The file data as a Buffer.
 *
 * @returns {Promise<number | Error>} - The insert ID of the saved file on success, or an Error object on failure.
 */
export async function updateFile(user: string, mimeType: string, blob: Buffer, fileId: number): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("UPDATE `cdn`.`" + user + "` SET `mimetype` = ?, `file` = ? WHERE `id` = ?;", [mimeType, blob, fileId]);

        return result.insertId;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return error;
        } else {
            console.error("An unexpected error occurred:", error);
            return new Error("An unexpected error occurred");
        }
    }
}
