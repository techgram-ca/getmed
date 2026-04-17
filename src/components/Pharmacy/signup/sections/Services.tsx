import { ShoppingBag, Truck, Video } from "lucide-react";
import SectionCard from "../SectionCard";
import { Layers } from "lucide-react";

export interface ServicesValue {
  onlineOrders: boolean;
  delivery: boolean;
  consultation: boolean;
}

interface Props {
  value: ServicesValue;
  onChange: (v: ServicesValue) => void;
}

export default function Services({ value, onChange }: Props) {
  function toggle(key: keyof ServicesValue) {
    onChange({ ...value, [key]: !value[key] });
  }

  const services = [
    {
      key: "onlineOrders" as const,
      icon: ShoppingBag,
      title: "Online Orders",
      desc: "Accept prescription orders submitted online through the GetMed platform.",
    },
    {
      key: "delivery" as const,
      icon: Truck,
      title: "Delivery",
      desc: "Offer home delivery of medications directly to your customers' doors.",
    },
    {
      key: "consultation" as const,
      icon: Video,
      title: "Online Pharmacy Consultation",
      desc: "Provide virtual consultations with a licensed pharmacist via chat, phone, or video.",
    },
  ];

  return (
    <SectionCard
      step={3}
      title="Services Offered"
      description="Select all the services your pharmacy will provide through GetMed."
      icon={Layers}
    >
      <div className="space-y-3">
        {services.map(({ key, icon: Icon, title, desc }) => {
          const checked = value[key];
          return (
            <label
              key={key}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                checked
                  ? "border-[#2a9d8f] bg-[#f0fbf9]"
                  : "border-[#e2efed] bg-white hover:border-[#2a9d8f]/40 hover:bg-[#f8fffe]"
              }`}
            >
              {/* Custom checkbox */}
              <div className="mt-0.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    checked
                      ? "bg-[#2a9d8f] border-[#2a9d8f]"
                      : "border-[#d1e8e5]"
                  }`}
                  onClick={() => toggle(key)}
                >
                  {checked && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="sr-only"
                />
              </div>

              {/* Icon + text */}
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    checked ? "bg-[#2a9d8f]" : "bg-[#e0f5f2]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      checked ? "text-white" : "text-[#2a9d8f]"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0d1f1c]">{title}</p>
                  <p className="text-xs text-[#6b8280] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </SectionCard>
  );
}
