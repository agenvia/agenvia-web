import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/promptrak-content";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title") || siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, rgba(109,242,214,0.18), transparent 30%), linear-gradient(180deg, #f7fbfc 0%, #edf3f5 48%, #f7fafb 100%)",
          fontSize: 32,
          fontWeight: 600,
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.86)",
            borderRadius: "40px",
            background: "rgba(255,255,255,0.78)",
            boxShadow: "0 30px 80px -38px rgba(15,23,42,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icons.logo
              style={{
                width: "84px",
                height: "84px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "58px",
              fontWeight: "600",
              marginTop: "24px",
              textAlign: "center",
              width: "80%",
              letterSpacing: "-0.05em",
              color: "#0f172a",
            }}
          >
            {postTitle}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: "500",
              marginTop: "16px",
              color: "#475569",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: "24px",
              padding: "12px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(13,148,136,0.18)",
              background: "rgba(240,253,250,0.92)",
              color: "#115e59",
              fontSize: "18px",
            }}
          >
            Privacy Gateway for Enterprise AI
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
