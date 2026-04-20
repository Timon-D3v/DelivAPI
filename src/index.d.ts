import type { DelivApiResponse } from "delivapi-client";

export type Config = {
    ENV: "dev" | "prod";
    HOST: string;
    PORT: number;
    SESSION_SECRET: string;
    MYSQL_HOST: string;
    MYSQL_PORT: number;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_SCHEMA: string;
    MAILJET_PUBLIC_KEY: string;
    MAILJET_PRIVATE_KEY: string;
    ORIGIN: string;
    FILE_ID_ADDITION: number;
};

export type User = {
    id: number;
    name: string;
    key: string;
};

export type FileDetails = {
    uuid: number;
    mimetype: string;
    file: Buffer;
};

export type FileChunk = {
    id: number;
    uuid: number;
    chunkIndex: string;
    chunk: Buffer;
};
