import { NextRequest, NextResponse } from "next/server";
import { generateCreativesSchema } from "@/lib/validators/campaign-schema";

/**
 * Incoming webhook endpoint for Make.com (or any external trigger).
 *
 * Make sends a POST with campaign data. This endpoint validates the payload,
 * then internally calls the creative generation pipeline and returns the result.
 *
 * Make scenario flow:
 *   Google Sheet row → HTTP module → POST /api/v1/webhooks/incoming → receive asset URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that the payload matches the expected schema
    const parsed = generateCreativesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Forward to the internal generation endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${appUrl}/api/v1/creatives/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET handler for Make.com webhook verification.
 * Make sometimes sends a GET to verify the endpoint exists.
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "ad-creative-tool",
    endpoint: "/api/v1/webhooks/incoming",
    accepts: "POST",
    schema: {
      campaign: {
        name: "string (required)",
        brandId: "string (required)",
        categoryId: "string (required)",
        productName: "string (required)",
        productDescription: "string (optional)",
        targetAudience: "string (optional)",
        badgeText: "string (optional)",
        backgroundImageUrl: "string url (optional)",
      },
      platforms: "string[] (required, at least 1 preset ID)",
      copyVariants: "number (1-5, default 3)",
      options: {
        generateBackgroundPrompt: "boolean (default true)",
      },
    },
  });
}
