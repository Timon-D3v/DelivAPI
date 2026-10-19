import type { FitEnum, Gravity, KernelEnum } from "sharp";

declare global {
    namespace Express {
        interface Request {
            cacheTransformation: (key: string, value: FileDetails) => void;
            cacheAsset: (key: string, value: FileDetails) => void;
        }
    }
}

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
    CACHE_MAX_FILESIZE: number;
    CACHE_ASSETS_LIMIT: number;
    CACHE_ASSETS_MAX_SIZE: number;
    CACHE_ASSETS_TTL: number;
    CACHE_TRANSFORMATION_LIMIT: number;
    CACHE_TRANSFORMATION_MAX_SIZE: number;
    CACHE_TRANSFORMATION_TTL: number;
};

export type User = {
    id: number;
    name: string;
    key: string;
};

export type FileDetails = {
    uuid: string;
    mimetype: string;
    file: Buffer;
};

export type FileChunk = {
    id: number;
    uuid: number;
    chunkIndex: string;
    chunk: Buffer;
};

export type CachedFile = {
    url: string;
    details: FileDetails;
    timestamp: number;
};

export interface TransformImageOptions {
    width?: number;
    height?: number;
    fit?: keyof FitEnum;
    position?: keyof Gravity | string;
    kernel?: keyof KernelEnum;
    withoutReduction?: boolean;
    fastShrinkOnLoad?: boolean;

    rotate?: number;
    flip?: boolean;
    flop?: boolean;

    left?: number;
    top?: number;
    extractWidth?: number;
    extractHeight?: number;

    extendTop?: number;
    extendBottom?: number;
    extendLeft?: number;
    extendRight?: number;
    extendBackground?: string;

    blur?: number;
    sharpen?: number;
    median?: number;
    gamma?: number;
    negate?: boolean;
    normalize?: boolean;
    grayscale?: boolean;
    claheWidth?: number;
    claheHeight?: number;
    claheMaxSlope?: number;

    brightness?: number;
    saturation?: number;
    hue?: number;
    lightness?: number;

    tint?: string;

    quality?: number;
    progressive?: boolean;
    mozjpeg?: boolean;
    lossless?: boolean;

    format?: "jpeg" | "png" | "webp" | "avif" | "gif" | "tiff" | "heif" | "jp2";

    removeAlpha?: boolean;
    ensureAlpha?: number;

    withMetadata?: boolean;

    colourspace?: "srgb" | "rgb" | "cmyk" | "lab" | "b-w";
}

export interface RawTransformImageOptions {
    width?: string;
    height?: string;
    fit?: string;
    position?: string;
    kernel?: string;
    withoutReduction?: string;
    fastShrinkOnLoad?: string;

    rotate?: string;
    flip?: string;
    flop?: string;

    left?: string;
    top?: string;
    extractWidth?: string;
    extractHeight?: string;

    extendTop?: string;
    extendBottom?: string;
    extendLeft?: string;
    extendRight?: string;
    extendBackground?: string;

    blur?: string;
    sharpen?: string;
    median?: string;
    gamma?: string;
    negate?: string;
    normalize?: string;
    grayscale?: string;
    claheWidth?: string;
    claheHeight?: string;
    claheMaxSlope?: string;

    brightness?: string;
    saturation?: string;
    hue?: string;
    lightness?: string;

    tint?: string;

    quality?: string;
    progressive?: string;
    mozjpeg?: string;
    lossless?: string;

    format?: string;

    removeAlpha?: string;
    ensureAlpha?: string;

    withMetadata?: string;

    colourspace?: string;
}
