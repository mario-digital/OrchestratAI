import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: ComponentProps<"textarea">): React.JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input-border bg-input-bg text-input-text placeholder:text-input-placeholder focus-visible:border-input-border-focus flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
