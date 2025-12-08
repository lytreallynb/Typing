import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(({ className, label, ...props }, ref) => (
  <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
    {label && <span>{label}</span>}
    <input
      type="range"
      ref={ref}
      className={cn(
        "w-full accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full",
        className
      )}
      {...props}
    />
  </label>
));
Slider.displayName = "Slider";
