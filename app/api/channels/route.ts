import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { name, type } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorised", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server id is missing", { status: 400 });
    }

    if (name == "general") {
      return new NextResponse("name cannot be general", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.MODERATOR, MemberRole.ADMIN],
            },
          },
        },
      },
      data: {
        channels: {
          create: [
            {
              profileId: profile.id,
              name,
              type,
            },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (err) {
    console.log("[CHANNELS_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
