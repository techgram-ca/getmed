import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-2xl border border-[#e2efed] bg-white px-4 py-3.5 text-sm text-[#0d1f1c] placeholder:text-[#6b8280] outline-none transition-all duration-200 focus:border-[#2a9d8f] focus:ring-4 focus:ring-[#2a9d8f]/12 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
