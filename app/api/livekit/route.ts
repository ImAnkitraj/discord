import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");

  if (!room) {
    console.log("Missing room");
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }
  if (!username) {
    console.log("Missing username");
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    console.log("Server misconfigured");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 400 }
    );
  }
  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  return NextResponse.json(
    {
      token: await at.toJwt(),
    },
    { status: 200 }
  );
}