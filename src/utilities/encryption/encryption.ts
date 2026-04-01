import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits — recommended for GCM

// Your 32-byte key from environment variable
// Generate once with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

if (SECRET_KEY.length !== KEY_LENGTH) {
  throw new Error(
    "ENCRYPTION_KEY must be a 64-character hex string (32 bytes).",
  );
}

export interface EncryptedPayload {
  iv: string;
  authTag: string;
  ciphertext: string;
}

export function encrypt(plaintext: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

export function decrypt(payload: EncryptedPayload): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(payload.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}


export function hashForLookup(plaintext: string): string {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(plaintext.trim().toLowerCase())
    .digest("hex");
}
