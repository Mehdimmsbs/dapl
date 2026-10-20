import { isTrustedMutation } from "../../../../lib/server/origins";
import { createHash, randomUUID } from "node:crypto";

import { tr } from "../../../../lib/i18n";
import { auth } from "../../../../lib/server/auth";
import { prisma } from "../../../../lib/server/prisma";
import { sendPushNotification } from "../../../../lib/server/push";

export const runtime = "nodejs";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/* Sends a test only to a device belonging to the current user. */
export async function POST(request) {
  if (
    !isTrustedMutation(request) ||
    request.headers.get("x-dapl-request") !== "push" ||
    request.headers.get("sec-fetch-site") === "cross-site" ||
    request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
  ) {
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

    if (typeof body?.endpoint !== "string" || body.endpoint.length > 4096) {
      return respond({ error: "INVALID_SUBSCRIPTION" }, 400);
    }

    const endpointHash = createHash("sha256")
      .update(body.endpoint)
      .digest("hex");

    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        endpointHash,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return respond({ error: "SUBSCRIPTION_NOT_FOUND" }, 404);
    }

    const locale = ["en", "de", "fa", "ar"].includes(subscription.locale)
      ? subscription.locale
      : "en";

    try {
      await sendPushNotification(subscription, {
        title: tr(locale, "notificationsTestTitle"),
        body: tr(locale, "notificationsTestBody"),
        locale,
        direction: ["fa", "ar"].includes(locale) ? "rtl" : "ltr",
        tag: `dapl-server-test-${randomUUID()}`,
      });
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) {
        await prisma.pushSubscription.deleteMany({
          where: {
            id: subscription.id,
            userId: session.user.id,
          },
        });

        return respond({ error: "SUBSCRIPTION_EXPIRED" }, 410);
      }

      // Do not log device endpoints, subscription keys or VAPID secrets.
      console.error("Push test failed:", {
        statusCode: error.statusCode ?? null,
        name: error.name,
      });

      return respond({ error: "PUSH_SEND_FAILED" }, 502);
    }

    // Accepted by the push service; delivery is checked on the device.
    return respond({ accepted: true });
  } catch {
    return respond({ error: "PUSH_TEST_FAILED" }, 500);
  }
}
