import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async loader and tracks { data, loading, error }.
 * `reload()` runs it again (e.g. after a create/update/delete).
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) };
}
