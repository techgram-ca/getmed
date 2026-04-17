"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Prediction = google.maps.places.AutocompletePrediction;

export interface AddressValue {
  fullAddress: string;
  unit: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
}

interface Props {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
}

export default function PharmacyAddressField({ value, onChange }: Props) {
  const [query, setQuery] = useState(value.fullAddress);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const hiddenMapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function init() {
      serviceRef.current = new google.maps.places.AutocompleteService();
      tokenRef.current = new google.maps.places.AutocompleteSessionToken();
      if (hiddenMapRef.current) {
        placesRef.current = new google.maps.places.PlacesService(hiddenMapRef.current);
      }
    }
    if (typeof google !== "undefined" && google.maps?.places) {
      init();
    } else {
      window.addEventListener("google-maps-ready", init, { once: true });
      return () => window.removeEventListener("google-maps-ready", init);
    }
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!serviceRef.current || input.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    serviceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "ca" },
        sessionToken: tokenRef.current ?? undefined,
        types: ["address"],
      },
      (results, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setOpen(true);
          setActiveIndex(-1);
        } else {
          setPredictions([]);
          setOpen(false);
        }
      }
    );
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onChange({
      ...value,
      fullAddress: e.target.value,
      city: "",
      province: "",
      postalCode: "",
      lat: 0,
      lng: 0,
    });
    fetchPredictions(e.target.value);
  }

  function handleSelect(prediction: Prediction) {
    setQuery(prediction.description);
    setPredictions([]);
    setOpen(false);
    setActiveIndex(-1);
    tokenRef.current = new google.maps.places.AutocompleteSessionToken();

    if (!placesRef.current) return;

    placesRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;

        const get = (type: string, nameType: "long_name" | "short_name" = "long_name") =>
          place.address_components?.find((c) => c.types.includes(type))?.[nameType] ?? "";

        const fullAddress = place.formatted_address ?? prediction.description;
        setQuery(fullAddress);
        onChange({
          ...value,
          fullAddress,
          city: get("locality") || get("sublocality_level_1"),
          province: get("administrative_area_level_1", "short_name"),
          postalCode: get("postal_code"),
          lat: place.geometry?.location?.lat() ?? 0,
          lng: place.geometry?.location?.lng() ?? 0,
        });
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && predictions[activeIndex]) handleSelect(predictions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Hidden element required by PlacesService constructor */}
      <div ref={hiddenMapRef} className="hidden" aria-hidden="true" />

      {/* Full address autocomplete */}
      <div>
        <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
          Full Address <span className="text-red-500">*</span>
        </label>
        <div ref={containerRef} className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280] pointer-events-none z-10" />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280] animate-spin z-10" />
          )}
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your pharmacy address..."
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            className="pl-11"
            required
          />
          {open && predictions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl border border-[#e2efed] shadow-[0_8px_32px_rgba(42,157,143,0.12)] overflow-hidden"
            >
              {predictions.map((p, i) => (
                <li
                  key={p.place_id}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#e2efed] last:border-b-0",
                    i === activeIndex ? "bg-[#f0fbf9]" : "hover:bg-[#f0fbf9]"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(p);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <MapPin className="w-4 h-4 text-[#2a9d8f] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#0d1f1c]">
                      {p.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-[#6b8280]">
                      {p.structured_formatting.secondary_text}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Unit / suite */}
      <div>
        <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
          Unit / Suite Number
        </label>
        <Input
          type="text"
          value={value.unit}
          onChange={(e) => onChange({ ...value, unit: e.target.value })}
          placeholder="e.g. Unit 4, Suite 200 (optional)"
        />
      </div>

      {/* City / Province / Postal */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
            Province <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={value.province}
            onChange={(e) => onChange({ ...value, province: e.target.value })}
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
            placeholder="Auto-filled"
          />
        </div>
      </div>

      {/* Hidden lat/lng — submitted with the form */}
      <input type="hidden" name="lat" value={value.lat} />
      <input type="hidden" name="lng" value={value.lng} />
    </div>
  );
}
