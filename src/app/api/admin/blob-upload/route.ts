import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Inside the try: a malformed JSON body must return a 400, not crash
    // the handler with an unhandled 500.
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const isAdmin = await verifySession();
        if (!isAdmin) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_SIZE_BYTES,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to record server-side: the form stores the blob URL.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
