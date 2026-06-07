"use client";

import {
  IconCalendar,
  IconClock,
  IconTrash,
  IconEdit,
  IconPlane,
  IconBed,
  IconToolsKitchen2,
  IconRun,
  IconCar,
  IconFileDescription,
} from "@tabler/icons-react";
import type { ItineraryItem } from "@/types/trip";

type ItineraryListProps = {
  items: ItineraryItem[];
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: ItineraryItem) => void;
};

const TYPE_ICONS: Record<string, typeof IconPlane> = {
  flight: IconPlane,
  hotel: IconBed,
  restaurant: IconToolsKitchen2,
  activity: IconRun,
  transport: IconCar,
  other: IconFileDescription,
};

export function ItineraryList({ items, onRemoveItem, onEditItem }: ItineraryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-5 text-secondary small">
        No itinerary items yet. Click "Add Item" to start planning.
      </div>
    );
  }

  const grouped: Record<string, ItineraryItem[]> = {};
  for (const item of items) {
    const day = item.date.slice(0, 10);
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(item);
  }

  const sortedDays = Object.keys(grouped).sort();

  const formatDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="timeline">
      {sortedDays.map((day) => (
        <div key={day} className="mb-4">
          <h4 className="h5 mb-3 d-flex align-items-center gap-2">
            <IconCalendar size={16} className="text-secondary" />
            <span>{formatDay(day)}</span>
          </h4>

          <div className="d-flex flex-column gap-2">
            {grouped[day].map((item, index) => (
              <div
                key={item.id}
                className="card shadow-sm border-0"
                style={{
                  borderLeft: "4px solid var(--tblr-primary, oklch(0.58 0.19 256))",
                }}
              >
                <div className="card-body p-3 d-flex align-items-start justify-content-between gap-2">
                  <div className="d-flex align-items-start gap-3">
                    <span className="text-secondary d-flex">
                      {(() => {
                        const Icon = TYPE_ICONS[item.type] || IconFileDescription;
                        return <Icon size={20} stroke={1.5} />;
                      })()}
                    </span>
                    <div>
                      <h5 className="card-title h6 mb-1">{item.name}</h5>
                      <div className="d-flex align-items-center gap-1 text-secondary small">
                        <IconClock size={12} />
                        <span>{formatTime(item.date)}</span>
                        <span className="badge bg-secondary-lt text-capitalize ms-1">{item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-ghost-secondary"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => onEditItem(item)}
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-ghost-danger"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
