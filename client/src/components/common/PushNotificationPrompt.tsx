import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showPushAlert,
} from "@/lib/pushNotifications";

export const PushNotificationPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const permission = getNotificationPermission();
    const hasPrompted = localStorage.getItem("stockgrid_push_prompted");

    // Show prompt on first login if permission has not been granted or permanently denied yet
    if (permission === "default" && !hasPrompted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setIsEnabling(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        setIsSuccess(true);
        // Show test welcome notification immediately
        await showPushAlert({
          title: "🔔 StockGrid Notifications Active",
          message: "You will now receive instant pop-ups for low stock, sales milestones, and drawer closing reminders.",
          url: "/notifications",
        });

        setTimeout(() => {
          setIsVisible(false);
        }, 2500);
      } else {
        setIsVisible(false);
      }
    } catch (err) {
      console.warn("Notification request cancelled or blocked:", err);
      setIsVisible(false);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("stockgrid_push_prompted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Glowing Ambient Light */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="flex items-center gap-3 py-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Notifications Enabled</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Low stock alerts and closing reminders will now pop up on this device.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
              </div>
              <div className="pr-4">
                <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>StockGrid Real-time Alerts</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                    24/7
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  StockGrid wants to send you notifications for low stock, sales quota achievements, and daily drawer reconciliation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleAllow}
                isLoading={isEnabling}
                size="sm"
                className="flex-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md rounded-xl h-8"
              >
                Tap Allow
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-8"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
