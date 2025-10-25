import { type ComponentProps, type JSX } from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: ComponentProps<"input">): JSX.Element {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input-bg-overlay border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-interactive outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring-focus-subtle ring-focus",
        "aria-invalid:ring-ring-error-subtle aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
