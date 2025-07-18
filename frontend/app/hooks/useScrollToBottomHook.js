import { useEffect } from "react";

export default function useScrollToBottomHook(ref, dependency, enabled) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [ref, dependency, enabled]);
}
