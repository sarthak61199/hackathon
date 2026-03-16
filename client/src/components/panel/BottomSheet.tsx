import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "../../utils/cn";
import DragHandle from "../ui/DragHandle";

gsap.registerPlugin(Draggable, InertiaPlugin);

export interface BottomSheetHandle {
  dismiss: () => void;
}

interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

function getSnapPoints() {
  const vh = window.innerHeight;
  return {
    full: 0, // 95vh visible
    third: vh * 0.33, // ~67vh visible
    half: vh * 0.45, // ~50vh visible
    peek: vh * 0.65, // ~30vh visible
    dismiss: vh * 0.78, // dismiss threshold
  };
}

function nearestSnap(y: number): number {
  const { full, third, half, peek } = getSnapPoints();
  const points = [full, third, half, peek];
  return points.reduce((prev, cur) =>
    Math.abs(cur - y) < Math.abs(prev - y) ? cur : prev,
  );
}

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  function BottomSheet({ children, onClose, className }, ref) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    const dismiss = useCallback(() => {
      if (!sheetRef.current) return;
      gsap.to(sheetRef.current, {
        y: window.innerHeight,
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => onCloseRef.current(),
      });
    }, []);

    useImperativeHandle(ref, () => ({ dismiss }), [dismiss]);

    // Entrance animation
    useGSAP(
      () => {
        if (!sheetRef.current) return;
        const { third } = getSnapPoints();
        gsap.fromTo(
          sheetRef.current,
          { y: window.innerHeight },
          { y: third, duration: 0.45, ease: "power3.out" },
        );
      },
      { scope: sheetRef },
    );

    // Draggable setup
    useEffect(() => {
      if (!sheetRef.current) return;
      const el = sheetRef.current;

      InertiaPlugin.track(el, "y");

      const instances = Draggable.create(el, {
        type: "y",
        bounds: { minY: 0, maxY: window.innerHeight },
        onDragEnd() {
          const y = gsap.getProperty(el, "y") as number;
          const vel = InertiaPlugin.getVelocity(el, "y");
          const { dismiss: dismissY, half, full } = getSnapPoints();

          // Swipe down fast or past threshold → dismiss
          if (vel > 800 || y > dismissY) {
            gsap.to(el, {
              y: window.innerHeight,
              duration: 0.3,
              ease: "power3.in",
              onComplete: () => onCloseRef.current(),
            });
            return;
          }

          // Swipe up fast → snap to next expanded state
          if (vel < -700) {
            const target = y > half ? half : full;
            gsap.to(el, { y: target, duration: 0.35, ease: "power3.out" });
            return;
          }

          // Snap to nearest point
          gsap.to(el, {
            y: nearestSnap(y),
            duration: 0.35,
            ease: "power3.out",
          });
        },
      });

      return () => {
        InertiaPlugin.untrack(el);
        instances.forEach((d) => d.kill());
      };
    }, []);

    return (
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "h-[95vh]",
          "bg-zinc-900/95 backdrop-blur-md",
          "border-t border-zinc-700/50",
          "rounded-t-2xl",
          "will-change-transform",
          className,
        )}
      >
        <button
          onClick={dismiss}
          aria-label="Close panel"
          className="w-full focus-visible:outline-none"
        >
          <DragHandle />
        </button>
        <div className="overflow-y-auto overscroll-contain h-[calc(95vh-2rem)]">
          {children}
        </div>
      </div>
    );
  },
);

export default BottomSheet;
