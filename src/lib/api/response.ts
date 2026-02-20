import { NextResponse } from "next/server";

/**
 * Standardized API error response.
 * Always returns { error: string, details?: object }.
 */
export function apiError(
  message: string,
  status: number,
  details?: object,
  headers?: Record<string, string>,
) {
  const body: { error: string; details?: object } = { error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status, headers });
}

/**
 * Standardized JSON parse helper for API routes.
 * Returns parsed JSON or an error response.
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ data: unknown } | { error: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch {
    return { error: apiError("Request body must be valid JSON", 400) };
  }
}
