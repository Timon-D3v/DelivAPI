import dotenv from "dotenv";
import process from "process";
import type { Config } from "./index.d.ts";

dotenv.config();

export const CONFIG: Config = {
    ENV: process.env["ENV"] as "dev" | "prod",
    HOST: process.env["HOST"] as string,
    PORT: Number(process.env["PORT"]),

    MYSQL_HOST: process.env["MYSQL_HOST"] as string,
    MYSQL_PORT: Number(process.env["MYSQL_PORT"]),
    MYSQL_USER: process.env["MYSQL_USER"] as string,
    MYSQL_PASSWORD: process.env["MYSQL_PASSWORD"] as string,
    MYSQL_SCHEMA: process.env["MYSQL_SCHEMA"] as string,

    ORIGIN: process.env["ORIGIN"] as string,

    CACHE_MAX_FILESIZE: (Number(process.env["CACHE_MAX_FILESIZE"]) || 50) * 1024 * 1024, // Convert MB to bytes
    CACHE_ASSETS_LIMIT: Number(process.env["CACHE_ASSETS_LIMIT"]) || 100,
    CACHE_ASSETS_MAX_SIZE: (Number(process.env["CACHE_ASSETS_MAX_SIZE"]) || 2048) * 1024 * 1024, // Convert MB to bytes
    CACHE_ASSETS_TTL: (Number(process.env["CACHE_ASSETS_TTL"]) || 24) * 60 * 60 * 1000, // Convert hours to milliseconds
    CACHE_TRANSFORMATION_LIMIT: Number(process.env["CACHE_TRANSFORMATION_LIMIT"]) || 1000,
    CACHE_TRANSFORMATION_MAX_SIZE: (Number(process.env["CACHE_TRANSFORMATION_MAX_SIZE"]) || 2048) * 1024 * 1024, // Convert MB to bytes
    CACHE_TRANSFORMATION_TTL: (Number(process.env["CACHE_TRANSFORMATION_TTL"]) || 24) * 60 * 60 * 1000, // Convert hours to milliseconds
};
