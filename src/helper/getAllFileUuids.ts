import { type FieldPacket, type RowDataPacket } from "mysql2";
import connection from "./connection.ts";

/**
 * Retrieves all UUIDs from a given table in the `cdn` database.
 *
 * @async
 *
 * @param {string} database - The table name to query within the `cdn` schema.
 *
 * @returns {Promise<Array<{ uuid: string }>|Error>} A promise that resolves to an array of objects containing `uuid`
 * values, or an {@link Error} instance if the query fails or no rows are found.
 *
 * @throws {Error} Throws `"File not found"` when the query returns zero rows (this is caught internally and returned).
 */
export async function getAllUuids(database: string): Promise<{ uuid: string }[] | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT `uuid` FROM `cdn`.`" + database + "`;");

        if (rows.length === 0) {
            throw new Error("File not found");
        }

        return rows as { uuid: string }[];
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
 * Retrieves UUID and MIME type metadata for all records from a given table in the `cdn` database.
 *
 * @async
 *
 * @param {string} database - The table name to query within the `cdn` schema.
 *
 * @returns {Promise<Array<{ uuid: string; mimetype: string }>|Error>} A promise that resolves to an array of objects
 * containing `uuid` and `mimetype`, or an {@link Error} instance if the query fails or no rows are found.
 *
 * @throws {Error} Throws `"File not found"` when the query returns zero rows (this is caught internally and returned).
 */
export async function getAllMetadata(database: string): Promise<{ uuid: string; mimetype: string }[] | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT `uuid`, `mimetype` FROM `cdn`.`" + database + "`;");

        if (rows.length === 0) {
            throw new Error("File not found");
        }

        return rows as { uuid: string; mimetype: string }[];
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
