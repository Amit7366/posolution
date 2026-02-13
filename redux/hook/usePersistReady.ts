// redux/hook/usePersistReady.ts
import { useEffect, useState } from "react";
import type { Persistor } from "redux-persist";

export const usePersistReady = (persistor: Persistor) => {
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    if (persistor.getState().bootstrapped) {
      setRehydrated(true);
      return;
    }

    const unsub = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        setRehydrated(true);
        unsub();
      }
    });
  }, [persistor]);

  return rehydrated;
};
