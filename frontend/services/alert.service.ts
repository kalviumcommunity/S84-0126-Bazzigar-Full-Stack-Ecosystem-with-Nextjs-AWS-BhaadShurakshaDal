import { prisma } from "../lib/prisma";
import { getCache, setCache, invalidateCache } from "./cache.service";
import type { Alert, AlertSeverity } from "@/types/alert";

export async function getFloodAlerts(): Promise<Alert[]> {
  const CACHE_KEY = "flood_alerts";

  try {
    // Try to get from cache
    const cached = await getCache<Alert[]>(CACHE_KEY);
    if (cached) {
      console.log("✅ Alerts from cache");
      return cached;
    }
  } catch (error) {
    console.warn("⚠️ Cache retrieval failed, falling back to DB:", error);
  }

  try {
    // Fallback to database
    const alerts = await prisma.alert.findMany({
      include: { location: true },
      orderBy: { createdAt: "desc" },
    });

    // Cast to Alert[] type
    const typedAlerts = alerts as Alert[];

    // Try to cache the result (don't fail if it fails)
    await setCache(CACHE_KEY, typedAlerts, 300);

    console.log("✅ Alerts from database");
    return typedAlerts;
  } catch (error) {
    console.error("❌ Failed to fetch alerts:", error);
    throw new Error("Unable to fetch alerts from database");
  }
}

export async function createFloodAlert(
  message: string,
  severity: AlertSeverity,
  locationId: string,
): Promise<Alert> {
  try {
    const alert = await prisma.alert.create({
      data: { message, severity, locationId },
      include: { location: true },
    });

    // Invalidate cache properly
    await invalidateCache("flood_alerts");

    return alert as Alert;
  } catch (error) {
    console.error("❌ Failed to create alert:", error);
    throw new Error("Unable to create alert");
  }
}
