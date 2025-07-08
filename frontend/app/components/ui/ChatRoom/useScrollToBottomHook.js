import { useEffect } from "react";

export default function useScrollToBottomHook(ref, dependency) {
  useEffect(() => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [dependency]);
}
