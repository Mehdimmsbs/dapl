import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { getTrustedOrigins } from "./origins";

const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!baseURL || !secret) {
  throw new Error("Authentication environment is incomplete.");
}

export const auth = betterAuth({
  appName: "My Day",
  baseURL,
  secret,

  trustedOrigins: getTrustedOrigins(),

  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});
