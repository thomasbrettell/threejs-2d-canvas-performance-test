export const randomNumRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

export function shuffle(a) {
  const array = [...a];
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function latLongToSphereXyz({ latitude, longitude, altitude = 0, radius }) {
  const earthRadius = 6378137.0; // Semi-major axis of WGS 84 ellipsoid in meters
  const f = 1 / 298.257223563; // Flattening of WGS 84 ellipsoid
  const earthMinorRadius = earthRadius * (1 - f); // Semi-minor axis of WGS 84 ellipsoid in meters

  const latRadians = (latitude * Math.PI) / 180.0;
  const lonRadians = (longitude * Math.PI) / 180.0;
  const sinLat = Math.sin(latRadians);
  const cosLat = Math.cos(latRadians);
  const sinLon = Math.sin(lonRadians);
  const cosLon = Math.cos(lonRadians);

  const eSquared = 2 * f - f * f; // Eccentricity squared
  const N = earthRadius / Math.sqrt(1 - eSquared * sinLat * sinLat); // Radius of curvature in the prime vertical
  const x = (N + altitude) * cosLat * cosLon;
  const y = (N + altitude) * cosLat * sinLon;
  const z = (((earthMinorRadius * earthMinorRadius) / (earthRadius * earthRadius)) * N + altitude) * sinLat;

  const scaleFactor = radius / earthRadius;
  const adjustedX = x * scaleFactor;
  const adjustedY = y * scaleFactor;
  const adjustedZ = z * scaleFactor;

  return [adjustedX, adjustedY, adjustedZ];
}
