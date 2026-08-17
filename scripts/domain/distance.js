const EARTH_RADIUS_METRES = 6_371_000

const radians = (degrees) => degrees * Math.PI / 180
const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function distanceMeters(from, to) {
  const latitudeDelta = radians(to.latitude - from.latitude)
  const longitudeDelta = radians(to.longitude - from.longitude)
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude))
    * Math.cos(radians(to.latitude))
    * Math.sin(longitudeDelta / 2) ** 2

  return Math.round(
    EARTH_RADIUS_METRES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  )
}

export function sortByDistance(items, origin) {
  return items
    .map((item) => ({
      ...item,
      distanceMeters: distanceMeters(origin, item)
    }))
    .sort((first, second) => first.distanceMeters - second.distanceMeters)
}

export function normalizeMapPoint(point, bounds) {
  const x = clamp01(
    (point.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)
  )
  const y = clamp01(
    1 - (point.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)
  )

  return { x, y }
}
