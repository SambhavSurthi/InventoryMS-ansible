import React from "react";
import { cn } from "../../lib/utils";

const ChartContainer = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    {children}
  </div>
));
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md", className)} {...props} />
));
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef(({ className, indicator, ...props }, ref) => (
  <div ref={ref} className={cn("grid min-w-[8rem] gap-1.5", className)} {...props}>
    {indicator && (
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", indicator === "dot" ? "bg-primary" : "bg-current")} />
        <span className="text-xs text-muted-foreground">Indicator</span>
      </div>
    )}
  </div>
));
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
