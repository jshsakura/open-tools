/**
 * AES-GCM Encryption/Decryption using Web Crypto API
 * 
 * Logic:
 * 1. Password -> Key (PBKDF2)
 * 2. Encrypt: Key + IV -> Ciphertext
 * 3. Output strategy: Base64(Salt + IV + Ciphertext) for easy copy-pasting.
 */

// Configuration
const ALGORITHM = 'AES-GCM';
const KEY_Length = 256;
const SALT_Length = 16;
const IV_Length = 12; // Recommended for GCM
const ITERATIONS = 100000; // PBKDF2 iterations

// Encode/Decode helpers
const enc = new TextEncoder();
const dec = new TextDecoder();

function buffToBase64(buff: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buff)));
}

function base64ToBuff(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Derive a key from a password
async function getKeyInMaterial(password: string): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
        "raw",
        enc.encode(password) as any, // Cast to any to avoid TS BufferSource mismatch
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
}

async function getKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: ITERATIONS,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_Length },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptAES(text: string, password: string): Promise<string> {
    try {
        const salt = window.crypto.getRandomValues(new Uint8Array(SALT_Length));
        const iv = window.crypto.getRandomValues(new Uint8Array(IV_Length));

        const keyMaterial = await getKeyInMaterial(password);
        const key = await getKey(keyMaterial, salt);

        const encoded = enc.encode(text);
        const ciphertext = await window.crypto.subtle.encrypt(
            { name: ALGORITHM, iv: iv },
            key,
            encoded
        );

        // Combine: Salt + IV + Ciphertext
        // We can just concat arrays
        const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

        return buffToBase64(combined.buffer);
    } catch (e) {
        console.error("Encryption failed", e);
        throw new Error("Encryption failed");
    }
}

export async function decryptAES(encryptedBase64: string, password: string): Promise<string> {
    try {
        const combined = base64ToBuff(encryptedBase64);

        // Extract parts
        const salt = combined.slice(0, SALT_Length);
        const iv = combined.slice(SALT_Length, SALT_Length + IV_Length);
        const ciphertext = combined.slice(SALT_Length + IV_Length);

        const keyMaterial = await getKeyInMaterial(password);
        const key = await getKey(keyMaterial, salt);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: ALGORITHM, iv: iv },
            key,
            ciphertext
        );

        return dec.decode(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("Decryption failed. Wrong password or corrupted data.");
    }
}
