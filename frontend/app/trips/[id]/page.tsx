"use client";

import { useEffect, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconBookmark,
  IconInfoCircle,
  IconFileText,
  IconTrash,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { ItineraryList } from "@/components/itinerary-list";
import { ItineraryItemForm } from "@/components/itinerary-item-form";
import { getTrip, deleteTrip, addItineraryItem, removeItineraryItem } from "@/services/trips";
import type { Trip, CreateItineraryItemRequest } from "@/types/trip";

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { status } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Authentication check
  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }
    startTransition(() => {
      router.replace("/login");
    });
  }, [router, status]);

  // Load trip details
  useEffect(() => {
    if (status !== "authenticated" || !tripId) {
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getTrip(tripId);
        if (res?.ok && res.trip) {
          setTrip(res.trip);
        } else {
          setError(res?.message || "Failed to load trip details.");
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError("Unexpected error loading trip.");
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [status, tripId]);

  async function handleAddItineraryItem(data: CreateItineraryItemRequest) {
    if (!trip) return;
    const res = await addItineraryItem(trip.id, data);
    if (res?.ok && res.item) {
      // Append the new itinerary item and sort the list locally
      setTrip((prev) => {
        if (!prev) return null;
        const nextItinerary = [...prev.itinerary, res.item].sort(
          (a, b) => a.date.localeCompare(b.date)
        );
        return {
          ...prev,
          itinerary: nextItinerary,
        };
      });
    } else {
      throw new Error(res?.message || "Failed to add itinerary item.");
    }
  }

  async function handleRemoveItineraryItem(itemId: string) {
    if (!trip) return;
    try {
      const res = await removeItineraryItem(trip.id, itemId);
      if (res?.ok) {
        setTrip((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            itinerary: prev.itinerary.filter((item) => item.id !== itemId),
          };
        });
      } else {
        setError(res?.message || "Failed to remove itinerary item.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error removing item.";
      setError(msg);
    }
  }

  async function handleDeleteTrip() {
    if (!trip) return;
    setConfirmingDelete(true);
  }

  async function confirmDeleteTrip() {
    if (!trip) return;
    try {
      const res = await deleteTrip(trip.id);
      if (res?.ok) {
        startTransition(() => {
          router.replace("/");
        });
      } else {
        setError(res?.message || "Failed to delete trip.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting trip.";
      setError(msg);
    } finally {
      setConfirmingDelete(false);
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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

  if (status === "loading" || loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary mb-2" role="status" />
        <span className="text-secondary small">Loading trip details...</span>
      </div>
    );
  }

  if (status === "anonymous") {
    return null;
  }

  if (error || !trip) {
    return (
      <div className="container py-6 text-center">
        <div className="alert alert-danger mb-4" role="alert">
          {error || "Trip not found."}
        </div>
        <Link href="/" className="btn btn-primary">
          <IconArrowLeft size={16} className="me-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const hasPhoto = trip.photo && trip.photo.trim().length > 0;

  return (
    <div className="page">
      {/* Banner / Cover */}
      <div
        className="position-relative w-100 d-flex flex-column justify-content-end"
        style={{
          height: "240px",
          backgroundImage: hasPhoto
            ? `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%), url(${trip.photo})`
            : "linear-gradient(135deg, oklch(0.65 0.15 250) 0%, oklch(0.55 0.2 270) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <div className="position-absolute top-0 start-0 p-3">
          <Link href="/" className="btn btn-sm btn-white shadow-sm d-inline-flex align-items-center" aria-label="Back to dashboard">
            <IconArrowLeft size={14} />
          </Link>
        </div>

        <div className="container-xl pb-3 px-3">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            {getCategoryBadge(trip.category)}
            {trip.bookingReference && (
              <span className="badge bg-white-lt text-white d-inline-flex align-items-center gap-1">
                <IconBookmark size={12} />
                <span>Ref: {trip.bookingReference}</span>
              </span>
            )}
          </div>
          <h1 className="h1 text-white mb-1 font-weight-bold">{trip.name}</h1>
          <p className="mb-0 text-white-75 small d-flex align-items-center gap-1">
            <IconCalendar size={14} />
            <span>
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </p>
        </div>
      </div>

      {/* Main body info */}
      <main className="page-body py-4">
        <div className="container-xl">
          <div className="row g-3">
            {/* Sidebar Details / Info */}
            <div className="col-12 col-md-4 order-md-2">
              <div className="card shadow-sm border-0 mb-3">
                <div className="card-body p-3">
                  <h3 className="card-title h4 mb-3 d-flex align-items-center gap-2">
                    <IconFileText size={18} className="text-secondary" />
                    <span>Trip Description</span>
                  </h3>
                  <p className="text-secondary small mb-0">
                    {trip.description || "No description provided."}
                  </p>
                </div>
              </div>

              {trip.importantNotes && (
                <div className="card shadow-sm border-0 border-start border-warning border-3 mb-3">
                  <div className="card-body p-3">
                    <h3 className="card-title h4 mb-2 text-warning d-flex align-items-center gap-2">
                      <IconInfoCircle size={18} />
                      <span>Important Notes</span>
                    </h3>
                    <p className="text-secondary small mb-0 whitespace-pre-wrap">
                      {trip.importantNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary Timeline */}
            <div className="col-12 col-md-8 order-md-1">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h3 mb-0">Itinerary Timeline</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                  onClick={() => setShowModal(true)}
                >
                  <IconPlus size={14} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="mb-4">
                <ItineraryList items={trip.itinerary} onRemoveItem={handleRemoveItineraryItem} />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="row mt-4">
            <div className="col-12">
              <hr className="mb-4" />
              <div className="card shadow-sm border-0 bg-danger-lt">
                <div className="card-body p-3">
                  <h3 className="card-title h4 mb-2 text-danger">Danger Zone</h3>
                  {confirmingDelete ? (
                    <>
                      <p className="text-danger-emphasis small mb-3">
                        Are you sure? This action cannot be undone.
                      </p>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setConfirmingDelete(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                          onClick={confirmDeleteTrip}
                        >
                          <IconTrash size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-danger-emphasis small mb-3">
                        Once deleted, a trip and its itinerary scheduled items cannot be restored.
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                        onClick={handleDeleteTrip}
                      >
                        <IconTrash size={14} />
                        <span>Delete Trip</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Itinerary Item Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg p-4 w-100 mx-3"
            style={{ maxWidth: "540px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0 text-[oklch(0.22_0.02_252)]">Add Itinerary Item</h5>
              <button
                type="button"
                className="btn btn-sm border-0 text-[oklch(0.48_0.02_245)]"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <IconX size={20} stroke={1.8} />
              </button>
            </div>
            <ItineraryItemForm
              compact
              minDate={trip.startDate}
              maxDate={trip.endDate}
              onSubmit={async (data) => {
                await handleAddItineraryItem(data);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
