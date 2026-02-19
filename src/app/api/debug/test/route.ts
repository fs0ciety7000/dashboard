import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test Arr (Sonarr)
  try {
    const url = process.env.SONARR_URL?.replace(/\/+$/, "");
    const key = process.env.SONARR_API_KEY;
    results.sonarr_env = { url: url ?? "MISSING", key: key ? `${key.slice(0, 4)}...` : "MISSING" };
    if (url && key) {
      const res = await fetch(`${url}/api/v3/series`, {
        headers: { "X-Api-Key": key },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results.sonarr = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 200),
        isArray: text.startsWith("["),
      };
    }
  } catch (e) {
    results.sonarr = { error: String(e) };
  }

  // Test Arr (Radarr)
  try {
    const url = process.env.RADARR_URL?.replace(/\/+$/, "");
    const key = process.env.RADARR_API_KEY;
    results.radarr_env = { url: url ?? "MISSING", key: key ? `${key.slice(0, 4)}...` : "MISSING" };
    if (url && key) {
      const res = await fetch(`${url}/api/v3/movie`, {
        headers: { "X-Api-Key": key },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results.radarr = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 200),
        isArray: text.startsWith("["),
      };
    }
  } catch (e) {
    results.radarr = { error: String(e) };
  }

  // Test Jellystat
  try {
    const url = process.env.JELLYSTAT_URL?.replace(/\/+$/, "");
    const key = process.env.JELLYSTAT_API_KEY;
    results.jellystat_env = { url: url ?? "MISSING", key: key ? `${key.slice(0, 4)}...` : "MISSING" };
    if (url && key) {
      const res = await fetch(`${url}/api/getLibraryCardStats`, {
        headers: { "x-api-token": key, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results.jellystat = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 300),
      };
    }
  } catch (e) {
    results.jellystat = { error: String(e) };
  }

  // Test Immich
  try {
    const url = process.env.IMMICH_URL?.replace(/\/+$/, "");
    const key = process.env.IMMICH_API_KEY;
    results.immich_env = { url: url ?? "MISSING", key: key ? `${key.slice(0, 4)}...` : "MISSING" };
    if (url && key) {
      const res = await fetch(`${url}/api/server/statistics`, {
        headers: { "x-api-key": key },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results.immich = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 300),
      };
    }
  } catch (e) {
    results.immich = { error: String(e) };
  }

  // Test Forgejo
  try {
    const url = process.env.FORGEJO_URL?.replace(/\/+$/, "");
    const token = process.env.FORGEJO_TOKEN;
    results.forgejo_env = { url: url ?? "MISSING", token: token ? `${token.slice(0, 4)}...` : "MISSING" };
    if (url && token) {
      const res = await fetch(`${url}/api/v1/user/repos?sort=updated&order=desc&limit=5`, {
        headers: { Authorization: `token ${token}` },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results.forgejo = {
        status: res.status,
        contentType: res.headers.get("content-type"),
        bodyLength: text.length,
        bodyPreview: text.slice(0, 300),
      };
    }
  } catch (e) {
    results.forgejo = { error: String(e) };
  }

  // Also test what our own API routes return
  // by calling the same logic inline
  try {
    const arrUrl = process.env.SONARR_URL;
    const arrKey = process.env.SONARR_API_KEY;
    results.arr_route_would_skip = !arrUrl || !arrKey;
    results.arr_route_url_type = typeof arrUrl;
    results.arr_route_key_type = typeof arrKey;
    results.arr_route_url_len = arrUrl?.length ?? 0;
    results.arr_route_key_len = arrKey?.length ?? 0;
  } catch (e) {
    results.arr_env_check = { error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
