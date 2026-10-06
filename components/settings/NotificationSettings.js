"use client";

import { useEffect, useRef, useState } from "react";

import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";

function decodePublicKey(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function pushRequest(path, method, body) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",

    headers: {
      "Content-Type": "application/json",
      "X-Dapl-Request": "push",
    },

    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(new Error(result.error || "PUSH_REQUEST_FAILED"), {
      status: response.status,
    });
  }

  return result;
}

/* Manages notification permission and push delivery. */
export default function NotificationSettings() {
  const { t, locale, direction } = useLanguage();

  const { data: session, isPending } = authClient.useSession();

  const [supported, setSupported] = useState(null);

  const [pushSupported, setPushSupported] = useState(false);

  const [permission, setPermission] = useState("default");

  const [subscription, setSubscription] = useState(null);

  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState("");

  const [error, setError] = useState("");

  const lock = useRef(false);

  useEffect(() => {
    let active = true;

    const available =
      window.isSecureContext &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "ServiceWorkerRegistration" in window &&
      "showNotification" in ServiceWorkerRegistration.prototype;

    setSupported(available);
    setPushSupported(available && "PushManager" in window);

    if (!available) {
      return undefined;
    }

    async function refresh() {
      setPermission(Notification.permission);

      try {
        const registration = await navigator.serviceWorker.getRegistration("/");

        const current = registration?.pushManager
          ? await registration.pushManager.getSubscription()
          : null;

        if (active) {
          setSubscription(current);
        }
      } catch {
        /* Actions report errors when requested. */
      }
    }

    void refresh();

    window.addEventListener("focus", refresh);

    return () => {
      active = false;

      window.removeEventListener("focus", refresh);
    };
  }, []);

  async function getWorker() {
    const registration = await navigator.serviceWorker.getRegistration("/");

    if (!registration?.active) {
      throw new Error("WORKER_MISSING");
    }

    return registration;
  }

  async function saveSubscription(current) {
    await pushRequest("/api/push/subscription", "POST", {
      subscription: current.toJSON(),

      locale,
    });
  }

  async function run(action) {
    if (lock.current) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setStatus("");
    setError("");

    try {
      await action();
    } catch (failure) {
      setError(
        failure.message === "WORKER_MISSING"
          ? "notificationsWorkerMissing"
          : failure.status === 409
            ? "notificationsDeviceConflict"
            : "notificationsFailed",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function enableNotifications() {
    void run(async () => {
      let nextPermission = Notification.permission;

      if (nextPermission !== "granted") {
        nextPermission = await Notification.requestPermission();

        setPermission(nextPermission);
      }

      if (nextPermission !== "granted") {
        return;
      }

      /*
       * Signed-in users receive push notifications even
       * while the application is closed.
       */
      if (session && pushSupported) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("VAPID_PUBLIC_KEY_MISSING");
        }

        const registration = await getWorker();

        let current = await registration.pushManager.getSubscription();

        if (!current) {
          current = await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey: decodePublicKey(publicKey),
          });
        }

        setSubscription(current);
        await saveSubscription(current);
      }

      setStatus("notificationsAllowed");
    });
  }

  function sendTestNotification() {
    void run(async () => {
      /*
       * Use real push when available so the complete
       * production delivery path is tested.
       */
      if (session && subscription) {
        await saveSubscription(subscription);

        await pushRequest("/api/push/test", "POST", {
          endpoint: subscription.endpoint,
        });
      } else {
        const registration = await getWorker();

        await registration.showNotification(t("notificationsTestTitle"), {
          body: t("notificationsTestBody"),

          icon: "/icons/app-192.png",

          tag: `dapl-notification-test-${Date.now()}`,

          lang: locale,
          dir: direction,
        });
      }

      setStatus("notificationsTestRequested");
    });
  }

  function disableNotifications() {
    if (!subscription) {
      return;
    }

    void run(async () => {
      await pushRequest("/api/push/subscription", "DELETE", {
        endpoint: subscription.endpoint,
      });

      const removed = await subscription.unsubscribe();

      if (!removed) {
        throw new Error("UNSUBSCRIBE_FAILED");
      }

      setSubscription(null);
      setStatus("");
    });
  }

  const pushRequired = Boolean(session && pushSupported);

  const enabled =
    permission === "granted" && (!pushRequired || Boolean(subscription));

  const stateKey =
    permission === "denied"
      ? "notificationsBlocked"
      : enabled
        ? "notificationsAllowed"
        : "notificationsNotAllowed";

  return (
    <section
      className="card backupSettings notificationSettings"
      aria-labelledby="notification-settings-title"
      aria-busy={busy || isPending}
    >
      <div>
        <h2 id="notification-settings-title">{t("notificationsTitle")}</h2>

        <p>{t("notificationsDescription")}</p>
      </div>

      {supported === null || isPending ? (
        <p role="status">{t("accountLoading")}</p>
      ) : !supported ? (
        <p>{t("notificationsUnsupported")}</p>
      ) : (
        <>
          <p>{t(stateKey)}</p>

          <div className="backupSettingsActions">
            {!enabled && permission !== "denied" && (
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={enableNotifications}
              >
                {t("notificationsEnable")}
              </button>
            )}

            {enabled && (
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={sendTestNotification}
              >
                {t("notificationsTest")}
              </button>
            )}

            {subscription && (
              <button
                type="button"
                className="ghost"
                disabled={busy}
                onClick={disableNotifications}
              >
                {t("notificationsPushDisable")}
              </button>
            )}
          </div>

          {!session && <p>{t("notificationsSignInHint")}</p>}
        </>
      )}

      {status && (
        <p role="status" aria-live="polite">
          {t(status)}
        </p>
      )}

      {error && (
        <p className="backupSettingsError" role="alert">
          {t(error)}
        </p>
      )}
    </section>
  );
}
