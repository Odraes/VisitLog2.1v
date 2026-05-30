"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface QRScannerProps {
  onScan: (code: string) => void;
}

const REGION_ID = "qr-scanner-region";

/** Camera-based QR scanner wrapping html5-qrcode (browser-only). */
export function QRScanner({ onScan }: QRScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Holds the Html5Qrcode instance; typed loosely to avoid SSR type imports.
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(
    null
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(REGION_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText.trim());
            setActive(false);
          },
          () => {
            /* per-frame decode failures are expected; ignore */
          }
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to start the camera"
        );
        setActive(false);
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            /* already stopped */
          });
        scannerRef.current = null;
      }
    };
  }, [active, onScan]);

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div
        id={REGION_ID}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-slate-100"
      />
      {active ? (
        <Button variant="secondary" onClick={() => setActive(false)}>
          Stop Camera
        </Button>
      ) : (
        <Button
          onClick={() => {
            setError(null);
            setActive(true);
          }}
        >
          Start Camera
        </Button>
      )}
    </div>
  );
}
