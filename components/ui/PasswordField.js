"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useLanguage } from "../providers/LanguageProvider";

export default function PasswordField({ label, ...props }) {
  const { t } = useLanguage();
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="passwordField">
      <label htmlFor={id}>{label}</label>

      <div className="passwordFieldControl">
        <input {...props} id={id} type={visible ? "text" : "password"} />

        <button
          type="button"
          className="passwordVisibility"
          disabled={props.disabled}
          aria-label={t(visible ? "passwordHide" : "passwordShow")}
          aria-controls={id}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
