import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[100px] w-full rounded-2xl border border-[#e2efed] bg-white px-4 py-3 text-sm text-[#0d1f1c] placeholder:text-[#6b8280] outline-none transition-all duration-200 focus:border-[#2a9d8f] focus:ring-4 focus:ring-[#2a9d8f]/10 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
