import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Beacon design-system table primitives (solid surfaces, data-dense).
 * Shared by every table so sorting, focus and light/dark behaviour stay consistent.
 */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full text-left border-collapse text-sm", className)}
    {...props}
  />
));
Table.displayName = "Table";

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Max height enables a scroll region with a sticky header. */
    maxHeightClassName?: string;
}

const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, maxHeightClassName, ...props }, ref) => (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden",
        className
      )}
    >
      <div
        ref={ref}
        className={cn(
          "overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500",
          maxHeightClassName && `overflow-y-auto ${maxHeightClassName}`
        )}
        tabIndex={0}
        role={props["aria-label"] ? "region" : undefined}
        {...props}
      />
    </div>
  )
);
TableContainer.displayName = "TableContainer";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-slate-900 dark:bg-slate-800 border-b border-slate-900 dark:border-slate-700",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    /** Set false when rows are striped explicitly (e.g. tables with detail rows). */
    zebra?: boolean;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, zebra = true, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        "divide-y divide-slate-200 dark:divide-slate-700",
        // Zebra banding so the eye can follow a row across the page.
        zebra && "[&>tr:nth-child(even)]:bg-slate-200/70 dark:[&>tr:nth-child(even)]:bg-slate-800/70",
        // Hover highlight. The even+hover form is more specific so it beats the stripe.
        zebra && "[&>tr:hover]:bg-amber-100 dark:[&>tr:hover]:bg-amber-500/15",
        zebra && "[&>tr:nth-child(even):hover]:bg-amber-100 dark:[&>tr:nth-child(even):hover]:bg-amber-500/15",
        className
      )}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("transition-colors", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      "px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-100 whitespace-nowrap",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-2.5 align-middle text-slate-800 dark:text-slate-200 tabular-nums",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export type SortDirection = "asc" | "desc";

interface SortableTableHeadProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "onClick"> {
    /** Visible column label (already translated). */
    label: string;
    /** Active sort direction for this column, or null when not sorted by it. */
    direction: SortDirection | null;
    onSort: () => void;
    align?: "left" | "right" | "center";
}

/**
 * A sortable column header. Uses a real button for keyboard access and
 * exposes aria-sort so assistive tech announces the sort state (WCAG 2.2).
 */
const SortableTableHead = ({
  label,
  direction,
  onSort,
  align = "left",
  className,
  ...props
}: SortableTableHeadProps) => {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;
  const ariaSort =
    direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
  return (
    <TableHead aria-sort={ariaSort} className={className} {...props}>
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "inline-flex items-center gap-1.5 rounded px-1 -mx-1 uppercase tracking-wider font-bold",
          "hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
          align === "right" && "flex-row-reverse w-full justify-start",
          align === "center" && "justify-center w-full"
        )}
      >
        <span>{label}</span>
        <Icon
          aria-hidden="true"
          strokeWidth={2.75}
          className={cn("h-4 w-4", direction ? "text-amber-400" : "text-slate-100")}
        />
      </button>
    </TableHead>
  );
};

export {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
};
