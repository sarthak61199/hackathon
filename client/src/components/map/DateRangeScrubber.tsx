import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import dayjs from "dayjs";
import { useMapStore } from "../../stores/mapStore";

// The absolute earliest date the scrubber can go to
const EPOCH = "2020-01-01";
const EPOCH_DAY = dayjs(EPOCH);
const TOTAL_DAYS = dayjs().diff(EPOCH_DAY, "day");

function isoToOffset(iso: string): number {
  return Math.max(0, Math.min(TOTAL_DAYS, dayjs(iso).diff(EPOCH_DAY, "day")));
}

function offsetToIso(offset: number): string {
  return EPOCH_DAY.add(offset, "day").format("YYYY-MM-DD");
}

function offsetToLabel(offset: number): string {
  return EPOCH_DAY.add(offset, "day").format("MMM YYYY");
}

const TRACK_STYLE = { backgroundColor: "#6366f1", height: 4 };
const RAIL_STYLE = { backgroundColor: "#3f3f46", height: 4 };
const HANDLE_STYLE = {
  backgroundColor: "#6366f1",
  borderColor: "#818cf8",
  borderWidth: 2,
  width: 20,
  height: 20,
  marginTop: -8,
  opacity: 1,
  boxShadow: "0 0 0 3px rgba(99,102,241,0.25)",
};

export default function DateRangeScrubber() {
  const { dateRange, setDateRange } = useMapStore();

  const startOffset = isoToOffset(dateRange.start);
  const endOffset = isoToOffset(dateRange.end);

  function handleChange(value: number | number[]) {
    if (!Array.isArray(value)) return;
    setDateRange({
      start: offsetToIso(value[0]),
      end: offsetToIso(value[1]),
    });
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(600px,calc(100vw-2rem))]">
      <div className="bg-zinc-900/85 backdrop-blur-md border border-zinc-700/50 rounded-xl px-5 py-3 shadow-xl">
        {/* Date labels */}
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium text-indigo-400">
            {offsetToLabel(startOffset)}
          </span>
          <span className="text-xs font-medium text-indigo-400">
            {offsetToLabel(endOffset)}
          </span>
        </div>

        {/* Slider */}
        <Slider
          range
          min={0}
          max={TOTAL_DAYS}
          value={[startOffset, endOffset]}
          onChange={handleChange}
          allowCross={false}
          styles={{
            track: TRACK_STYLE,
            rail: RAIL_STYLE,
            handle: HANDLE_STYLE,
          }}
        />

        {/* Full range hint */}
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-zinc-500">{EPOCH}</span>
          <span className="text-[10px] text-zinc-500">Today</span>
        </div>
      </div>
    </div>
  );
}
