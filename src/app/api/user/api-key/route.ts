import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const API_URL            = process.env.NEXT_PUBLIC_API_URL!;
const COORDINATOR_KEY    = process.env.AGENVIA_COORDINATOR_KEY!;

async function getCoordinatorToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: COORDINATOR_KEY }),
  });
  if (!res.ok) throw new Error("Failed to obtain coordinator token");
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tenant_id?: string; company_name?: string; contact_email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { tenant_id, company_name, contact_email } = body;

  if (!tenant_id || !company_name || !contact_email) {
    return NextResponse.json(
      { error: "tenant_id, company_name and contact_email are required" },
      { status: 400 },
    );
  }

  // Validate slug format
  if (!/^[a-z0-9_\-]{3,64}$/.test(tenant_id)) {
    return NextResponse.json(
      { error: "tenant_id must be 3–64 chars, lowercase letters, numbers, _ or -" },
      { status: 400 },
    );
  }

  try {
    const token = await getCoordinatorToken();

    const res = await fetch(`${API_URL}/admin/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id, company_name, contact_email, clerk_user_id: userId }),
    });

    if (res.status === 409) {
      const err409 = await res.json().catch(() => ({}));
      const detail = (err409 as { detail?: string }).detail ?? "";
      const msg = detail.includes("already has a tenant")
        ? "Your account already has an organization registered"
        : "Tenant ID already taken — choose a different one";
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { detail?: string }).detail ?? "Failed to create tenant" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json({
      tenant_id:    data.tenant_id,
      company_name: data.company_name,
      agent_key:    data.agent_key,
      admin_key:    data.admin_key,
    });
  } catch (err) {
    console.error("Tenant creation error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
