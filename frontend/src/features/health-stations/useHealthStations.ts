import { useState, useEffect } from "react";
import { listHealthStations } from "./api";
import type { HealthStation } from "./types";

export function useHealthStations() {
  const [stations, setStations] = useState<HealthStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listHealthStations()
      .then(setStations)
      .catch(() => setError("Failed to load health stations. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  return { stations, loading, error };
}
