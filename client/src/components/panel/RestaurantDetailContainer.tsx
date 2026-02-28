import { useRef, useCallback } from "react";
import Sidebar, { type SidebarHandle } from "./Sidebar";
import BottomSheet, { type BottomSheetHandle } from "./BottomSheet";
import PanelHeader from "./PanelHeader";
import PersonalStats from "./PersonalStats";
import SpendSparkline from "./SpendSparkline";
import Overlay from "../ui/Overlay";
import Skeleton from "../ui/Skeleton";
import Divider from "../ui/Divider";
import { useMapStore } from "../../stores/mapStore";
import { useAppStore } from "../../stores/appStore";
import { useRestaurantDetail } from "../../api/queries";
import { useMediaQuery } from "../../hooks/useMediaQuery";

function PanelSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton width={40} height={40} borderRadius="0.5rem" />
        <div className="flex-1 space-y-2">
          <Skeleton height={22} width="60%" />
          <Skeleton height={14} width="40%" />
        </div>
        <Skeleton circle width={32} height={32} />
      </div>
      <div className="flex gap-2">
        <Skeleton height={20} width={70} borderRadius="9999px" />
        <Skeleton height={20} width={40} />
        <Skeleton height={20} width={80} />
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton height={12} width="50%" />
            <Skeleton height={22} width="70%" />
          </div>
        ))}
      </div>

      <Divider />

      <Skeleton height={60} />
    </div>
  );
}

function PanelContent({
  restaurantId,
  customerId,
  onClose,
}: {
  restaurantId: number;
  customerId: number;
  onClose: () => void;
}) {
  const { data, isLoading } = useRestaurantDetail(restaurantId, customerId);

  if (isLoading || !data) {
    return <PanelSkeleton />;
  }

  return (
    <>
      <PanelHeader restaurant={data} onClose={onClose} />
      <PersonalStats stats={data.customerStats} />
      <SpendSparkline timeline={data.customerStats.spendTimeline} />
    </>
  );
}

export default function RestaurantDetailContainer() {
  const { selectedRestaurantId, isPanelOpen, closePanel } = useMapStore();
  const { customerId } = useAppStore();
  const isDesktop = useMediaQuery(768);
  const sidebarRef = useRef<SidebarHandle>(null);
  const sheetRef = useRef<BottomSheetHandle>(null);

  const dismissSidebar = useCallback(() => {
    sidebarRef.current?.dismiss();
  }, []);

  const dismissSheet = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  if (!isPanelOpen || selectedRestaurantId === null || customerId === null) {
    return null;
  }

  if (isDesktop) {
    return (
      <Sidebar ref={sidebarRef} onClose={closePanel}>
        <PanelContent
          restaurantId={selectedRestaurantId}
          customerId={customerId}
          onClose={dismissSidebar}
        />
      </Sidebar>
    );
  }

  return (
    <>
      <Overlay onClick={dismissSheet} opacity={60} />
      <BottomSheet ref={sheetRef} onClose={closePanel}>
        <PanelContent
          restaurantId={selectedRestaurantId}
          customerId={customerId}
          onClose={dismissSheet}
        />
      </BottomSheet>
    </>
  );
}
