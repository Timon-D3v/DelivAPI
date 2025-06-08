/**
 * Converts a non-negative number to its hexadecimal string representation.
 *
 * @param {number} number - The non-negative number to convert.
 *
 * @returns {string} - The hexadecimal string representation of the input number.
 *
 * @throws {Error} - If the input number is negative.
 */
export function toHexString(number: number): string {
    if (number < 0) {
        throw new Error("Negative numbers cannot be converted to hex string.");
    }

    return number.toString(16);
}

/**
 * Converts a hexadecimal string to a number.
 *
 * @param {string} hexString - The hexadecimal string to convert. May optionally start with "0x".
 *
 * @returns {number} - The numeric value represented by the hexadecimal string.
 *
 * @throws {Error} - If the input string is not a valid hexadecimal number.
 */
export function hexToNumber(hexString: string): number {
    if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
    }

    const number = parseInt(hexString, 16);

    if (isNaN(number)) {
        throw new Error("Invalid hex string.");
    }

    return number;
}
