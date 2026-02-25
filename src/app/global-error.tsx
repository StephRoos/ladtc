"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Une erreur est survenue</h2>
          <button onClick={() => reset()}>Réessayer</button>
        </div>
      </body>
    </html>
  );
}
