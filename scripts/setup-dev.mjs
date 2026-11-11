import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import webPush from "web-push";

const hostedWorkspaceName = process.env.CODESPACE_NAME;

const forwardingDomain =
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ||
  "app.github.dev";

const baseURL =
  process.env.DEV_APP_URL ||
  (
    hostedWorkspaceName
      ? `https://${hostedWorkspaceName}-3000.${forwardingDomain}`
      : "http://localhost:3000"
  );

const keys = webPush.generateVAPIDKeys();

const values = {
  BETTER_AUTH_URL: baseURL,
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),

  AUTH_EXTRA_TRUSTED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",

  NEXT_PUBLIC_VAPID_PUBLIC_KEY: keys.publicKey,
  VAPID_PRIVATE_KEY: keys.privateKey,

  VAPID_SUBJECT: "https://github.com/Mehdimmsbs/dapl",
};

const content = Object.entries(values)
  .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
  .join("\n");

try {
  writeFileSync("/output/.env.docker", `${content}\n`, {
    flag: "wx",
    mode: 0o600,
  });

  console.log("Development configuration created.");
  console.log(`Application URL: ${baseURL}`);
} catch (error) {
  if (error.code !== "EEXIST") {
    throw error;
  }

  console.log(".env.docker already exists; existing keys were preserved.");
}
