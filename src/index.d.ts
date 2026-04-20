export type Config = {
    ENV: "dev" | "prod";
    HOST: string;
    PORT: number;
    MYSQL_HOST: string;
    MYSQL_PORT: number;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_SCHEMA: string;
    ORIGIN: string;
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
