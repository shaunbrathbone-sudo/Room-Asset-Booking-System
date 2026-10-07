import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
        primary:
          "border-transparent bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
        secondary:
          "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
        destructive:
          "border-transparent bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30",
        outline:
          "border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200",
        amber:
          "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
        emerald:
          "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
