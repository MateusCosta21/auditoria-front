import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        destructive: "bg-destructive-light text-destructive",
        primary: "bg-accent text-primary",
        outline: "border border-border text-foreground",
        conform: "bg-success-light text-success",
        "non-conform": "bg-destructive-light text-destructive",
        na: "bg-secondary text-muted-foreground",
        "weight-low": "bg-success-light text-success",
        "weight-medium": "bg-warning-light text-warning",
        "weight-high": "bg-destructive-light text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function StatusBadge({
  className,
  variant,
  dot,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "destructive" && "bg-destructive",
            variant === "primary" && "bg-primary",
            variant === "conform" && "bg-success",
            variant === "non-conform" && "bg-destructive",
            (!variant || variant === "default" || variant === "outline") &&
              "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}
