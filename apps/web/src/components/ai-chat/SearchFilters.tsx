"use client";

import React from "react";
import { MapPin, Target, Layers } from "lucide-react";

interface SearchFiltersProps {
  values: {
    radius: number;
    type: string;
    location: string;
  };
  onChange: (values: any) => void;
}

export default function SearchFilters({ values, onChange }: SearchFiltersProps) {
  const radiusOptions = [50, 100, 150, 200, 250, 300];
  const eventTypes = [
    { value: "all", label: "ALL" },
    { value: "festival", label: "Festival" },
    { value: "market_place", label: "Market Place" },
    { value: "rodeo", label: "Rodeo" },
    { value: "agricultural_show", label: "Agricultural show" },
    { value: "annual_show", label: "Anual show" },
    { value: "street_festival", label: "Street festival" },
  ];

  return (
    <div className="space-y-6">
      {/* Fixed Location Display */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
          <MapPin size={12} className="text-primary" />
          Location
        </label>
        <div className="px-4 py-3 bg-surface-container rounded-2xl border border-outline-variant/10 text-sm font-bold text-on-surface shadow-inner flex items-center justify-between">
          <span>{values.location}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Fixed</span>
        </div>
      </div>

      {/* Radius Buttons */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
          <Target size={12} className="text-primary" />
          Radius (km)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {radiusOptions.map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...values, radius: r })}
              className={`py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all duration-200 active:scale-95 ${
                values.radius === r
                ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                : "bg-surface-container-highest border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-surface shadow-sm"
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Event Type Select */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
          <Layers size={12} className="text-primary" />
          Event Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => onChange({ ...values, type: type.value })}
              className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all duration-200 border active:scale-95 ${
                values.type === type.value
                ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                : "bg-surface-container-highest border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-surface shadow-sm"
              } ${type.value === 'all' ? 'col-span-2' : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
