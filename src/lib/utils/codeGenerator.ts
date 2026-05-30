import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

/**
 * Generate a cryptographically random alphanumeric access code.
 * Defaults to 8 characters from an unambiguous base-32 alphabet.
 */
export function generateAlphanumericCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
