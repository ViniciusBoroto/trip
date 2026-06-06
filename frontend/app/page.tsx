"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconPlane, IconLogout, IconGlobe } from "@tabler/icons-react";

import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { TripCard } from "@/components/trip-card";
import { TripForm } from "@/components/trip-form";
import { listTrips, createTrip, deleteTrip } from "@/services/trips";
import type { Trip, CreateTripRequest } from "@/types/trip";

export default function Home() {
  const router = useRouter();
  const { status, user, logout } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [errorTrips, setErrorTrips] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);

  // Authentication redirect
  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }
    startTransition(() => {
      router.replace("/login");
    });
  }, [router, status]);

  // Fetch trips when authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    async function load() {
      setLoadingTrips(true);
      setErrorTrips(null);
      try {
        const res = await listTrips();
        if (res?.ok) {
          setTrips(res.trips);
        } else {
          setErrorTrips(res?.message || "Failed to load trips.");
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorTrips(err.message);
        } else {
          setErrorTrips("Unexpected error loading trips.");
        }
      } finally {
        setLoadingTrips(false);
      }
    }

    void load();
  }, [status]);

  async function handleCreateTrip(data: CreateTripRequest) {
    const res = await createTrip(data);
    if (res?.ok && res.trip) {
      // Add to list and sort by startDate
      setTrips((prev) =>
        [...prev, res.trip].sort((a, b) => a.startDate.localeCompare(b.startDate))
      );
    } else {
      throw new Error(res?.message || "Failed to create trip.");
    }
  }

  async function handleDeleteTrip(id: string) {
    try {
      const res = await deleteTrip(id);
      if (res?.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(res?.message || "Failed to delete trip.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting trip.";
      alert(msg);
    }
  }

  async function handleLogout() {
    await logout();
    startTransition(() => {
      router.replace("/login");
    });
  }

  if (status === "loading") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary mb-2" role="status" />
        <span className="text-secondary small">Checking session...</span>
      </div>
    );
  }

  if (status === "anonymous") {
    return null;
  }

  return (
    <div className="page">
      {/* Premium Navigation Header */}
      <header className="navbar navbar-expand-md navbar-light d-print-none shadow-sm bg-white py-2">
        <div className="container-xl">
          <div className="d-flex align-items-center gap-2">
            <span className="bg-primary text-white p-2 rounded-3 d-inline-flex">
              <IconPlane size={20} stroke={2} />
            </span>
            <div>
              <h1 className="h3 mb-0 font-weight-bold" style={{ letterSpacing: "-0.02em" }}>
                TripIt
              </h1>
              <span className="text-secondary small d-none d-sm-inline">
                Your personal travel planner
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary small d-none d-md-inline">
              Hi, <strong>{user?.name}</strong>
            </span>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleLogout}
            >
              <IconLogout size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="page-wrapper py-4">
        <div className="container-xl">
          <div className="row g-3 align-items-center justify-content-between mb-4">
            <div className="col-auto">
              <h2 className="page-title h2 mb-1">My Trips</h2>
              <p className="text-secondary mb-0 small">
                Manage your active and upcoming travel itineraries
              </p>
            </div>
            <div className="col-auto">
              {!showAddForm && (
                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                  onClick={() => setShowAddForm(true)}
                >
                  <IconPlus size={16} />
                  <span>New Trip</span>
                </button>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="row justify-content-center mb-4">
              <div className="col-12 col-md-8 col-lg-6">
                <TripForm onSubmit={handleCreateTrip} onClose={() => setShowAddForm(false)} />
              </div>
            </div>
          )}

          {errorTrips && (
            <div className="alert alert-danger mb-4" role="alert">
              {errorTrips}
            </div>
          )}

          {loadingTrips ? (
            <div className="d-flex flex-column align-items-center py-5">
              <div className="spinner-border text-primary mb-2" role="status" />
              <span className="text-secondary small">Loading trips...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-5 my-4 border rounded-3 bg-white shadow-sm">
              <IconGlobe size={48} stroke={1.5} className="text-muted mb-3" />
              <h3 className="h3 mb-2">No trips planned yet</h3>
              <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "400px" }}>
                Add your first adventure to start scheduling flights, booking hotels, and planning your daily activities!
              </p>
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-1"
                onClick={() => setShowAddForm(true)}
              >
                <IconPlus size={16} />
                <span>Plan Your First Trip</span>
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
              {trips.map((trip) => (
                <div key={trip.id} className="col">
                  <TripCard trip={trip} onDelete={handleDeleteTrip} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
