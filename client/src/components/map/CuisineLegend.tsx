import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useRestaurants } from "../../api/queries";
import { useAppStore } from "../../stores/appStore";
import Card from "../ui/Card";

export default function CuisineLegend() {
  const [collapsed, setCollapsed] = useState(false);
  const customerId = useAppStore((s) => s.customerId);
  const { data } = useRestaurants(customerId);

  const colorMap = data?.meta.cuisineColorMap;
  if (!colorMap) return null;

  const entries = Object.entries(colorMap);

  return (
    <Card className="absolute bottom-4 left-4 p-3 max-w-[160px] z-10">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between w-full text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-2 hover:text-zinc-200 transition-colors"
      >
        <span>Cuisines</span>
        {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
      </button>

      {collapsed ? (
        // Compact: just colored dots
        <div className="flex gap-1 flex-wrap">
          {entries.map(([cuisine, color]) => (
            <div
              key={cuisine}
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
              title={cuisine}
            />
          ))}
        </div>
      ) : (
        // Full list: dot + name
        <div className="space-y-1.5">
          {entries.map(([cuisine, color]) => (
            <div key={cuisine} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-zinc-300 truncate">{cuisine}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
