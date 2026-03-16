import { cn } from "../../utils/cn";
import HeatmapToggle from "./HeatmapToggle";

export default function MapToolbar() {
  return (
    <div
      className={cn(
        // Desktop: vertical stack, top-right below Mapbox nav control
        "absolute z-10 flex gap-2",
        "top-[104px] right-3 flex-col",
        // Mobile: horizontal row, bottom-right above date scrubber
      )}
    >
      <HeatmapToggle />
    </div>
  );
}
