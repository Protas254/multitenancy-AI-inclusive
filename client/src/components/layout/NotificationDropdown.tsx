import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Bell, Check, AlertTriangle, ShoppingCart, Target, CreditCard } from "lucide-react";
import { INITIAL_NOTIFICATIONS } from "@/lib/mock/initialData";
import { NotificationItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import Link from "@/components/ui/link";

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "credit_payment_due":
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case "new_sale":
        return <ShoppingCart className="h-4 w-4 text-emerald-600" />;
      case "target_achieved":
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-white border-slate-200 p-1.5 shadow-xl" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto py-1 divide-y divide-slate-50">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                asChild
                className={`p-2.5 rounded-lg cursor-pointer flex items-start gap-3 transition-colors ${
                  !notif.isRead ? "bg-blue-50/40" : "hover:bg-slate-50"
                }`}
              >
                <Link href={notif.linkUrl || "/notifications"}>
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100" />
        <Link
          href="/notifications"
          className="block text-center py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-slate-50 rounded-lg"
        >
          View All Notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
