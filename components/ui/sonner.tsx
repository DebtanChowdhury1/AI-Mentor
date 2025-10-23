"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster({ ...props }) {
  return <SonnerToaster theme="system" toastOptions={{ className: "glass-panel" }} {...props} />;
}
