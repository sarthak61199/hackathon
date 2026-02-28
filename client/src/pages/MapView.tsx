import MapCanvas from '../components/map/MapCanvas'
import CuisineLegend from '../components/map/CuisineLegend'
import DateRangeScrubber from '../components/map/DateRangeScrubber'
import RestaurantDetailContainer from '../components/panel/RestaurantDetailContainer'

export default function MapView() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapCanvas />
      <CuisineLegend />
      <DateRangeScrubber />
      <RestaurantDetailContainer />
    </div>
  )
}
