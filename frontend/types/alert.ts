export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  riskLevel: string;
  createdAt: Date;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  locationId: string;
  createdAt: Date;
  location?: Location;
}
