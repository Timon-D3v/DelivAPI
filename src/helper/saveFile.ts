import { type FieldPacket, type ResultSetHeader } from "mysql2";
import connection from "./connection.ts";

/**
 * Inserts a file record into the user-specific table in the `cdn` database.
 *
 * @async
 *
 * @param {string} user - The user identifier used as the table name (e.g., a per-user table in `cdn`).
 * @param {string} uuid - The UUID to store for the file (saved in the `uuid` column).
 * @param {string} mimeType - The MIME type of the file (saved in the `mimetype` column).
 * @param {Buffer} blob - The raw file data to store (saved in the `file` column).
 *
 * @returns {Promise<number | Error>} A promise that resolves to the MySQL driver's `insertId` for the inserted row,
 * or an {@link Error} instance if the insert fails.
 */
export async function saveFile(user: string, uuid: string, mimeType: string, blob: Buffer): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("INSERT INTO `cdn`.`" + user + "` (`uuid`, `mimetype`, `file`) VALUES (?, ?, ?);", [uuid, mimeType, blob]);

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

/**
 * Inserts a single chunk record for a file into the user-specific table in the `chunks` database.
 *
 * @async
 *
 * @param {string} user - The user identifier used as the table name (e.g., a per-user table in `chunks`).
 * @param {string} uuid - The UUID of the file this chunk belongs to (saved in the `uuid` column).
 * @param {number} chunkIndex - The chunk's index/order (saved in the `chunkIndex` column).
 * @param {Buffer} blob - The raw chunk data to store (saved in the `chunk` column).
 *
 * @returns {Promise<number|Error>} A promise that resolves to the MySQL driver's `insertId` for the inserted row,
 * or an {@link Error} instance if the insert fails.
 */
export async function saveChunk(user: string, uuid: string, chunkIndex: number, blob: Buffer): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("INSERT INTO `chunks`.`" + user + "` (`uuid`, `chunkIndex`, `chunk`) VALUES (?, ?, ?);", [uuid, chunkIndex, blob]);

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
