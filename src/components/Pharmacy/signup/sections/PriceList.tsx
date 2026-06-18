"use client";

import { Plus, Tag, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import SectionCard from "../SectionCard";

export interface PriceItem {
  name: string;
  price: string;
  description: string;
}

export interface PriceListValue {
  items: PriceItem[];
}

export const DEFAULT_PRICE_LIST: PriceListValue = {
  items: [{ name: "", price: "", description: "" }],
};

const EMPTY_ITEM: PriceItem = { name: "", price: "", description: "" };

interface Props {
  value: PriceListValue;
  onChange: (v: PriceListValue) => void;
  step: number;
}

export default function PriceList({ value, onChange, step }: Props) {
  function setItem(index: number, field: keyof PriceItem, v: string) {
    const items = value.items.map((it, i) =>
      i === index ? { ...it, [field]: v } : it
    );
    onChange({ items });
  }

  function addItem() {
    onChange({ items: [...value.items, { ...EMPTY_ITEM }] });
  }

  function removeItem(index: number) {
    const items = value.items.filter((_, i) => i !== index);
    onChange({ items: items.length ? items : [{ ...EMPTY_ITEM }] });
  }

  return (
    <SectionCard
      step={step}
      title="Service Price List"
      description="List the services you offer and their prices. These appear on your public landing page. Add as many as you like — leave blank to skip."
      icon={Tag}
    >
      <div className="space-y-4">
        {value.items.map((item, i) => (
          <div
            key={i}
            className="bg-[#f8fffe] rounded-xl border border-[#e2efed] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#6b8280]">
                Service {i + 1}
              </p>
              {value.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0d1f1c] mb-1.5">
                  Service name
                </label>
                <Input
                  value={item.name}
                  onChange={(e) => setItem(i, "name", e.target.value)}
                  placeholder="e.g. Flu Vaccination"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0d1f1c] mb-1.5">
                  Price
                </label>
                <Input
                  value={item.price}
                  onChange={(e) => setItem(i, "price", e.target.value)}
                  placeholder="e.g. 25 or Free"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0d1f1c] mb-1.5">
                Description <span className="font-normal text-[#6b8280]">(optional)</span>
              </label>
              <Input
                value={item.description}
                onChange={(e) => setItem(i, "description", e.target.value)}
                placeholder="Short detail patients should know"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-sm font-semibold text-[#2a9d8f] hover:text-[#21867a] transition-colors bg-transparent border-none p-0 cursor-pointer"
        >
          <span className="w-7 h-7 rounded-lg bg-[#e0f5f2] flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
          Add another service
        </button>
      </div>
    </SectionCard>
  );
}
