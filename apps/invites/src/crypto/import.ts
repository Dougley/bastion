export async function importKey(storedKey: string): Promise<CryptoKey> {
  const key = (await crypto.subtle.importKey(
    "jwk",
    JSON.parse(storedKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  )) as CryptoKey;
  return key;
}
