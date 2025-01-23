import React from "react";
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import { XCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"; // Icons for different alert types

type AlertProps = {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({ type, title, children, className }: AlertProps) {
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border",
        {
          "bg-green-50 border-green-200 text-green-800": type === "success",
          "bg-red-50 border-red-200 text-red-800": type === "error",
          "bg-yellow-50 border-yellow-200 text-yellow-800": type === "warning",
          "bg-blue-50 border-blue-200 text-blue-800": type === "info",
        },
        className
      )}
    >
      <Icon className="w-5 h-5 mt-1 shrink-0" />
      <div>
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}