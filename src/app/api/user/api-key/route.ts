import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const UNKEY_ROOT_KEY = process.env.UNKEY_ROOT_KEY!;
const UNKEY_API_ID = process.env.UNKEY_API_ID!;

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "unknown";
  const tenantId = userId; // use Clerk userId as tenant

  try {
    const res = await fetch("https://api.unkey.com/v2/keys.createKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${UNKEY_ROOT_KEY}`,
      },
      body: JSON.stringify({
        apiId: UNKEY_API_ID,
        prefix: "av",
        name: email,
        meta: {
          tenant_id: tenantId,
          actor_id: userId,
          role: "agent",
          email,
        },
      }),
    });

    const data = await res.json();
    const key = data?.result?.key ?? data?.data?.key ?? data?.key;

    if (!key) {
      console.error("Unkey createKey response:", JSON.stringify(data));
      return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
    }

    return NextResponse.json({ api_key: key });
  } catch (err) {
    console.error("Unkey error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
