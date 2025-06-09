import { User } from "../index.js";
import { RowDataPacket, FieldPacket } from "mysql2";
import connection from "./connection.database.js";

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
