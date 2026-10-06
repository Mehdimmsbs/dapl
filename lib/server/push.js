import "server-only";

import webpush from "web-push";

/* Sends one notification to a stored device subscription. */
export async function sendPushNotification(subscription, message) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Web Push environment is incomplete.");
  }

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify(message),
    {
      vapidDetails: {
        subject,
        publicKey,
        privateKey,
      },
      TTL: 300,
      timeout: 10000,
    },
  );
}
