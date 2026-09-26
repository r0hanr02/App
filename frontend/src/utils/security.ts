// encryptionUtils.ts — AES-GCM payload format shared with user_management.
// Uses Web Crypto when available; falls back for insecure HTTP (LAN IP UAT).

import {
  decodeUtf8,
  decryptAesGcm,
  encodeUtf8,
  encryptAesGcm,
  sha256Bytes,
} from "./web-crypto";

const GCM_NONCE_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

interface EncryptionResult {
  encryptedString: string;
  randomKey: string;
}

class EncryptionDecryptionHandler {
  constructor() {
    // No initialization needed
  }

  private generateRandomString(length: number = 16): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  private generatePadding(length: number = 6): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  private async deriveKeyBytes(randomKey: string): Promise<Uint8Array> {
    return sha256Bytes(encodeUtf8(randomKey));
  }

  private async processEncryptData(
    plainText: string,
    randomKey: string,
  ): Promise<string> {
    const keyBytes = await this.deriveKeyBytes(randomKey);
    const data = encodeUtf8(plainText);
    const nonce = crypto.getRandomValues(new Uint8Array(GCM_NONCE_LENGTH));
    const encryptedArray = await encryptAesGcm({
      keyBytes,
      nonce,
      plaintext: data,
    });
    const result = new Uint8Array(nonce.length + encryptedArray.length);
    result.set(nonce, 0);
    result.set(encryptedArray, nonce.length);
    return btoa(String.fromCharCode.apply(null, Array.from(result)));
  }

  private async processDecryptData(
    encodedData: string,
    randomKey: string,
  ): Promise<string> {
    const keyBytes = await this.deriveKeyBytes(randomKey);
    const binaryString = atob(encodedData);
    const raw = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      raw[i] = binaryString.charCodeAt(i);
    }
    if (raw.length < GCM_NONCE_LENGTH + GCM_TAG_LENGTH) {
      throw new Error("Invalid ciphertext length");
    }
    const nonce = raw.slice(0, GCM_NONCE_LENGTH);
    const rest = raw.slice(GCM_NONCE_LENGTH);
    const decryptedData = await decryptAesGcm({
      keyBytes,
      nonce,
      ciphertextWithTag: rest,
    });
    return decodeUtf8(decryptedData);
  }

  /**
   * Encrypts data and returns a formatted string with padding and key
   * @param finalData - Data to encrypt (can be any JSON-serializable object)
   * @returns Formatted encrypted string: `${padding}${encrypted}.${randomKey}`
   */
  public async encryptData<T>(finalData: T): Promise<string> {
    const plainText = JSON.stringify(finalData);
    const randomKey = this.generateRandomString(16);
    const padding = this.generatePadding(6);
    const encrypted = await this.processEncryptData(plainText, randomKey);
    return `${padding}${encrypted}.${randomKey}`;
  }

  /**
   * Decrypts a formatted encrypted string and returns the original data
   * @param finalData - Formatted encrypted string
   * @returns Decrypted data
   * @throws Error if format is invalid or decryption fails
   */
  public async decryptData<T>(finalData: string): Promise<T> {
    if (!finalData.includes(".")) {
      throw new Error("Invalid format: Missing separator");
    }
    const lastDotIndex = finalData.lastIndexOf(".");
    const mainPart = finalData.substring(0, lastDotIndex);
    const randomKey = finalData.substring(lastDotIndex + 1);
    if (mainPart.length <= 6) {
      throw new Error("Invalid encrypted data: Data too short");
    }
    const encodedData = mainPart.substring(6);
    const decryptedStr = await this.processDecryptData(encodedData, randomKey);
    return JSON.parse(decryptedStr) as T;
  }

  /**
   * Encrypts data and returns the encrypted components separately
   * @param finalData - Data to encrypt
   * @returns Object containing encrypted string, random key, and padding
   */
  public async encryptDataWithComponents<T>(finalData: T): Promise<{
    encryptedString: string;
    randomKey: string;
    padding: string;
    fullEncryptedData: string;
  }> {
    const plainText = JSON.stringify(finalData);
    const randomKey = this.generateRandomString(16);
    const padding = this.generatePadding(6);
    const encrypted = await this.processEncryptData(plainText, randomKey);
    return {
      encryptedString: encrypted,
      randomKey: randomKey,
      padding: padding,
      fullEncryptedData: `${padding}${encrypted}.${randomKey}`,
    };
  }

  /**
   * Decrypts data using separate components
   * @param encryptedString - The base64 encoded encrypted data
   * @param randomKey - The random key used for encryption
   * @returns Decrypted data
   */
  public async decryptDataWithComponents<T>(
    encryptedString: string,
    randomKey: string,
  ): Promise<T> {
    const decryptedStr = await this.processDecryptData(
      encryptedString,
      randomKey,
    );
    return JSON.parse(decryptedStr) as T;
  }
}

const encryptionDecryptionHandler = new EncryptionDecryptionHandler();

export default encryptionDecryptionHandler;
export { EncryptionDecryptionHandler, type EncryptionResult };
