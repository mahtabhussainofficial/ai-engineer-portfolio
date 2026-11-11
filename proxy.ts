import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/projects-data";

export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);

  if (segments.length === 2 && segments[0] === "projects") {
    let slug = segments[1];
    try {
      slug = decodeURIComponent(segments[1]);
    } catch {
      return NextResponse.rewrite(
        new URL("/__project-not-found__", request.url),
        { status: 404 },
      );
    }

    if (!getProjectBySlug(slug)) {
      return NextResponse.rewrite(
        new URL("/__project-not-found__", request.url),
        { status: 404 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:slug"],
};
