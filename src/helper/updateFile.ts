import { type FieldPacket, type ResultSetHeader } from "mysql2";
import connection from "./connection.ts";

/**
 * Updates an existing file record (MIME type and file data) in the user-specific table in the `cdn` database,
 * matching the row by UUID.
 *
 * @async
 *
 * @param {string} user - The user identifier used as the table name (e.g., a per-user table in `cdn`).
 * @param {string} mimeType - The new MIME type to store (sets the `mimetype` column).
 * @param {Buffer} blob - The new file data to store (sets the `file` column).
 * @param {string} uuid - The UUID identifying which record to update (matched against the `uuid` column).
 *
 * @returns {Promise<number|Error>} A promise that resolves to the MySQL driver's `insertId` value from the UPDATE
 * result, or an {@link Error} instance if the update fails.
 */
export async function updateFile(user: string, mimeType: string, blob: Buffer, uuid: string): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("UPDATE `cdn`.`" + user + "` SET `mimetype` = ?, `file` = ? WHERE `uuid` = ?;", [mimeType, blob, uuid]);

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
