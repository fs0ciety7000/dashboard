import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.FORGEJO_URL?.replace(/\/+$/, "");
  const token = process.env.FORGEJO_TOKEN;

  if (!url || !token) {
    return NextResponse.json([]);
  }

  try {
    const headers: Record<string, string> = { Authorization: `token ${token}` };
    const opts: RequestInit = { headers, signal: AbortSignal.timeout(10000) };

    // Try repos/search first (requires fewer token scopes)
    let res = await fetch(
      `${url}/api/v1/repos/search?sort=updated&order=desc&limit=15`,
      opts
    );

    // Fallback to user/repos if search endpoint fails
    if (!res.ok) {
      console.error("Forgejo repos/search error:", res.status, await res.text().catch(() => ""));
      res = await fetch(
        `${url}/api/v1/user/repos?sort=updated&order=desc&limit=15`,
        { headers, signal: AbortSignal.timeout(10000) }
      );
    }

    if (!res.ok) {
      console.error("Forgejo repos/search error:", res.status);
      return NextResponse.json([]);
    }

    const data = await res.json();
    // /user/repos returns array directly, /repos/search returns { data: [...] }
    const rawRepos = Array.isArray(data) ? data : (data.data ?? []);

    const repos = rawRepos.map((repo: Record<string, unknown>) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      language: repo.language || null,
      stars: repo.stars_count ?? 0,
      forks: repo.forks_count ?? 0,
      private: repo.private ?? false,
      updatedAt: repo.updated_at ?? "",
      htmlUrl: repo.html_url ?? "",
      owner: (repo.owner as Record<string, unknown>)?.login ?? "unknown",
      avatar: (repo.owner as Record<string, unknown>)?.avatar_url ?? "",
    }));

    return NextResponse.json(repos);
  } catch (error) {
    console.error("Forgejo API error:", error);
    return NextResponse.json([]);
  }
}
