"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "../providers/LanguageProvider";

export default function ProfileForm({ user, onSaved }) {
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Profile request failed.");

        const { profile: saved } = await response.json();

        if (controller.signal.aborted) return;

        setProfile({
          firstName: saved.firstName ?? "",
          lastName: saved.lastName ?? "",
          timeZone:
            saved.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "UTC",
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("profileLoadFailed");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [user.id, attempt]);

  function changeField(event) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setStatus("");
    setError("");
  }

  async function save(event) {
    event.preventDefault();

    if (lock.current || !profile) return;

    const name = [profile.firstName.trim(), profile.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    if (!profile.firstName.trim() || name.length > 100) {
      setError("profileInvalid");
      return;
    }

    lock.current = true;
    setBusy(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        setError(
          response.status === 400 ? "profileInvalid" : "profileSaveFailed",
        );
        return;
      }

      const { profile: saved } = await response.json();

      setProfile({
        firstName: saved.firstName ?? "",
        lastName: saved.lastName ?? "",
        timeZone: saved.timeZone,
      });

      setStatus("profileSaved");
    } catch {
      setError("profileSaveFailed");
    } finally {
      lock.current = false;
      setBusy(false);
    }

    // Refresh the displayed account name after the save succeeds.
    try {
      await onSaved?.();
    } catch {
      // The profile has already been saved successfully.
    }
  }

  if (loading) {
    return <p role="status">{t("accountLoading")}</p>;
  }

  if (!profile) {
    return (
      <div>
        <p className="backupSettingsError" role="alert">
          {t(error || "profileLoadFailed")}
        </p>

        <button
          type="button"
          className="ghost"
          onClick={() => setAttempt((current) => current + 1)}
        >
          {t("accountRetry")}
        </button>
      </div>
    );
  }

  return (
    <form className="form profileForm" onSubmit={save} aria-busy={busy}>
      <fieldset disabled={busy}>
        <label>
          <span>{t("profileFirstName")}</span>
          <input
            name="firstName"
            value={profile.firstName}
            onChange={changeField}
            autoComplete="given-name"
            required
            maxLength={100}
            pattern=".*\S.*"
          />
        </label>

        <label>
          <span>{t("profileLastName")}</span>
          <input
            name="lastName"
            value={profile.lastName}
            onChange={changeField}
            autoComplete="family-name"
            maxLength={100}
          />
        </label>

        <label>
          <span>{t("accountEmail")}</span>
          <input type="email" value={user.email} readOnly dir="ltr" />
        </label>

        <div className="backupSettingsActions">
          <button type="submit" className="primary">
            {t(busy ? "accountLoading" : "save")}
          </button>
        </div>

        {status && <p role="status">{t(status)}</p>}

        {error && (
          <p className="backupSettingsError" role="alert">
            {t(error)}
          </p>
        )}
      </fieldset>
    </form>
  );
}
