import type { MouseEvent } from "react";

/** Prevent toolbar clicks from bubbling to canvas gesture handlers. */
export function wrapToolbarMouseAction(action: () => void | Promise<void>) {
  return (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    void action();
  };
}
