import { type FieldPacket, type ResultSetHeader } from "mysql2";
import connection from "./connection.ts";

/**
 * Deletes a file record (row) identified by its UUID from the user-specific table in the `cdn` database.
 *
 * @async
 *
 * @param {string} user - The user identifier used as the table name (e.g., a per-user table in `cdn`).
 * @param {string} uuid - The UUID of the file record to delete (matched against the `uuid` column).
 *
 * @returns {Promise<number | Error>} A promise that resolves to the MySQL driver's `fieldCount` for the DELETE operation,
 * or an {@link Error} instance if the query fails.
 */
export async function deleteFile(user: string, uuid: string): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("DELETE FROM `cdn`.`" + user + "` WHERE `uuid` = ?;", [uuid]);

        return result.fieldCount;
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
 * Deletes all chunk records (rows) associated with a given UUID from the user-specific table in the `chunks` database.
 *
 * @async
 *
 * @param {string} user - The user identifier used as the table name (e.g., a per-user table in `chunks`).
 * @param {string} uuid - The UUID whose related chunk rows should be deleted (matched against the `uuid` column).
 * @returns {Promise<number | Error>} A promise that resolves to the MySQL driver's `fieldCount` for the DELETE operation,
 * or an {@link Error} instance if the query fails.
 */
export async function deleteAllChunksForId(user: string, uuid: string): Promise<number | Error> {
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query("DELETE FROM `chunks`.`" + user + "` WHERE `uuid` = ?;", [uuid]);

        return result.fieldCount;
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
