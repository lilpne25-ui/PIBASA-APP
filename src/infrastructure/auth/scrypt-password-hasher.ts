import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import type { PasswordHasher } from "@/application/auth/ports";

const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
export const MIN_PASSWORD_LENGTH = 12;

function derive(password: string, salt: Buffer, keylen: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }
    const salt = randomBytes(16);
    const key = await derive(password, salt, KEY_LENGTH, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELIZATION,
      maxmem: 64 * 1024 * 1024
    });
    return [
      "scrypt",
      COST,
      BLOCK_SIZE,
      PARALLELIZATION,
      salt.toString("base64url"),
      key.toString("base64url")
    ].join("$");
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      const [algorithm, n, r, p, saltText, hashText] = storedHash.split("$");
      if (algorithm !== "scrypt" || !saltText || !hashText) return false;
      const cost = Number(n);
      const block = Number(r);
      const par = Number(p);
      if (![cost, block, par].every(Number.isFinite)) return false;
      const expected = Buffer.from(hashText, "base64url");
      const actual = await derive(password, Buffer.from(saltText, "base64url"), expected.length, {
        N: cost,
        r: block,
        p: par,
        maxmem: 64 * 1024 * 1024
      });
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }
}
