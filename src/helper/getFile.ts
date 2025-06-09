import { type FieldPacket, type RowDataPacket } from "mysql2";
import type { FileDetails } from "../index.d.ts";
import connection from "./connection.ts";

/**
 * Retrieves file details from the specified database table by primary ID.
 *
 * @param {string} database - The name of the database table to query.
 * @param {number} primaryId - The primary key ID of the file to retrieve.
 *
 * @returns {Promise<FileDetails | Error>} - A promise that resolves to the file details (`FileDetails`) if found, or an `Error` if not found or if an error occurs.
 *
 * @throws {Error} - If the file is not found or if a database/query error occurs.
 */
export async function getFile(database: string, primaryId: number): Promise<FileDetails | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT * FROM `cdn`.`" + database + "` WHERE (`id` = ?);", [primaryId]);

        if (rows.length === 0) {
            throw new Error("File not found");
        }

        return rows[0] as FileDetails;
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
