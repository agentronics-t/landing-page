"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Logomark } from "@/components/ui/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Auth is not live yet — every Login / Sign up action opens this small
 * "launching soon" popup instead, steering visitors to book a demo.
 */

const LaunchModalContext = createContext<{ open: () => void }>({ open: () => {} });

export function useLaunchModal() {
  return useContext(LaunchModalContext);
}

export function LaunchModalProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const open = useCallback(() => setShow(true), []);
  const close = useCallback(() => setShow(false), []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, close]);

  return (
    <LaunchModalContext.Provider value={{ open }}>
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Launching soon"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-raise"
            >
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-md p-2 text-content-muted transition-colors hover:text-content focus-ring"
              >
                <X size={18} />
              </button>

              <div className="flex justify-center">
                <Logomark size={40} />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-title text-content">
                Launching soon
              </h2>
              <p className="mx-auto mt-3 max-w-[340px] text-pretty text-base text-content-secondary">
                Agentronics is launching soon. Want to see the platform before everyone else?
              </p>
              <div className="mt-7 flex flex-col items-center gap-2">
                <ButtonLink href="/book" variant="primary" size="lg" glow fullWidth onClick={close}>
                  Book a demo
                </ButtonLink>
                <Button variant="ghost" size="md" fullWidth onClick={close}>
                  Maybe later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LaunchModalContext.Provider>
  );
}

/** Drop-in CTA button (usable from server components) that opens the popup. */
export function LaunchTrigger({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open } = useLaunchModal();
  return (
    <Button {...props} onClick={open}>
      {children}
    </Button>
  );
}
