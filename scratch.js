import pako from 'pako';

// Helper to convert Uint8Array to Base64
function uint8ArrayToBase64(uint8Array) {
    return btoa(String.fromCharCode(...uint8Array));
}

// Helper to convert Base64 to Uint8Array
function base64ToUint8Array(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Compress and encode
function compressAndEncode(input) {
    const compressed = pako.deflate(input); // Compress to Uint8Array
    const base64 = uint8ArrayToBase64(compressed); // Convert to Base64
    return base64;
}

// Decode and decompress
function decodeAndDecompress(base64) {
    const compressed = base64ToUint8Array(base64); // Convert Base64 back to Uint8Array
    const decompressed = pako.inflate(compressed, { to: 'string' }); // Decompress to string
    return decompressed;
}

// Example usage
const originalString = "This is a large string that needs to be compressed and encoded for transmission.";
console.log("Original:", originalString);

// Compress and encode
const compressedBase64 = compressAndEncode(originalString);
console.log("Compressed and Encoded:", compressedBase64);

// Decode and decompress
const decompressedString = decodeAndDecompress(compressedBase64);
console.log("Decompressed:", decompressedString);

// Verify the result
console.log("Matches Original:", originalString === decompressedString);
