import "server-only";

const MAX_JSON_BYTES = 16 * 1024;

/* Limits actual bytes read, including requests without Content-Length. */
export async function readSmallJson(request) {
  if (!request.body) {
    return { ok: false, status: 400, error: "INVALID_JSON" };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > MAX_JSON_BYTES) {
        await reader.cancel().catch(() => {});
        return {
          ok: false,
          status: 413,
          error: "REQUEST_TOO_LARGE",
        };
      }

      chunks.push(Buffer.from(value));
    }

    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, error: "INVALID_JSON" };
  } finally {
    reader.releaseLock();
  }
}
