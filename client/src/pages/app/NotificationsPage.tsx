import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { notificationsApi } from "@/lib/api/notifications";
import { NotificationItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Target,
  CreditCard,
  Check,
  ArrowRight,
} from "lucide-react";

export default function NotificationsPage() {
  const { currentTenant } = useTenant();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications(currentTenant.id);
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead(currentTenant.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Notifications and Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational warnings, inventory depletion triggers, and overdue receivables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            <span>Mark All as Read</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "unread" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No notifications to display.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    !notif.isRead ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.linkUrl && (
                      <Link href={notif.linkUrl}>
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-semibold">
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
