/**
 * Web Crypto (crypto.subtle) is only available in secure contexts
 * (HTTPS or http://localhost). UAT over http://LAN-IP has no subtle API.
 * Prefer subtle when present; fall back to @noble/* with identical AES-GCM layout.
 */

import { gcm } from "@noble/ciphers/aes.js";
import { bytesToUtf8, utf8ToBytes } from "@noble/ciphers/utils.js";
import { sha256 } from "@noble/hashes/sha2.js";

const GCM_TAG_LENGTH_BITS = 128;

const hasSubtleCrypto = (): boolean =>
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.subtle !== "undefined" &&
  typeof globalThis.crypto.subtle.digest === "function";

const toBufferSource = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
};

export const sha256Bytes = async (data: Uint8Array): Promise<Uint8Array> => {
  if (hasSubtleCrypto()) {
    return new Uint8Array(
      await crypto.subtle.digest("SHA-256", toBufferSource(data)),
    );
  }
  return sha256(data);
};

export const encryptAesGcm = async (params: {
  readonly keyBytes: Uint8Array;
  readonly nonce: Uint8Array;
  readonly plaintext: Uint8Array;
}): Promise<Uint8Array> => {
  const { keyBytes, nonce, plaintext } = params;
  if (hasSubtleCrypto()) {
    const key = await crypto.subtle.importKey(
      "raw",
      toBufferSource(keyBytes),
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );
    return new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: toBufferSource(nonce),
          tagLength: GCM_TAG_LENGTH_BITS,
        },
        key,
        toBufferSource(plaintext),
      ),
    );
  }
  return gcm(keyBytes, nonce).encrypt(plaintext);
};

export const decryptAesGcm = async (params: {
  readonly keyBytes: Uint8Array;
  readonly nonce: Uint8Array;
  readonly ciphertextWithTag: Uint8Array;
}): Promise<Uint8Array> => {
  const { keyBytes, nonce, ciphertextWithTag } = params;
  if (hasSubtleCrypto()) {
    const key = await crypto.subtle.importKey(
      "raw",
      toBufferSource(keyBytes),
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    return new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toBufferSource(nonce),
          tagLength: GCM_TAG_LENGTH_BITS,
        },
        key,
        toBufferSource(ciphertextWithTag),
      ),
    );
  }
  return gcm(keyBytes, nonce).decrypt(ciphertextWithTag);
};

export const encodeUtf8 = (value: string): Uint8Array => utf8ToBytes(value);

export const decodeUtf8 = (value: Uint8Array): string => bytesToUtf8(value);
