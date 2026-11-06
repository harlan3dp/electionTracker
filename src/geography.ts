import coastline from './data/nz-coastline.json'

// Local equirectangular projection, scaled for latitude 41°S; same transform for coast and markers.
export const project = (longitude: number, latitude: number) => ({ x: (longitude - 165) * 24, y: (-33 - latitude) * 37 })
export const coastPaths = coastline.coordinates
  .filter(polygon => polygon[0].some(([lon, lat]) => lon >= 166 && lon <= 179 && lat <= -34 && lat >= -48))
  .map(polygon => polygon.map(ring => ring.map(([lon, lat], i) => {
    const p = project(lon, lat)
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }).join(' ') + 'Z').join(' '))
