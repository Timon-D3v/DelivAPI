import type { User } from "../index.d.ts";
import { type RowDataPacket, type FieldPacket } from "mysql2";
import connection from "./connection.ts";

/**
 * Retrieves a user entry from the database by username.
 *
 * Executes a SQL query to fetch the user with the specified name from the `cdn.user` table.
 * If the user is found, returns the user object. If not found, or if an error occurs,
 * returns an Error object.
 *
 * @param {string} user - The username to search for in the database.
 *
 * @returns {Promise<User | Error>} - A Promise that resolves to a `User` object if found, or an `Error` if not found or on failure.
 */
export async function getEntryForUser(user: string): Promise<User | Error> {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await connection.query("SELECT * FROM `cdn`.`user` WHERE (`name` = ?);", [user]);

        if (rows.length === 0) {
            throw new Error("User not found");
        }

        return rows[0] as User;
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
