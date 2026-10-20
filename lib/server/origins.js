import "server-only";

/* One explicit allowlist for authentication and browser API mutations. */
export function getTrustedOrigins() {
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!baseURL) throw new Error("BETTER_AUTH_URL is missing.");

  const configured = [
    baseURL,
    ...(process.env.AUTH_EXTRA_TRUSTED_ORIGINS ?? "").split(","),
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
  ];

  return [
    ...new Set(
      configured
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => {
          const url = new URL(value);
          if (
            !["http:", "https:"].includes(url.protocol) ||
            url.username ||
            url.password
          ) {
            throw new Error("Invalid authentication origin configuration.");
          }
          return url.origin;
        }),
    ),
  ];
}

/* Reject absent, opaque and unlisted origins; never trust Host headers. */
export function isTrustedMutation(request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const trustedOrigins = getTrustedOrigins();

  const allowed =
    Boolean(origin && trustedOrigins.includes(origin)) &&
    fetchSite !== "cross-site";

  if (!allowed && process.env.NODE_ENV === "development") {
    console.warn("[origin-check]", {
      origin,
      fetchSite,
      trustedOrigins,
    });
  }

  return allowed;
}
