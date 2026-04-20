"use client";

import { useEffect, useRef } from "react";

export interface MapPharmacy {
  id: string;
  display_name: string;
  lat: number;
  lng: number;
}

interface Props {
  searchLat: number;
  searchLng: number;
  pharmacies: MapPharmacy[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function pinSvg(num: number, active: boolean) {
  const fill = active ? "#e76f51" : "#2a9d8f";
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
      <path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 23 15 23S30 26.25 30 15C30 6.72 23.28 0 15 0z" fill="${fill}"/>
      <circle cx="15" cy="15" r="7.5" fill="white"/>
      <text x="15" y="19.5" text-anchor="middle" fill="${fill}" font-size="9" font-weight="bold" font-family="sans-serif">${num}</text>
    </svg>`
  )}`;
}

const searchPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="11" fill="#2a9d8f" opacity="0.25"/>
    <circle cx="11" cy="11" r="6" fill="#2a9d8f"/>
    <circle cx="11" cy="11" r="2.5" fill="white"/>
  </svg>`
)}`;

export default function PharmacyMap({ searchLat, searchLng, pharmacies, activeId, onSelect }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers     = useRef<Map<string, { marker: google.maps.Marker; index: number }>>(new Map());

  useEffect(() => {
    function init() {
      if (!mapRef.current) return;

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: searchLat, lng: searchLng },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry",           stylers: [{ color: "#f5f9f8" }] },
          { elementType: "labels.text.fill",   stylers: [{ color: "#6b8280" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
          { featureType: "water",              stylers: [{ color: "#c9e8e4" }] },
          { featureType: "road",               elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road.highway",       elementType: "geometry", stylers: [{ color: "#e2efed" }] },
          { featureType: "poi",                stylers: [{ visibility: "off" }] },
          { featureType: "transit",            stylers: [{ visibility: "off" }] },
        ],
      });

      // Search-location pulsing marker
      new google.maps.Marker({
        position: { lat: searchLat, lng: searchLng },
        map: mapInstance.current,
        icon: { url: searchPinSvg, scaledSize: new google.maps.Size(22, 22), anchor: new google.maps.Point(11, 11) },
        zIndex: 1000,
        title: "Your location",
      });

      // Pharmacy markers
      pharmacies.forEach((ph, i) => {
        const num    = i + 1;
        const marker = new google.maps.Marker({
          position: { lat: ph.lat, lng: ph.lng },
          map: mapInstance.current!,
          icon: { url: pinSvg(num, false), scaledSize: new google.maps.Size(30, 38), anchor: new google.maps.Point(15, 38) },
          title: ph.display_name,
          zIndex: 10,
        });
        marker.addListener("click", () => onSelect(ph.id));
        markers.current.set(ph.id, { marker, index: num });
      });
    }

    if (typeof google !== "undefined" && google.maps?.Map) {
      init();
    } else {
      window.addEventListener("google-maps-ready", init, { once: true });
      return () => window.removeEventListener("google-maps-ready", init);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker icons when activeId changes
  useEffect(() => {
    markers.current.forEach(({ marker, index }, id) => {
      const active = id === activeId;
      marker.setIcon({
        url: pinSvg(index, active),
        scaledSize: new google.maps.Size(active ? 36 : 30, active ? 46 : 38),
        anchor: new google.maps.Point(active ? 18 : 15, active ? 46 : 38),
      });
      marker.setZIndex(active ? 100 : 10);
    });

    if (activeId && mapInstance.current) {
      const entry = markers.current.get(activeId);
      if (entry) {
        const pos = entry.marker.getPosition();
        if (pos) mapInstance.current.panTo(pos);
      }
    }
  }, [activeId]);

  return <div ref={mapRef} className="w-full h-full" />;
}
