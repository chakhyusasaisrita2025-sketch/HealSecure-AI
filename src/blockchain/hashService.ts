export async function generateHash(data: unknown): Promise<string> {
  const jsonData = JSON.stringify(data);

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonData);

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}