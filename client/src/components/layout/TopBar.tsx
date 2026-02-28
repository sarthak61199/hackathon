import { Link, useLocation } from "react-router";
import { MapPin } from "lucide-react";
import { cn } from "../../utils/cn";

export default function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="h-14 shrink-0 flex items-center px-4 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <MapPin size={14} className="text-white" />
        </div>
        <span className="font-semibold text-zinc-50 tracking-tight">
          Crumbs
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        <Link
          to="/"
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
            pathname === "/"
              ? "text-indigo-400 bg-indigo-500/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
          )}
        >
          Map
        </Link>
        <Link
          to="/analytics"
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
            pathname === "/analytics"
              ? "text-indigo-400 bg-indigo-500/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
          )}
        >
          Analytics
        </Link>
      </nav>

      {/* Right side — placeholder for SearchBar + ViewToggle (added in Phase 6) */}
      <div className="ml-auto" />
    </header>
  );
}
