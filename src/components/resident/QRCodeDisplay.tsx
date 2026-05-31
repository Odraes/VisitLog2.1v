"use client";

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";

interface QRCodeDisplayProps {
  accessCode: string;
  qrCodeDataUrl: string;
  visitorName: string;
  onRegisterAnother: () => void;
}

export function QRCodeDisplay({
  accessCode,
  qrCodeDataUrl,
  visitorName,
  onRegisterAnother,
}: QRCodeDisplayProps) {
  return (
    <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Visitor pass created
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Share this code with {visitorName}. The guard will scan or enter it on
        arrival.
      </p>

      <img
        src={qrCodeDataUrl}
        alt={`QR code for access code ${accessCode}`}
        className="mx-auto mt-4 h-56 w-56"
      />

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Access Code
        </p>
        <p className="font-mono text-2xl font-bold tracking-widest text-slate-900 dark:text-white">
          {accessCode}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <a href={qrCodeDataUrl} download={`visitvault-${accessCode}.png`}>
          <Button variant="secondary">Download QR</Button>
        </a>
        <Button onClick={onRegisterAnother}>Register Another</Button>
      </div>
    </div>
  );
}
