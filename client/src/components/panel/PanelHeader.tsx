import { MapPin, X } from "lucide-react";
import type { RestaurantDetail } from "../../types/restaurant";
import { cn } from "../../utils/cn";
import { getCuisineColor } from "../../utils/colors";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";

interface PanelHeaderProps {
  restaurant: RestaurantDetail;
  onClose: () => void;
  className?: string;
}

const PRICE_TIER_LABELS: Record<number, string> = {
  1: "₹",
  2: "₹₹",
  3: "₹₹₹",
  4: "₹₹₹₹",
};

export default function PanelHeader({
  restaurant,
  onClose,
  className,
}: PanelHeaderProps) {
  const cuisineColor = getCuisineColor(restaurant.cuisine);
  const priceLabel = PRICE_TIER_LABELS[restaurant.priceTier] ?? "₹";
  const location = [restaurant.neighborhood, restaurant.cityName]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={cn("relative", className)}>
      {/* Logo / blurred header background */}
      {restaurant.logo ? (
        <div className="relative h-24 overflow-hidden rounded-t-lg">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900" />
          <div className="absolute bottom-3 left-4 w-12 h-12 rounded-lg overflow-hidden border border-zinc-700 shadow-lg">
            <img
              src={restaurant.logo}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-3 right-3">
            <IconButton icon={X} label="Close" onClick={onClose} size="sm" />
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between pt-4 px-4">
          {/* Colored accent dot as placeholder */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
            style={{
              backgroundColor: `${cuisineColor}33`,
              color: cuisineColor,
            }}
          >
            {restaurant.name.charAt(0)}
          </div>
          <IconButton icon={X} label="Close" onClick={onClose} size="sm" />
        </div>
      )}

      {/* Name + meta */}
      <div className={cn("px-4 pb-4", restaurant.logo ? "pt-2" : "pt-3")}>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-50 leading-tight">
          {restaurant.name}
        </h2>

        {restaurant.chainName && (
          <p className="text-xs text-zinc-500 mt-0.5">{restaurant.chainName}</p>
        )}

        <div className="flex items-center flex-wrap gap-2 mt-2">
          <Badge color={cuisineColor}>{restaurant.cuisine}</Badge>
          <span className="text-xs text-zinc-400 font-mono">{priceLabel}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500 font-mono">
            ₹{restaurant.costForTwo.toLocaleString("en-IN")} for 2
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={11} className="text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-500 truncate">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
