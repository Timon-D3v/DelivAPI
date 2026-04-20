import { type FieldPacket, type RowDataPacket } from "mysql2";
import type { FileDetails } from "../index.d.ts";
import connection from "./connection.ts";

/**
 * Fetches a single file record from a given table in the `cdn` database by UUID.
 *
 * @async
 *
 * @param {string} database - The table name to query within the `cdn` schema.
 * @param {string} uuid - The UUID of the file record to fetch (matched against the `uuid` column).
 *
 * @returns {Promise<FileDetails|Error>} A promise that resolves to the matching {@link FileDetails} row, or an
 * {@link Error} instance if the query fails or no matching row is found.
 *
 * @throws {Error} Throws `"File not found"` when the query returns zero rows (this is caught internally and returned).
 */
export async function getFile(database: string, uuid: string): Promise<FileDetails | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT * FROM `cdn`.`" + database + "` WHERE (`uuid` = ?);", [uuid]);

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

/**
 * Retrieves all chunks for a given UUID from a table in the `chunks` database, ordered by `chunkIndex` ascending.
 *
 * @async
 *
 * @param {string} database - The table name to query within the `chunks` schema.
 * @param {string} uuid - The UUID whose chunk rows should be fetched (matched against the `uuid` column).
 *
 * @returns {Promise<Array<{ chunkIndex: number; chunk: Buffer }>|Error>} A promise that resolves to an array of chunk
 * objects (`chunkIndex`, `chunk`), or an {@link Error} instance if the query fails or no rows are found.
 *
 * @throws {Error} Throws `"File not found"` when the query returns zero rows (this is caught internally and returned).
 */
export async function getAllChunksForUuid(database: string, uuid: string): Promise<{ chunkIndex: number; chunk: Buffer }[] | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT `chunkIndex`, `chunk` FROM `chunks`.`" + database + "` WHERE (`uuid` = ?) ORDER BY `chunkIndex` ASC;", [uuid]);

        if (rows.length === 0) {
            throw new Error("File not found");
        }

        return rows as { chunkIndex: number; chunk: Buffer }[];
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
