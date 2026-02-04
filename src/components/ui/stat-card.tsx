import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive" | "primary";
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-secondary text-foreground",
    trend: "text-muted-foreground",
  },
  success: {
    icon: "bg-success-light text-success",
    trend: "text-success",
  },
  warning: {
    icon: "bg-warning-light text-warning",
    trend: "text-warning",
  },
  destructive: {
    icon: "bg-destructive-light text-destructive",
    trend: "text-destructive",
  },
  primary: {
    icon: "bg-accent text-primary",
    trend: "text-primary",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-3", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
