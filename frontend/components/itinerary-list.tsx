"use client";

import {
  IconTrash,
  IconPlaneDeparture,
  IconBed,
  IconToolsKitchen2,
  IconTent,
  IconCar,
  IconMapPin,
} from "@tabler/icons-react";
import type { ItineraryItem } from "@/types/trip";

type ItineraryListProps = {
  items: ItineraryItem[];
  onRemoveItem: (itemId: string) => void;
};

// Map type to icon and text representation
const TYPE_MAP: Record<
  string,
  { label: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  flight: { label: "Flight", bg: "bg-azure-lt", icon: IconPlaneDeparture },
  hotel: { label: "Lodging", bg: "bg-purple-lt", icon: IconBed },
  restaurant: { label: "Dining", bg: "bg-orange-lt", icon: IconToolsKitchen2 },
  activity: { label: "Activity", bg: "bg-green-lt", icon: IconTent },
  transport: { label: "Transport", bg: "bg-yellow-lt", icon: IconCar },
  other: { label: "Other", bg: "bg-secondary-lt", icon: IconMapPin },
};

export function ItineraryList({ items, onRemoveItem }: ItineraryListProps) {
  const formatTime = (dateStr: string) => {
    if (!dateStr.includes("T")) return null;
    try {
      const timeStr = dateStr.split("T")[1];
      const [hoursStr, minutesStr] = timeStr.split(":");
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return null;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 border rounded-3 bg-light-lt">
        <p className="text-muted mb-0">No itinerary items scheduled yet.</p>
        <p className="text-muted small mb-0">Use the form below to plan your days!</p>
      </div>
    );
  }

  // Group items by date (extracting YYYY-MM-DD)
  const groupedItems = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    const dayKey = item.date.split("T")[0];
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(item);
    return acc;
  }, {});

  // Sort dates ascending
  const sortedDates = Object.keys(groupedItems).sort();

  // Sort items within each day chronologically
  Object.keys(groupedItems).forEach((dayKey) => {
    groupedItems[dayKey].sort((a, b) => a.date.localeCompare(b.date));
  });

  const formatDateHeader = (dateStr: string) => {
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

  return (
    <div className="space-y-4">
      {sortedDates.map((dateStr) => (
        <div key={dateStr} className="card shadow-sm border-0">
          <div className="card-header bg-light py-2 px-3">
            <h4 className="card-title h4 mb-0 text-secondary-emphasis">
              {formatDateHeader(dateStr)}
            </h4>
          </div>

          <div className="list-group list-group-flush">
            {groupedItems[dateStr].map((item) => {
              const typeDetails = TYPE_MAP[item.type] || TYPE_MAP.other;
              const IconComponent = typeDetails.icon;

              return (
                <div
                  key={item.id}
                  className="list-group-item d-flex align-items-center justify-content-between py-3 px-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className={`badge ${typeDetails.bg} p-2 rounded-circle d-inline-flex align-items-center justify-content-center`} style={{ width: "32px", height: "32px" }}>
                      <IconComponent size={16} />
                    </span>
                    <div>
                      <div className="font-weight-medium text-dark-emphasis">{item.name}</div>
                      <span className="text-secondary small text-capitalize" style={{ fontSize: "0.75rem" }}>
                        {typeDetails.label}
                        {formatTime(item.date) && ` • ${formatTime(item.date)}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-ghost-danger border-0"
                    aria-label="Remove Itinerary Item"
                    onClick={() => {
                      if (confirm(`Remove "${item.name}" from your itinerary?`)) {
                        onRemoveItem(item.id);
                      }
                    }}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
