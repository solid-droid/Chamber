import pako from 'pako';

export class JsonHandler {
    // A small, unique header added before compression for encryption integrity check.
    static _MAGIC_HEADER_BYTES = new TextEncoder().encode('JCEM'); // JSON Compressed Encrypted Magic

    constructor() {
        if (typeof pako === 'undefined') {
            throw new Error("Pako library is required for compression/decompression.");
        }
        if (typeof window.crypto === 'undefined' || typeof window.crypto.subtle === 'undefined') {
            throw new Error("Web Cryptography API is required for encryption.");
        }
    }

    _bytesToKB(bytes) {
        return (bytes / 1024).toFixed(2);
    }

    async _deriveKeyFromSeed(seed, salt) {
        const enc = new TextEncoder();
        const passwordBytes = enc.encode(seed);

        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBytes,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async _encryptBinary(compressedBinary, seed) {
        if (typeof seed !== 'string' || seed.length === 0) {
            throw new Error("Encryption seed cannot be empty.");
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const key = await this._deriveKeyFromSeed(seed, salt);

        // Prepend magic header to the compressed binary before encryption
        const dataToEncrypt = new Uint8Array(JsonHandler._MAGIC_HEADER_BYTES.length + compressedBinary.byteLength);
        dataToEncrypt.set(JsonHandler._MAGIC_HEADER_BYTES, 0);
        dataToEncrypt.set(compressedBinary, JsonHandler._MAGIC_HEADER_BYTES.length);

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataToEncrypt
        );

        const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.byteLength);
        combined.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);
        
        return combined;
    }

    async _decryptBinary(encryptedBinary, seed) {
        if (typeof seed !== 'string' || seed.length === 0) {
            throw new Error("Decryption seed cannot be empty.");
        }
        if (encryptedBinary.byteLength < (16 + 12 + JsonHandler._MAGIC_HEADER_BYTES.length)) {
            throw new Error("Invalid encrypted data format: too short or missing header.");
        }

        const salt = encryptedBinary.slice(0, 16);
        const iv = encryptedBinary.slice(16, 28);
        const ciphertext = encryptedBinary.slice(28);

        const key = await this._deriveKeyFromSeed(seed, salt);

        try {
            const originalDecryptedBytes = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                ciphertext
            );

            // Verify magic header after decryption
            const decryptedHeader = new Uint8Array(originalDecryptedBytes).slice(0, JsonHandler._MAGIC_HEADER_BYTES.length);
            const dataWithoutHeader = new Uint8Array(originalDecryptedBytes).slice(JsonHandler._MAGIC_HEADER_BYTES.length);

            // Simple comparison for Uint8Arrays
            let headerMatches = decryptedHeader.byteLength === JsonHandler._MAGIC_HEADER_BYTES.length;
            if (headerMatches) {
                for (let i = 0; i < JsonHandler._MAGIC_HEADER_BYTES.length; i++) {
                    if (decryptedHeader[i] !== JsonHandler._MAGIC_HEADER_BYTES[i]) {
                        headerMatches = false;
                        break;
                    }
                }
            }

            if (!headerMatches) {
                throw new Error("Magic header mismatch after decryption. Possible incorrect seed or corrupted data.");
            }

            return dataWithoutHeader; // Return decrypted bytes without the magic header
        } catch (e) {
            throw new Error("Failed to decrypt binary. Incorrect seed or corrupted data: " + e.message);
        }
    }

    _compressJson(jsonString) {
        if (typeof jsonString !== 'string') {
            throw new Error("Input for compression must be a JSON string.");
        }
        try {
            const utf8Encode = new TextEncoder();
            const jsonBytes = utf8Encode.encode(jsonString);
            return pako.deflate(jsonBytes);
        } catch (e) {
            throw new Error("Failed to compress JSON string: " + e.message);
        }
    }

    _decompressBinary(compressedBinary) {
        if (!(compressedBinary instanceof Uint8Array)) {
            throw new Error("Input for decompression must be a Uint8Array.");
        }
        try {
            const decompressedBytes = pako.inflate(compressedBinary);
            const utf8Decode = new TextDecoder();
            return utf8Decode.decode(decompressedBytes);
        } catch (e) {
            throw new Error("Failed to decompress binary: " + e.message);
        }
    }

    async compress(filename, jsonContent, seed) {
        const jsonString = JSON.stringify(jsonContent);
        const originalBytes = new TextEncoder().encode(jsonString).byteLength;

        let processedData;
        let newBytes;

        const compressedBinary = this._compressJson(jsonString);

        if (seed) {
            processedData = await this._encryptBinary(compressedBinary, seed);
            newBytes = processedData.byteLength;
            console.log(`Original JSON size: ${this._bytesToKB(originalBytes)} KB`);
            console.log(`Internal Compressed size: ${this._bytesToKB(compressedBinary.byteLength)} KB`);
            console.log(`Encrypted binary size: ${this._bytesToKB(newBytes)} KB`);
        } else {
            processedData = compressedBinary;
            newBytes = processedData.byteLength;
            console.log(`Original JSON size: ${this._bytesToKB(originalBytes)} KB`);
            console.log(`Compressed binary size: ${this._bytesToKB(newBytes)} KB`);
        }

        return {
            originalSize: this._bytesToKB(originalBytes),
            newSize: this._bytesToKB(newBytes),
            data: processedData
        };
    }

    isCompressed(data) {
        let binaryData;
        if (typeof data === 'string') {
            const enc = new TextEncoder();
            binaryData = enc.encode(data);
        } else if (data instanceof Uint8Array) {
            binaryData = data;
        } else {
            return false;
        }

        if (binaryData.byteLength < 2) {
            return false;
        }
        return binaryData[0] === 0x78 && (binaryData[1] === 0x01 || binaryData[1] === 0x5E || binaryData[1] === 0x9C || binaryData[1] === 0xDA);
    }

    isEncrypted(data) {
        let binaryData;
        if (typeof data === 'string') {
            const enc = new TextEncoder();
            binaryData = enc.encode(data);
        } else if (data instanceof Uint8Array) {
            binaryData = data;
        } else {
            return false;
        }

        return binaryData.byteLength >= (16 + 12 + JsonHandler._MAGIC_HEADER_BYTES.length);
    }

    /**
     * Checks if the provided seed can correctly decrypt the given binary data.
     * This method attempts a partial decryption and verifies a magic header.
     * @param {Uint8Array} encryptedBinaryData The encrypted binary data to check.
     * @param {string} seed The seed (password) to test.
     * @returns {Promise<boolean>} True if the seed is likely correct, false otherwise.
     */
    async checkSeed(encryptedBinaryData, seed) {
        if (!(encryptedBinaryData instanceof Uint8Array) || encryptedBinaryData.byteLength < (16 + 12 + JsonHandler._MAGIC_HEADER_BYTES.length)) {
            console.warn("checkSeed: Invalid or too short binary data for encrypted check.");
            return false; // Not even structurally encrypted
        }
        if (typeof seed !== 'string' || seed.length === 0) {
            console.warn("checkSeed: Seed cannot be empty.");
            return false;
        }

        const salt = encryptedBinaryData.slice(0, 16);
        const iv = encryptedBinaryData.slice(16, 28);
        // Take only enough ciphertext to decrypt the magic header
        const testCiphertext = encryptedBinaryData.slice(28, 28 + JsonHandler._MAGIC_HEADER_BYTES.length + 16); // +16 for potential tag or small data after header

        const key = await this._deriveKeyFromSeed(seed, salt);

        try {
            const decryptedPartial = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                testCiphertext
            );

            const decryptedHeader = new Uint8Array(decryptedPartial).slice(0, JsonHandler._MAGIC_HEADER_BYTES.length);

            // Compare decrypted header with the expected magic header
            if (decryptedHeader.byteLength !== JsonHandler._MAGIC_HEADER_BYTES.length) {
                return false;
            }
            for (let i = 0; i < JsonHandler._MAGIC_HEADER_BYTES.length; i++) {
                if (decryptedHeader[i] !== JsonHandler._MAGIC_HEADER_BYTES[i]) {
                    return false;
                }
            }
            return true; // Decryption successful and magic header matches
        } catch (e) {
            return false; // Decryption failed (e.g., incorrect seed, corrupted data)
        }
    }

    async extract(binaryData, options = {}) {
        if (!(binaryData instanceof Uint8Array)) {
            throw new Error("Input for extract must be a Uint8Array.");
        }

        let processedBinary = binaryData;
        let isDataEncrypted = options.isEncrypted || this.isEncrypted(binaryData);
        let isDataCompressed = false;

        if (isDataEncrypted) {
            if (!options.seed) {
                throw new Error("Seed is required to decrypt data.");
            }
            processedBinary = await this._decryptBinary(binaryData, options.seed); // _decryptBinary now handles magic header
            isDataCompressed = this.isCompressed(processedBinary); // Check if decompressed data is compressed
        } else {
            isDataCompressed = this.isCompressed(binaryData);
        }

        let jsonString;
        if (isDataCompressed) {
            jsonString = this._decompressBinary(processedBinary);
        } else {
            try {
                const utf8Decode = new TextDecoder();
                jsonString = utf8Decode.decode(processedBinary);
            } catch (e) {
                throw new Error("Failed to decode binary to string for raw extract: " + e.message);
            }
        }

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            throw new Error("Failed to parse JSON after extract: " + e.message);
        }
    }
}
