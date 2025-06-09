import { CONFIG } from "../config.ts";
import { hexToNumber, toHexString } from "./numbers.ts";

/**
 * Verifies whether the provided filename is valid according to specific rules:
 * - The filename must exist and be a string.
 * - The filename must be a valid hexadecimal string that can be converted to a number.
 * - The numeric value of the filename, after subtracting CONFIG.FILE_ID_ADDITION, must be at least 1.
 *
 * @param {string} filename - The filename to verify.
 *
 * @returns {boolean} - `true` if the filename is valid, otherwise `false`.
 */
export function verifyFilename(filename: string): boolean {
    // Check if the filename exists
    if (!filename || typeof filename !== "string") {
        return false;
    }

    // Check if the filename has only valid characters
    try {
        // Attempt to convert the filename to a number
        // This will throw an error if the filename is not a valid hex string
        hexToNumber(filename);
    } catch (error) {
        return false;
    }

    // Check if the filename is too short
    if (hexToNumber(filename) - CONFIG.FILE_ID_ADDITION < 1) {
        // Smallest valid filename has primary_id = 1 added to FILE_ID_ADDITION
        return false;
    }

    return true;
}

/**
 * Converts a filename (assumed to be a hexadecimal string) to its corresponding primary ID number.
 * The function first converts the hexadecimal filename to a number, then subtracts a configured addition value.
 *
 * @param {string} filename - The filename represented as a hexadecimal string.
 *
 * @returns {number} - The primary ID as a number.
 */
export function filenameToPrimaryId(filename: string): number {
    return hexToNumber(filename) - CONFIG.FILE_ID_ADDITION;
}

/**
 * Converts a primary ID to a filename string by adding a configured offset and converting the result to a hexadecimal string.
 *
 * @param {number} primaryId - The primary numeric ID to be converted.
 *
 * @returns {string} - The resulting filename as a hexadecimal string.
 */
export function primaryIdToFilename(primaryId: number): string {
    return toHexString(primaryId + CONFIG.FILE_ID_ADDITION);
}
