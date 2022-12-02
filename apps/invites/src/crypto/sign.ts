export async function sign(payload: string, key: CryptoKey): Promise<string> {
  return crypto.subtle
    .sign(
      {
        name: "HMAC",
      },
      key,
      new TextEncoder().encode(payload)
    )
    .then((sig) => btoa(String.fromCharCode(...new Uint8Array(sig))));
}
