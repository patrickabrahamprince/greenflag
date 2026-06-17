"use client";
import { useState } from "react";
import { MapPin, Loader2, CheckCircle } from "lucide-react";

interface Props {
  onLocated: (text: string) => void;
}

export default function LocationPicker({ onLocated }: Props) {
  const [state, setState] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");

  async function getLocation() {
    setError("");
    setState("locating");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setLocation(coords);
      setState("done");
      const text = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}`;
      onLocated(text);
    } catch (e) {
      setState("error");
      setError(
        e instanceof GeolocationPositionError
          ? e.code === 1
            ? "Location access denied. Enable in browser settings."
            : "Could not determine location. Try again."
          : "Location unavailable"
      );
    }
  }

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <button onClick={getLocation}
          className="w-full h-14 rounded-[16px] bg-accent/10 border border-accent/30 text-accent font-medium flex items-center justify-center gap-2 transition-all">
          <MapPin className="w-5 h-5" strokeWidth={1.5} />
          Share My Location
        </button>
      )}

      {state === "locating" && (
        <div className="rounded-[16px] bg-accent/5 border border-accent/20 p-4 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-accent animate-spin" strokeWidth={1.5} />
          <span className="text-sm text-text-muted">Getting your location...</span>
        </div>
      )}

      {state === "done" && location && (
        <div className="rounded-[16px] bg-accent/10 border border-accent/30 p-4 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5 text-accent" strokeWidth={1.5} />
          <span className="text-sm text-accent font-medium">
            Location shared — {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <p className="text-xs text-danger text-center">{error}</p>
          <button onClick={getLocation}
            className="w-full h-12 rounded-[12px] bg-surface border border-border text-text-muted font-medium text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
