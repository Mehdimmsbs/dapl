import { isTrustedMutation } from "../../../../lib/server/origins";
import { createHash } from "node:crypto";

import { auth } from "../../../../lib/server/auth";
import { prisma } from "../../../../lib/server/prisma";

export const runtime = "nodejs";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/* Requires a same-origin JavaScript request. */
function validRequest(request) {
  return (
    isTrustedMutation(request) &&
    request.headers.get("x-dapl-request") === "push" &&
    request.headers.get("sec-fetch-site") !== "cross-site" &&
    request.headers.get("content-type")?.split(";")[0].trim() ===
      "application/json"
  );
}

/* Accepts only supported browser push services. */
function validEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.length > 4096) {
    return false;
  }

  try {
    const url = new URL(endpoint);
    const host = url.hostname;

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      !url.hash &&
      (host === "fcm.googleapis.com" ||
        host === "updates.push.services.mozilla.com" ||
        host.endsWith(".push.services.mozilla.com") ||
        host === "web.push.apple.com" ||
        host.endsWith(".push.apple.com"))
    );
  } catch {
    return false;
  }
}

function validKey(value, expectedBytes) {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9_-]+$/.test(value) ||
    value.length > 191
  ) {
    return false;
  }

  return Buffer.from(value, "base64url").length === expectedBytes;
}

function endpointHash(endpoint) {
  return createHash("sha256").update(endpoint).digest("hex");
}

export async function POST(request) {
  if (!validRequest(request)) {
    return respond({ error: "INVALID_REQUEST" }, 403);
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return respond({ error: "UNAUTHORIZED" }, 401);
    }

    const body = await request.json().catch(() => null);
    const subscription = body?.subscription;

    if (
      !validEndpoint(subscription?.endpoint) ||
      !validKey(subscription?.keys?.p256dh, 65) ||
      !validKey(subscription?.keys?.auth, 16)
    ) {
      return respond({ error: "INVALID_SUBSCRIPTION" }, 400);
    }

    const hash = endpointHash(subscription.endpoint);
    const locale = ["en", "de", "fa", "ar"].includes(body.locale)
      ? body.locale
      : "en";

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpointHash: hash },
    });

    if (existing && existing.userId !== session.user.id) {
      return respond({ error: "SUBSCRIPTION_OWNER_CONFLICT" }, 409);
    }

    const data = {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      locale,
    };

    if (existing) {
      await prisma.pushSubscription.updateMany({
        where: {
          endpointHash: hash,
          userId: session.user.id,
        },
        data,
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          ...data,
          endpointHash: hash,
          userId: session.user.id,
        },
      });
    }

    return respond({ saved: true });
  } catch {
    return respond({ error: "SUBSCRIPTION_SAVE_FAILED" }, 500);
  }
}

export async function DELETE(request) {
  if (!validRequest(request)) {
    return respond({ error: "INVALID_REQUEST" }, 403);
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return respond({ error: "UNAUTHORIZED" }, 401);
    }

    const body = await request.json().catch(() => null);

    if (!validEndpoint(body?.endpoint)) {
      return respond({ error: "INVALID_SUBSCRIPTION" }, 400);
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpointHash: endpointHash(body.endpoint),
        userId: session.user.id,
      },
    });

    return respond({ removed: true });
  } catch {
    return respond({ error: "SUBSCRIPTION_DELETE_FAILED" }, 500);
  }
}
