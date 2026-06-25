/*
 * Apache secure channel — symmetric encryption shared with the firmware.
 *
 * This is the website half of the cipher that runs on the Arduino in
 * arduinoCode/1. It must stay byte-for-byte identical to the C version, so the
 * device can decrypt what the browser sends and vice versa.
 *
 * Algorithm: XTEA (a small, real block cipher — 128-bit key, 64-bit block, 32
 * rounds) used as a keystream generator in CTR mode. CTR turns the block cipher
 * into a stream cipher, so messages of any length encrypt without padding. The
 * key is pre-shared and baked into both sides — appropriate for a presentation
 * channel, not for protecting real secrets.
 *
 * Wire format of one message (ASCII, newline-terminated over serial):
 *   <nonce: 8 hex chars><ciphertext: 2 hex chars per byte>
 * The nonce is public and travels in the clear; that is normal for CTR.
 */

// 128-bit pre-shared key (four 32-bit words). Mirror of KEY[] in the firmware.
const KEY = [0xa1b2c3d4, 0x05060708, 0x9a8b7c6d, 0x10203040];
const DELTA = 0x9e3779b9;

// Keep this in sync with the device's decode buffer (MAX_PLAIN in the firmware).
export const MAX_MESSAGE_LENGTH = 40;
export const CIPHER_LABEL = "XTEA-128 / CTR";

/* Encrypt one 64-bit block (v0, v1) in place. All math is unsigned 32-bit; the
 * `>>> 0` masks keep JavaScript numbers aligned with C's uint32_t wraparound. */
function xteaBlock(v0, v1) {
  v0 >>>= 0;
  v1 >>>= 0;
  let sum = 0;
  for (let i = 0; i < 32; i += 1) {
    const f0 = ((((v1 << 4) ^ (v1 >>> 5)) >>> 0) + v1) >>> 0;
    v0 = (v0 + ((f0 ^ ((sum + KEY[sum & 3]) >>> 0)) >>> 0)) >>> 0;
    sum = (sum + DELTA) >>> 0;
    const f1 = ((((v0 << 4) ^ (v0 >>> 5)) >>> 0) + v0) >>> 0;
    v1 = (v1 + ((f1 ^ ((sum + KEY[(sum >>> 11) & 3]) >>> 0)) >>> 0)) >>> 0;
  }
  return [v0, v1];
}

/* Apply the CTR keystream to `bytes`. Encryption and decryption are the same
 * operation (XOR), so this one function serves both directions. */
function applyKeystream(bytes, nonce) {
  const out = new Uint8Array(bytes.length);
  let counter = 0;
  let block = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < bytes.length; i += 1) {
    if ((i & 7) === 0) {
      const [a, b] = xteaBlock(nonce >>> 0, counter >>> 0);
      block = [
        (a >>> 24) & 0xff, (a >>> 16) & 0xff, (a >>> 8) & 0xff, a & 0xff,
        (b >>> 24) & 0xff, (b >>> 16) & 0xff, (b >>> 8) & 0xff, b & 0xff,
      ];
      counter = (counter + 1) >>> 0;
    }
    out[i] = bytes[i] ^ block[i & 7];
  }
  return out;
}

function toHex(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 1) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

function fromHex(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const len = clean.length >> 1;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

function nonceHex(nonce) {
  return (nonce >>> 0).toString(16).padStart(8, "0");
}

function randomNonce() {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
  }
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

/* Encrypt text with an explicit nonce — deterministic, used by the tests. */
export function encryptWithNonce(text, nonce) {
  const data = new TextEncoder().encode(text);
  const cipher = applyKeystream(data, nonce);
  const hex = toHex(cipher);
  return { nonce: nonce >>> 0, cipher, hex, line: nonceHex(nonce) + hex };
}

/* Encrypt text with a fresh random nonce — used by the app. */
export function encrypt(text) {
  return encryptWithNonce(text, randomNonce());
}

/* Decrypt a wire line back into plaintext. Returns null for malformed input. */
export function decryptLine(line) {
  const clean = line.trim();
  if (clean.length < 8) {
    return null;
  }
  const nonce = parseInt(clean.slice(0, 8), 16) >>> 0;
  const cipher = fromHex(clean.slice(8));
  const data = applyKeystream(cipher, nonce);
  return {
    nonce,
    cipher,
    hex: toHex(cipher),
    text: new TextDecoder().decode(data),
  };
}
