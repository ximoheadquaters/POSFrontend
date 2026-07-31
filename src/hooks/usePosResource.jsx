import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 2_000;
const NON_RETRIABLE_STATUSES = new Set([401, 403, 422]);

function isRetriable(error) {
  if (!error) return false;
  if (NON_RETRIABLE_STATUSES.has(error.status)) return false;
  // Network errors, timeouts, 5xx, and unknown errors are all retriable
  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function usePosResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  // Callers supply the resource identity explicitly so refresh remains stable.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    cancelledRef.current = false;

    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (cancelledRef.current) return;

      if (attempt > 0) {
        const delay = BACKOFF_BASE_MS * 2 ** (attempt - 1);
        await sleep(delay);
        if (cancelledRef.current) return;
      }

      try {
        const result = await loader();
        if (!cancelledRef.current) {
          setData(result);
          setError(null);
          setLoading(false);
        }
        return;
      } catch (requestError) {
        lastError = requestError;
        if (!isRetriable(requestError)) break;
      }
    }

    if (!cancelledRef.current) {
      setError(lastError);
      setLoading(false);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    cancelledRef.current = false;
    refresh();
    return () => {
      cancelledRef.current = true;
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}

