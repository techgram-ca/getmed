"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Prediction = google.maps.places.AutocompletePrediction;

interface Props {
  onAddressChange?: (address: string) => void;
  onEnter?: () => void;
  inputId?: string;
  className?: string;
}

export default function AddressAutocomplete({
  onAddressChange,
  onEnter,
  inputId,
  className,
}: Props) {
  const [value, setValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function init() {
      serviceRef.current = new google.maps.places.AutocompleteService();
      tokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }

    if (typeof google !== "undefined" && google.maps?.places) {
      init();
    } else {
      window.addEventListener("google-maps-ready", init, { once: true });
      return () => window.removeEventListener("google-maps-ready", init);
    }
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    onAddressChange?.(val);
    fetchPredictions(val);
  }

  function handleSelect(prediction: Prediction) {
    setValue(prediction.description);
    onAddressChange?.(prediction.description);
    setPredictions([]);
    setOpen(false);
    setActiveIndex(-1);
    // Refresh session token after a billable selection
    tokenRef.current = new google.maps.places.AutocompleteSessionToken();
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
      if (activeIndex >= 0 && predictions[activeIndex]) {
        handleSelect(predictions[activeIndex]);
      } else {
        setOpen(false);
        onEnter?.();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative flex-1 min-w-[220px]", className)}>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280] pointer-events-none z-10" />
      {loading && (
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280] animate-spin z-10" />
      )}
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter your delivery address..."
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        className="pl-11"
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
  );
}
