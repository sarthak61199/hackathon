import MapCanvas from '../components/map/MapCanvas'
import CuisineLegend from '../components/map/CuisineLegend'

export default function MapView() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapCanvas />
      <CuisineLegend />
    </div>
  )
}
