import { NextFunction, Request, Response } from "express";
import { extension } from "mime-types";
import { Cache } from "../helper/cache.ts";
import { CONFIG } from "../config.ts";
import { transformKeys } from "../helper/transform.ts";
import type { FileDetails } from "../index.d.ts";

const assetsCacheStore = new Cache(CONFIG.CACHE_ASSETS_MAX_SIZE, CONFIG.CACHE_ASSETS_LIMIT, CONFIG.CACHE_ASSETS_TTL, "Assets Cache");
const transformationCacheStore = new Cache(CONFIG.CACHE_TRANSFORMATION_MAX_SIZE, CONFIG.CACHE_TRANSFORMATION_LIMIT, CONFIG.CACHE_TRANSFORMATION_TTL, "Transformation Cache");

export function assetsCache(req: Request, res: Response, next: NextFunction): void {
    req.cacheAsset = (key: string, value: FileDetails) => {
        assetsCacheStore.set(key, {
            url: key,
            details: value,
            timestamp: Date.now(),
        });
    };

    if (req.query?.["no-cache"] || req.query?.["timestamp"]) {
        // If the request has a "no-cache" or "timestamp" query parameter, skip assets cache
        return next();
    }

    if (transformKeys.some((key) => key in req.query)) {
        // If the request has any transformation query parameters, don't use the assets cache
        return next();
    }

    const { filename } = req.params;
    const download = req.query?.["download"] === "true";

    // If we reach this point, the request is eligible for caching
    const url = req.originalUrl;
    const cachedFile = assetsCacheStore.get(url);

    if (cachedFile) {
        // If the file is found in the cache, send it as a response
        res.set({
            "Content-Type": cachedFile.details.mimetype,
            "Content-Length": cachedFile.details.file.length,
            "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}${extension(cachedFile.details.mimetype) ? "." + extension(cachedFile.details.mimetype) : ""}"`,
        });

        res.send(cachedFile.details.file);
        res.end();

        return;
    }

    // If the file is not found in the cache, proceed to the next middleware
    next();
}

export function transformationCache(req: Request, res: Response, next: NextFunction): void {
    req.cacheTransformation = (key: string, value: FileDetails) => {
        transformationCacheStore.set(key, {
            url: key,
            details: value,
            timestamp: Date.now(),
        });
    };

    if (req.query?.["no-cache"] || req.query?.["timestamp"]) {
        // If the request has a "no-cache" or "timestamp" query parameter, skip transformation cache
        return next();
    }

    const { filename } = req.params;
    const download = req.query?.["download"] === "true";

    // If we reach this point, the request is eligible for caching
    const url = req.originalUrl;
    const cachedFile = transformationCacheStore.get(url);

    if (cachedFile) {
        // If the file is found in the cache, send it as a response
        res.set({
            "Content-Type": cachedFile.details.mimetype,
            "Content-Length": cachedFile.details.file.length,
            "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}${extension(cachedFile.details.mimetype) ? "." + extension(cachedFile.details.mimetype) : ""}"`,
        });

        res.send(cachedFile.details.file);
        res.end();

        return;
    }

    // If the file is not found in the cache, proceed to the next middleware
    next();
}
