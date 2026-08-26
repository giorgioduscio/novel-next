"use server";

import argon2 from "argon2";

/**
 * Genera un hash Argon2 sicuro per una stringa/password.
 */
export async function hashWithArgon2(code: string): Promise<string> {
  if (!code || !code.trim()) return "";
  try {
    return await argon2.hash(code.trim(), {
      type: argon2.argon2id,
    });
  } catch (error) {
    console.error("Errore durante hashing argon2:", error);
    return "";
  }
}

/**
 * Verifica se un codice in chiaro corrisponde a un hash Argon2.
 */
export async function verifyWithArgon2(code: string, hash: string): Promise<boolean> {
  if (!code || !hash) return false;
  try {
    return await argon2.verify(hash, code.trim());
  } catch (error) {
    console.error("Errore durante verifica argon2:", error);
    return false;
  }
}

/**
 * Verifica se almeno uno dei codici dell'utente corrisponde all'hash Argon2 del libro.
 */
export async function checkAccessWithArgon2(userCodes: string[], hash: string): Promise<boolean> {
  if (!hash) return true;
  if (!userCodes || userCodes.length === 0) return false;

  for (const code of userCodes) {
    if (!code) continue;
    try {
      const match = await argon2.verify(hash, code.trim());
      if (match) return true;
    } catch {
      // Ignora errori di parsing su singoli codici e prosegui
    }
  }

  return false;
}
