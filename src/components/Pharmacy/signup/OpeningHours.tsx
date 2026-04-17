"use client";

import { cn } from "@/lib/utils";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Day = (typeof DAYS)[number];

export interface DayHours {
  open: boolean;
  openTime: string;
  closeTime: string;
}

export type OpeningHoursValue = Record<Day, DayHours>;

export const DEFAULT_HOURS: OpeningHoursValue = {
  Monday:    { open: true,  openTime: "09:00", closeTime: "18:00" },
  Tuesday:   { open: true,  openTime: "09:00", closeTime: "18:00" },
  Wednesday: { open: true,  openTime: "09:00", closeTime: "18:00" },
  Thursday:  { open: true,  openTime: "09:00", closeTime: "18:00" },
  Friday:    { open: true,  openTime: "09:00", closeTime: "18:00" },
  Saturday:  { open: false, openTime: "09:00", closeTime: "17:00" },
  Sunday:    { open: false, openTime: "09:00", closeTime: "17:00" },
};

interface Props {
  value: OpeningHoursValue;
  onChange: (v: OpeningHoursValue) => void;
}

export default function OpeningHours({ value, onChange }: Props) {
  function toggle(day: Day) {
    onChange({ ...value, [day]: { ...value[day], open: !value[day].open } });
  }

  function setTime(day: Day, field: "openTime" | "closeTime", time: string) {
    onChange({ ...value, [day]: { ...value[day], [field]: time } });
  }

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const hours = value[day];
        return (
          <div
            key={day}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors",
              hours.open ? "border-[#e2efed] bg-white" : "border-[#e2efed] bg-[#f8fffe]"
            )}
          >
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={hours.open}
              onClick={() => toggle(day)}
              className={cn(
                "relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200",
                hours.open ? "bg-[#2a9d8f]" : "bg-[#d1e8e5]"
              )}
            >
              <span
                className={cn(
                  "absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                  hours.open ? "translate-x-[22px]" : "translate-x-[3px]"
                )}
              />
            </button>

            <span
              className={cn(
                "w-24 text-sm font-medium shrink-0",
                hours.open ? "text-[#0d1f1c]" : "text-[#6b8280]"
              )}
            >
              {day}
            </span>

            {hours.open ? (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  value={hours.openTime}
                  onChange={(e) => setTime(day, "openTime", e.target.value)}
                  className="text-sm border border-[#e2efed] rounded-lg px-3 py-1.5 text-[#0d1f1c] bg-white outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20"
                />
                <span className="text-xs text-[#6b8280]">to</span>
                <input
                  type="time"
                  value={hours.closeTime}
                  onChange={(e) => setTime(day, "closeTime", e.target.value)}
                  className="text-sm border border-[#e2efed] rounded-lg px-3 py-1.5 text-[#0d1f1c] bg-white outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20"
                />
              </div>
            ) : (
              <span className="text-xs text-[#6b8280] ml-auto italic">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
