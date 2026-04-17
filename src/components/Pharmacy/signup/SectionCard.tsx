import { type LucideIcon } from "lucide-react";

interface Props {
  step: number;
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export default function SectionCard({ step, title, description, icon: Icon, children }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e2efed] bg-[#f8fffe] flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#2a9d8f]" />
        </div>
        <div>
          <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-[#2a9d8f]">
            Step {step}
          </span>
          <h2 className="text-base font-bold text-[#0d1f1c] leading-tight">{title}</h2>
          {description && <p className="text-xs text-[#6b8280] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}
