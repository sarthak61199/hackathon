import { Flame } from 'lucide-react'
import { useMapStore } from '../../stores/mapStore'
import IconButton from '../ui/IconButton'

export default function HeatmapToggle() {
  const showHeatmap = useMapStore((s) => s.showHeatmap)
  const toggleHeatmap = useMapStore((s) => s.toggleHeatmap)

  return (
    <IconButton
      icon={Flame}
      onClick={toggleHeatmap}
      active={showHeatmap}
      label={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
    />
  )
}
