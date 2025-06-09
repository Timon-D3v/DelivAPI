import dotenv from "dotenv";
import type { Config } from "./index.d.ts";

dotenv.config();

export const CONFIG: Config = {
    ENV: process.env["ENV"] as "dev" | "prod",
    HOST: process.env["HOST"] as string,
    PORT: Number(process.env["PORT"]),

    SESSION_SECRET: process.env["SESSION_SECRET"] as string,

    MYSQL_HOST: process.env["MYSQL_HOST"] as string,
    MYSQL_PORT: Number(process.env["MYSQL_PORT"]),
    MYSQL_USER: process.env["MYSQL_USER"] as string,
    MYSQL_PASSWORD: process.env["MYSQL_PASSWORD"] as string,
    MYSQL_SCHEMA: process.env["MYSQL_SCHEMA"] as string,

    MAILJET_PUBLIC_KEY: process.env["MAILJET_PUBLIC_KEY"] as string,
    MAILJET_PRIVATE_KEY: process.env["MAILJET_PRIVATE_KEY"] as string,

    ORIGIN: process.env["ORIGIN"] as string,

    FILE_ID_ADDITION: 500_000,
};
