export async function verify(
  state: string,
  sig: string,
  key: CryptoKey
): Promise<boolean> {
  return crypto.subtle.verify(
    {
      name: "HMAC",
    },
    key,
    new Uint8Array(
      atob(sig)
        .split("")
        .map((c) => c.charCodeAt(0))
    ),
    new TextEncoder().encode(state)
  );
}
