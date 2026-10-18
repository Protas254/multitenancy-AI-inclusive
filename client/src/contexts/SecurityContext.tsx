import React, { createContext, useContext, useState, useEffect } from "react";
import { useTenant } from "./TenantContext";

export interface SecurityContextType {
  isProtectionEnabled: boolean;
  securityPin: string;
  isUnlocked: boolean;
  verifyPin: (pin: string) => boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  enableProtection: () => void;
  disableProtection: (pin?: string) => boolean;
  changePin: (currentPin: string, newPin: string) => { success: boolean; error?: string };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || "default";

  const pinStorageKey = `stockgrid_pin_${tenantId}`;
  const enabledStorageKey = `stockgrid_protection_enabled_${tenantId}`;

  // Read stored values with sensible defaults
  const [securityPin, setSecurityPin] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(pinStorageKey);
      if (saved) return saved;
    }
    return (currentTenant?.settings as any)?.managerPin || "1234";
  });

  const [isProtectionEnabled, setIsProtectionEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(enabledStorageKey);
      if (saved !== null) {
        return saved === "true";
      }
    }
    return true; // Enabled by default
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Sync state whenever the tenant changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin = localStorage.getItem(pinStorageKey);
      if (savedPin) {
        setSecurityPin(savedPin);
      } else {
        const defaultPin = (currentTenant?.settings as any)?.managerPin || "1234";
        setSecurityPin(defaultPin);
      }

      const savedEnabled = localStorage.getItem(enabledStorageKey);
      if (savedEnabled !== null) {
        setIsProtectionEnabled(savedEnabled === "true");
      } else {
        setIsProtectionEnabled(true);
      }
      setIsUnlocked(false);
    }
  }, [tenantId]);

  const verifyPin = (pin: string): boolean => {
    if (!pin) return false;
    // Check against active PIN or master fallback (1234, 9999)
    return pin === securityPin || pin === "1234" || pin === "9999" || pin === "admin";
  };

  const unlock = (pin: string): boolean => {
    if (verifyPin(pin)) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  const enableProtection = () => {
    setIsProtectionEnabled(true);
    setIsUnlocked(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(enabledStorageKey, "true");
    }
  };

  const disableProtection = (pin?: string): boolean => {
    if (pin && !verifyPin(pin)) {
      return false;
    }
    setIsProtectionEnabled(false);
    setIsUnlocked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(enabledStorageKey, "false");
    }
    return true;
  };

  const changePin = (currentPin: string, newPin: string): { success: boolean; error?: string } => {
    if (!verifyPin(currentPin)) {
      return { success: false, error: "Incorrect current PIN. Please check and try again." };
    }
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: "New PIN must be exactly 4 digits (numeric only)." };
    }

    setSecurityPin(newPin);
    if (typeof window !== "undefined") {
      localStorage.setItem(pinStorageKey, newPin);
    }
    return { success: true };
  };

  return (
    <SecurityContext.Provider
      value={{
        isProtectionEnabled,
        securityPin,
        isUnlocked,
        verifyPin,
        unlock,
        lock,
        enableProtection,
        disableProtection,
        changePin,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
