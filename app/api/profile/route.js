import { auth } from "../../../lib/server/auth";
import { prisma } from "../../../lib/server/prisma";

export const runtime = "nodejs";

function respond(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return respond({ error: "UNAUTHORIZED" }, 401);
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        timeZone: true,
      },
    });

    return respond({
      profile: profile ?? {
        firstName: "",
        lastName: "",
        timeZone: "",
      },
    });
  } catch (error) {
    console.error("Reading profile failed:", error);
    return respond({ error: "PROFILE_READ_FAILED" }, 500);
  }
}

export async function PUT(request) {
  // Accept changes only from this application's configured origin.
  const allowedOrigins = new Set([
    new URL(process.env.BETTER_AUTH_URL).origin,

    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
  ]);

  if (!allowedOrigins.has(request.headers.get("origin"))) {
    return respond({ error: "INVALID_ORIGIN" }, 403);
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return respond({ error: "UNAUTHORIZED" }, 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return respond({ error: "INVALID_PROFILE" }, 400);
    }

    if (
      !body ||
      typeof body.firstName !== "string" ||
      typeof body.lastName !== "string" ||
      typeof body.timeZone !== "string"
    ) {
      return respond({ error: "INVALID_PROFILE" }, 400);
    }

    const firstName = body.firstName.trim();
    const lastName = body.lastName.trim();
    const timeZone = body.timeZone.trim();
    const name = [firstName, lastName].filter(Boolean).join(" ");

    if (
      !firstName ||
      firstName.length > 100 ||
      lastName.length > 100 ||
      name.length > 100 ||
      timeZone.length > 100
    ) {
      return respond({ error: "INVALID_PROFILE" }, 400);
    }

    try {
      new Intl.DateTimeFormat("en", { timeZone }).format();
    } catch {
      return respond({ error: "INVALID_PROFILE" }, 400);
    }

    const profile = await prisma.$transaction(async (database) => {
      await database.user.update({
        where: { id: session.user.id },
        data: { name },
      });

      return database.profile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          firstName,
          lastName: lastName || null,
          timeZone,
        },
        update: {
          firstName,
          lastName: lastName || null,
          timeZone,
        },
        select: {
          firstName: true,
          lastName: true,
          timeZone: true,
        },
      });
    });

    return respond({ profile });
  } catch (error) {
    console.error("Saving profile failed:", error);
    return respond({ error: "PROFILE_SAVE_FAILED" }, 500);
  }
}
