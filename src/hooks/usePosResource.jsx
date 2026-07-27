import { useCallback, useEffect, useState } from "react";

export default function usePosResource(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Callers supply the resource identity explicitly so refresh remains stable.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
