import { NextResponse } from "next/server";
import { services } from "@/config/services";
import type { ServiceStatus } from "@/config/services";

async function checkService(url: string): Promise<ServiceStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (res.ok || res.status === 401 || res.status === 403 || res.status === 302) {
      return "online";
    }
    if (res.status >= 500) {
      return "error";
    }
    return "online";
  } catch {
    return "offline";
  }
}

export async function GET() {
  const statuses: Record<string, ServiceStatus> = {};

  const results = await Promise.allSettled(
    services.map(async (service) => {
      const status = await checkService(service.url);
      return { id: service.id, status };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      statuses[result.value.id] = result.value.status;
    }
  }

  return NextResponse.json(statuses);
}
