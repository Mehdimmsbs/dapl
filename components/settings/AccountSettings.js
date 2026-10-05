"use client";

import { useRef, useState } from "react";

import { authClient } from "../../lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";
import PasswordField from "../ui/PasswordField";
import ProfileForm from "./ProfileForm";

/* Handles registration, sign-in and profile editing. */
export default function AccountSettings() {
  const { t } = useLanguage();

  const {
    data: session,
    isPending,
    error: sessionError,
    refetch,
  } = authClient.useSession();

  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  const lock = useRef(false);

  async function submit(event) {
    event.preventDefault();

    if (lock.current) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const registering = mode === "register";

    const firstName = String(values.get("firstName") ?? "").trim();
    const lastName = String(values.get("lastName") ?? "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ");

    if (registering && (!firstName || name.length > 100)) {
      setErrorKey("profileInvalid");
      return;
    }

    lock.current = true;
    setBusy(true);
    setErrorKey("");
    setEditingProfile(false);

    try {
      const credentials = {
        email: String(values.get("email") ?? "").trim(),
        password: String(values.get("password") ?? ""),
      };

      const result = registering
        ? await authClient.signUp.email({
            ...credentials,
            name,
          })
        : await authClient.signIn.email(credentials);

      if (result.error) {
        setErrorKey(
          registering ? "accountRegisterFailed" : "accountLoginFailed",
        );
        return;
      }

      if (registering) {
        // Registration has succeeded even if saving the profile fails.
        try {
          const response = await fetch("/api/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName,
              lastName,
              timeZone:
                Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            }),
          });

          if (!response.ok) {
            throw new Error("Saving the registration profile failed.");
          }
        } catch {
          setErrorKey("profileSaveFailed");
          setEditingProfile(true);
        }
      }

      form.reset();
      await refetch();
    } catch {
      setErrorKey("accountConnectionFailed");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function signOut() {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setErrorKey("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setErrorKey("accountConnectionFailed");
        return;
      }

      setEditingProfile(false);
      setMode("login");
      await refetch();
    } catch {
      setErrorKey("accountConnectionFailed");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function profileSaved() {
    setEditingProfile(false);
    setErrorKey("");
    await refetch();
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setErrorKey("");
    setEditingProfile(false);
  }

  return (
    <section
      className="card backupSettings accountSettings"
      aria-labelledby="account-settings-title"
      aria-busy={busy || isPending}
    >
      <div>
        <h2 id="account-settings-title">{t("accountTitle")}</h2>
        <p>{t("accountDescription")}</p>
      </div>

      {isPending ? (
        <p role="status">{t("accountLoading")}</p>
      ) : sessionError ? (
        <div>
          <p role="alert">{t("accountConnectionFailed")}</p>

          <button
            type="button"
            className="ghost"
            onClick={() => {
              setErrorKey("");
              void refetch();
            }}
          >
            {t("accountRetry")}
          </button>
        </div>
      ) : session ? (
        <>
          <div className="backupSettingsPreview">
            <strong>{session.user.name}</strong>
            <p dir="ltr">{session.user.email}</p>
          </div>

          {editingProfile ? (
            <ProfileForm
              key={session.user.id}
              user={session.user}
              onSaved={profileSaved}
            />
          ) : (
            <div className="backupSettingsActions">
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={() => {
                  setErrorKey("");
                  setEditingProfile(true);
                }}
              >
                {t("edit")}
              </button>

              <button
                type="button"
                className="ghost"
                disabled={busy}
                onClick={signOut}
              >
                {t("accountSignOut")}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="backupSettingsActions">
            {["login", "register"].map((item) => (
              <button
                key={item}
                type="button"
                className={mode === item ? "primary" : "ghost"}
                aria-pressed={mode === item}
                disabled={busy}
                onClick={() => changeMode(item)}
              >
                {t(item === "login" ? "accountLogin" : "accountRegister")}
              </button>
            ))}
          </div>

          <form key={mode} className="form" onSubmit={submit}>
            <fieldset disabled={busy}>
              {mode === "register" && (
                <>
                  <label>
                    <span>{t("profileFirstName")}</span>

                    <input
                      name="firstName"
                      autoComplete="given-name"
                      required
                      maxLength={50}
                      pattern=".*\S.*"
                    />
                  </label>

                  <label>
                    <span>{t("profileLastName")}</span>

                    <input
                      name="lastName"
                      autoComplete="family-name"
                      maxLength={49}
                    />
                  </label>
                </>
              )}

              <label>
                <span>{t("accountEmail")}</span>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                  maxLength={191}
                />
              </label>

              <PasswordField
                label={t("accountPassword")}
                name="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                dir="ltr"
                required
                minLength={8}
                maxLength={128}
                disabled={busy}
              />

              <div className="backupSettingsActions">
                <button type="submit" className="primary" disabled={busy}>
                  {t(
                    busy
                      ? "accountLoading"
                      : mode === "register"
                        ? "accountRegister"
                        : "accountLogin",
                  )}
                </button>
              </div>
            </fieldset>
          </form>
        </>
      )}

      {errorKey && !sessionError && (
        <p className="backupSettingsError" role="alert">
          {t(errorKey)}
        </p>
      )}
    </section>
  );
}
