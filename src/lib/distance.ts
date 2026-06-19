// ----------------------------------------------------------------
// Distance helpers.
//
// haversineKm() is a cheap straight-line estimate used only to build
// a candidate set before hitting the Google Distance Matrix API
// (which bills per element and is rate-limited). Driving distance is
// always >= straight-line distance, so callers must pre-filter with
// a generous multiplier — not the raw search radius — or they will
// wrongly exclude pharmacies that are within radius by road.
// ----------------------------------------------------------------

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Straight-line distance always underestimates road distance, so the
// pre-filter radius is widened by this factor before calling the
// Distance Matrix API.
const PREFILTER_MULTIPLIER = 1.6;

export function prefilterRadiusKm(radiusKm: number) {
  return radiusKm * PREFILTER_MULTIPLIER;
}

const DISTANCE_MATRIX_BATCH_SIZE = 25; // Google Distance Matrix destination limit per request

/**
 * Looks up real driving distance (km) from one origin to many destinations
 * via the Google Distance Matrix API. Falls back to the supplied
 * straight-line distance for any destination where the API call fails,
 * returns no result, or the API key/feature isn't available — so the
 * page never breaks even if the Distance Matrix API is unreachable.
 */
export async function getDrivingDistancesKm(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number; fallbackKm: number }[]
): Promise<number[]> {
  // Prefer a server-only, unrestricted key. The NEXT_PUBLIC_ key is
  // exposed to the browser and is typically HTTP-referrer restricted,
  // which makes server-side Distance Matrix calls fail with
  // REQUEST_DENIED — causing a silent fallback to straight-line.
  const apiKey =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || destinations.length === 0) {
    return destinations.map((d) => d.fallbackKm);
  }

  const results: number[] = new Array(destinations.length);

  for (let i = 0; i < destinations.length; i += DISTANCE_MATRIX_BATCH_SIZE) {
    const batch = destinations.slice(i, i + DISTANCE_MATRIX_BATCH_SIZE);
    const destParam = batch.map((d) => `${d.lat},${d.lng}`).join("|");
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?units=metric&mode=driving` +
      `&origins=${origin.lat},${origin.lng}` +
      `&destinations=${encodeURIComponent(destParam)}` +
      `&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      // Surface API-level failures (REQUEST_DENIED, OVER_QUERY_LIMIT,
      // etc.) — these are the usual reason the page silently falls
      // back to straight-line distance.
      if (data?.status !== "OK") {
        console.error(
          `[distance] Distance Matrix API status=${data?.status}` +
            (data?.error_message ? ` — ${data.error_message}` : "")
        );
      }

      const elements = data?.rows?.[0]?.elements ?? [];

      batch.forEach((d, idx) => {
        const el = elements[idx];
        if (el?.status === "OK" && typeof el.distance?.value === "number") {
          results[i + idx] = el.distance.value / 1000;
        } else {
          results[i + idx] = d.fallbackKm;
        }
      });
    } catch (err) {
      console.error("[distance] Distance Matrix request failed:", err);
      batch.forEach((d, idx) => {
        results[i + idx] = d.fallbackKm;
      });
    }
  }

  return results;
}
