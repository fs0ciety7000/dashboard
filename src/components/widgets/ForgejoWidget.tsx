"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GitBranch, Star, GitFork, Lock, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  private: boolean;
  updatedAt: string;
  htmlUrl: string;
  owner: string;
}

const langColors: Record<string, string> = {
  Go: "bg-cyan-400",
  TypeScript: "bg-blue-400",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-400",
  Rust: "bg-orange-400",
  Shell: "bg-emerald-400",
  Dockerfile: "bg-sky-400",
  HTML: "bg-red-400",
  CSS: "bg-violet-400",
  Java: "bg-amber-400",
  C: "bg-slate-400",
  "C++": "bg-pink-400",
  PHP: "bg-indigo-400",
  Ruby: "bg-red-500",
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function ForgejoWidget() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/forgejo");
        if (res.ok) {
          setRepos(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
    const interval = setInterval(fetchRepos, 120000); // 2 min
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard noPadding>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Forgejo</h3>
        </div>
        <span className="text-[10px] text-slate-600">
          {repos.length} repos
        </span>
      </div>

      <div className="max-h-[350px] overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : repos.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            <p className="text-xs">No repos found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {repos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors block"
              >
                <div className="mt-0.5">
                  {repo.private ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400/60" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600">
                      {repo.owner}/
                    </span>
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {repo.name}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="text-[10px] text-slate-600 truncate mt-0.5">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${langColors[repo.language] || "bg-slate-500"}`}
                        />
                        <span className="text-[10px] text-slate-500">
                          {repo.language}
                        </span>
                      </div>
                    )}
                    {repo.stars > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-slate-600" />
                        <span className="text-[10px] text-slate-500">
                          {repo.stars}
                        </span>
                      </div>
                    )}
                    {repo.forks > 0 && (
                      <div className="flex items-center gap-0.5">
                        <GitFork className="w-2.5 h-2.5 text-slate-600" />
                        <span className="text-[10px] text-slate-500">
                          {repo.forks}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-700">
                      {timeAgo(repo.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
