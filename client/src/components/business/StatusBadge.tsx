import React from "react";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = (status || "").toLowerCase().replace(/_/g, " ");

  let variant: "success" | "destructive" | "warning" | "info" | "secondary" | "purple" = "secondary";

  switch (normalized) {
    case "active":
    case "completed":
    case "paid":
    case "received":
    case "approved":
    case "cleared":
      variant = "success";
      break;

    case "overdue":
    case "voided":
    case "canceled":
    case "cancelled":
    case "rejected":
    case "out of stock":
    case "blocked":
      variant = "destructive";
      break;

    case "pending":
    case "partially paid":
    case "partially received":
    case "low stock":
    case "due soon":
    case "draft":
    case "on leave":
      variant = "warning";
      break;

    case "sent":
    case "current":
    case "in stock":
    case "platinum":
      variant = "info";
      break;

    case "gold":
    case "silver":
    case "bronze":
      variant = "purple";
      break;

    default:
      variant = "secondary";
  }

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Badge variant={variant} className={className}>
      {capitalize(normalized)}
    </Badge>
  );
};
