import Sharp from "sharp";
import type { FileDetails, TransformImageOptions, RawTransformImageOptions } from "../index.js";

export async function transformImage(file: FileDetails, rawOptions: RawTransformImageOptions): Promise<FileDetails> {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/tiff", "image/svg+xml"].includes(file.mimetype)) {
        // If the image is not in a supported format, return the original buffer
        return file;
    }

    const options: TransformImageOptions = {
        width: Number(rawOptions.width) || undefined,
        height: Number(rawOptions.height) || undefined,
        fit: ["contain", "cover", "fill", "inside", "outside"].includes(rawOptions.fit ?? "") ? (rawOptions.fit as "contain" | "cover" | "fill" | "inside" | "outside") : undefined,

        position: rawOptions.position,
        kernel: ["nearest", "cubic", "linear", "mitchell", "lanczos2", "lanczos3", "mks2013", "mks2021"].includes(rawOptions.kernel ?? "") ? (rawOptions.kernel as "nearest" | "cubic" | "linear" | "mitchell" | "lanczos2" | "lanczos3" | "mks2013" | "mks2021") : undefined,
        withoutReduction: rawOptions.withoutReduction === "true",
        fastShrinkOnLoad: rawOptions.fastShrinkOnLoad === "true",

        rotate: Number(rawOptions.rotate) || undefined,
        flip: rawOptions.flip === "true",
        flop: rawOptions.flop === "true",

        left: Number(rawOptions.left) || undefined,
        top: Number(rawOptions.top) || undefined,
        extractWidth: Number(rawOptions.extractWidth) || undefined,
        extractHeight: Number(rawOptions.extractHeight) || undefined,

        extendTop: Number(rawOptions.extendTop) || undefined,
        extendBottom: Number(rawOptions.extendBottom) || undefined,
        extendLeft: Number(rawOptions.extendLeft) || undefined,
        extendRight: Number(rawOptions.extendRight) || undefined,
        extendBackground: rawOptions.extendBackground || undefined,

        blur: Number(rawOptions.blur) || undefined,
        sharpen: Number(rawOptions.sharpen) || undefined,
        median: Number(rawOptions.median) || undefined,
        gamma: Number(rawOptions.gamma) || undefined,
        negate: rawOptions.negate === "true",
        normalize: rawOptions.normalize === "true",
        grayscale: rawOptions.grayscale === "true",
        claheWidth: Number(rawOptions.claheWidth) || undefined,
        claheHeight: Number(rawOptions.claheHeight) || undefined,
        claheMaxSlope: Number(rawOptions.claheMaxSlope) || undefined,

        brightness: Number(rawOptions.brightness) || undefined,
        saturation: Number(rawOptions.saturation) || undefined,
        hue: Number(rawOptions.hue) || undefined,
        lightness: Number(rawOptions.lightness) || undefined,

        tint: rawOptions.tint || undefined,

        quality: Number(rawOptions.quality) || undefined,
        progressive: rawOptions.progressive === "true",
        mozjpeg: rawOptions.mozjpeg === "true",
        lossless: rawOptions.lossless === "true",

        format: ["avif", "gif", "heif", "jp2", "jpeg", "png", "tiff", "webp"].includes(rawOptions.format ?? "") ? (rawOptions.format as "avif" | "gif" | "heif" | "jp2" | "jpeg" | "png" | "tiff" | "webp") : undefined,

        removeAlpha: rawOptions.removeAlpha === "true",
        ensureAlpha: Number(rawOptions.ensureAlpha) || undefined,

        withMetadata: rawOptions.withMetadata === "true",
    };

    if (
        !options.width &&
        !options.height &&
        !options.fit &&
        !options.position &&
        !options.kernel &&
        !options.withoutReduction &&
        !options.fastShrinkOnLoad &&
        !options.rotate &&
        !options.flip &&
        !options.flop &&
        !options.left &&
        !options.top &&
        !options.extractWidth &&
        !options.extractHeight &&
        !options.extendTop &&
        !options.extendBottom &&
        !options.extendLeft &&
        !options.extendRight &&
        !options.extendBackground &&
        !options.blur &&
        !options.sharpen &&
        !options.median &&
        !options.gamma &&
        !options.negate &&
        !options.normalize &&
        !options.grayscale &&
        !options.claheWidth &&
        !options.claheHeight &&
        !options.claheMaxSlope &&
        !options.brightness &&
        !options.saturation &&
        !options.hue &&
        !options.lightness &&
        !options.tint &&
        !options.quality &&
        !options.progressive &&
        !options.mozjpeg &&
        !options.lossless &&
        !options.format &&
        !options.removeAlpha &&
        options.ensureAlpha === undefined &&
        !options.withMetadata
    ) {
        // If no transformation options are provided, return the original buffer
        return file;
    }

    try {
        console.info(`Starting image transformation. MIME type: ${file.mimetype}, Size: ${file.file.length} bytes`);

        let image = Sharp(file.file, {
            animated: true,
        });

        if (options.extractWidth && options.extractHeight) {
            image = image.extract({
                left: options.left ?? 0,
                top: options.top ?? 0,
                width: options.extractWidth,
                height: options.extractHeight,
            });
        }

        if (options.width || options.height) {
            image = image.resize({
                width: options.width,
                height: options.height,
                fit: options.fit,
                position: options.position,
                kernel: options.kernel,
                withoutEnlargement: true,
                withoutReduction: options.withoutReduction,
                fastShrinkOnLoad: options.fastShrinkOnLoad,
            });
        }

        if (options.extendTop || options.extendBottom || options.extendLeft || options.extendRight) {
            image = image.extend({
                top: options.extendTop ?? 0,
                bottom: options.extendBottom ?? 0,
                left: options.extendLeft ?? 0,
                right: options.extendRight ?? 0,
                background: options.extendBackground,
            });
        }

        if (options.rotate !== undefined) {
            image = image.rotate(options.rotate);
        } else {
            image = image.rotate(); // Auto-rotate based on EXIF data
        }

        if (options.flip) {
            image = image.flip();
        }

        if (options.flop) {
            image = image.flop();
        }

        if (options.blur !== undefined) {
            image = image.blur(options.blur);
        }

        if (options.sharpen !== undefined) {
            image = image.sharpen({
                sigma: options.sharpen,
            });
        }

        if (options.median !== undefined) {
            image = image.median(options.median);
        }

        if (options.gamma !== undefined) {
            image = image.gamma(options.gamma);
        }

        if (options.negate) {
            image = image.negate();
        }

        if (options.normalize) {
            image = image.normalise();
        }

        if (options.grayscale) {
            image = image.grayscale();
        }

        if (options.claheWidth && options.claheHeight) {
            image = image.clahe({
                width: options.claheWidth,
                height: options.claheHeight,
                maxSlope: options.claheMaxSlope,
            });
        }

        if (options.brightness !== undefined || options.saturation !== undefined || options.hue !== undefined || options.lightness !== undefined) {
            image = image.modulate({
                brightness: options?.brightness ?? 1,
                saturation: options?.saturation ?? 1,
                hue: options?.hue ?? 0,
                lightness: options?.lightness ?? 1,
            });
        }

        if (options.tint) {
            image = image.tint(options.tint);
        }

        if (options.removeAlpha) {
            image = image.removeAlpha();
        }

        if (options.ensureAlpha !== undefined) {
            image = image.ensureAlpha(options.ensureAlpha);
        }

        if (options.colourspace) {
            image = image.toColourspace(options.colourspace);
        }

        if (options.withMetadata) {
            image = image.withMetadata();
        }

        switch (options.format) {
            case "jpeg":
                image = image.jpeg({
                    quality: options.quality,
                    progressive: options.progressive,
                    mozjpeg: options.mozjpeg,
                });
                break;

            case "png":
                image = image.png({
                    progressive: options.progressive,
                });
                break;

            case "webp":
                image = image.webp({
                    quality: options.quality,
                    lossless: options.lossless,
                });
                break;

            case "avif":
                image = image.avif({
                    quality: options.quality,
                    lossless: options.lossless,
                });
                break;

            case "gif":
                image = image.gif();
                break;

            case "tiff":
                image = image.tiff({
                    quality: options.quality,
                });
                break;

            case "heif":
                image = image.heif({
                    quality: options.quality,
                    lossless: options.lossless,
                });
                break;

            case "jp2":
                image = image.jp2({
                    quality: options.quality,
                });
                break;
        }

        const { data, info } = await image.toBuffer({
            resolveWithObject: true,
        });

        const mimeTypes: Record<string, string> = {
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            avif: "image/avif",
            gif: "image/gif",
            tiff: "image/tiff",
            heif: "image/heif",
            jp2: "image/jp2",
        };

        console.info(`Image transformed successfully. New MIME type: ${mimeTypes[info.format] ?? file.mimetype}, New size: ${data.length} bytes`);

        return {
            uuid: file.uuid,
            mimetype: mimeTypes[info.format] ?? file.mimetype,
            file: data,
        };
    } catch (error) {
        console.error("Error transforming image:", error);

        return file; // Return the original image buffer in case of an error
    }
}
