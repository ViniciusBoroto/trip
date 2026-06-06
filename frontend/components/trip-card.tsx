"use client";

import Link from "next/link";
import {
  IconCalendar,
  IconBookmark,
  IconTrash,
  IconMapPin,
} from "@tabler/icons-react";
import type { Trip } from "@/types/trip";

type TripCardProps = {
  trip: Trip;
  onDelete: (id: string) => void;
};

export function TripCard({ trip, onDelete }: TripCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get nice category color/theme
  const getCategoryBadge = (category: string | null) => {
    if (!category) return null;
    const cat = category.toLowerCase();
    let bg = "bg-secondary-lt";
    if (cat === "beach") bg = "bg-azure-lt";
    else if (cat === "city") bg = "bg-purple-lt";
    else if (cat === "adventure") bg = "bg-green-lt";
    else if (cat === "cultural") bg = "bg-orange-lt";
    else if (cat === "business") bg = "bg-blue-lt";
    else if (cat === "road-trip") bg = "bg-yellow-lt";

    return <span className={`badge ${bg} text-capitalize`}>{category}</span>;
  };

  const hasPhoto = trip.photo && trip.photo.trim().length > 0;

  return (
    <div className="card card-link card-stacked shadow-sm h-100 d-flex flex-column transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Cover Photo */}
      <div
        className="card-img-top img-responsive"
        style={{
          height: "140px",
          backgroundImage: hasPhoto
            ? `url(${trip.photo})`
            : "linear-gradient(135deg, oklch(0.65 0.15 250) 0%, oklch(0.55 0.2 270) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            gap: "5px",
          }}
        >
          {getCategoryBadge(trip.category)}
        </div>
      </div>

      <div className="card-body d-flex flex-column flex-grow-1 p-3">
        <h3 className="card-title h3 mb-2 text-truncate">
          <Link href={`/trips/${trip.id}`} className="text-reset text-decoration-none stretched-link">
            {trip.name}
          </Link>
        </h3>

        <div className="text-muted small mb-2 d-flex align-items-center gap-1">
          <IconCalendar size={14} className="text-secondary" />
          <span>
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
        </div>

        {trip.bookingReference && (
          <div className="text-muted small mb-2 d-flex align-items-center gap-1">
            <IconBookmark size={14} className="text-primary" />
            <span>Ref: {trip.bookingReference}</span>
          </div>
        )}

        {trip.description && (
          <p className="text-secondary small mb-3 flex-grow-1 text-truncate-3-lines">
            {trip.description}
          </p>
        )}

        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <div className="d-inline-flex align-items-center gap-1 text-primary small font-weight-medium">
            <IconMapPin size={14} />
            <span>Itinerary ({trip.itinerary?.length || 0})</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-icon btn-ghost-danger"
            style={{ position: "relative", zIndex: 2 }}
            aria-label="Delete Trip"
            onClick={() => {
              if (confirm("Are you sure you want to delete this trip and all its itinerary?")) {
                onDelete(trip.id);
              }
            }}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
