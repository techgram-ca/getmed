import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2a9d8f] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#2a9d8f] text-white hover:bg-[#21867a] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(42,157,143,0.3)]",
        white:
          "bg-white text-[#2a9d8f] font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]",
        ghost: "bg-transparent hover:bg-[#e0f5f2] text-[#2a9d8f]",
      },
      size: {
        default: "px-6 py-2.5",
        lg: "px-9 py-3.5 text-base",
        search: "px-7 py-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
