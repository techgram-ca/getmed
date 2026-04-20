"use client";

import { useState } from "react";
import { ArrowLeftRight, FileText, ShoppingBag } from "lucide-react";
import PrescriptionForm from "./forms/PrescriptionForm";
import TransferForm from "./forms/TransferForm";
import OTCForm from "./forms/OTCForm";

const TABS = [
  { id: "prescription", label: "Prescription",    icon: FileText         },
  { id: "transfer",     label: "Transfer Rx",     icon: ArrowLeftRight   },
  { id: "otc",          label: "OTC Products",    icon: ShoppingBag      },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  pharmacyId: string;
  address: string | null;
  hasDelivery: boolean;
}

export default function OrderTabs({ pharmacyId, address, hasDelivery }: Props) {
  const [active, setActive] = useState<TabId>("prescription");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#e0f5f2] rounded-2xl mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              active === id
                ? "bg-white text-[#2a9d8f] shadow-sm"
                : "text-[#6b8280] hover:text-[#2a9d8f]"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{id === "prescription" ? "Rx" : id === "transfer" ? "Transfer" : "OTC"}</span>
          </button>
        ))}
      </div>

      {/* Active form */}
      <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-6">
        {active === "prescription" && (
          <PrescriptionForm pharmacyId={pharmacyId} defaultAddress={address} hasDelivery={hasDelivery} />
        )}
        {active === "transfer" && (
          <TransferForm pharmacyId={pharmacyId} defaultAddress={address} hasDelivery={hasDelivery} />
        )}
        {active === "otc" && (
          <OTCForm pharmacyId={pharmacyId} defaultAddress={address} hasDelivery={hasDelivery} />
        )}
      </div>
    </div>
  );
}
