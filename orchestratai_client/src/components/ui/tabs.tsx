"use client";

import { type ComponentProps, type ReactElement } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>): ReactElement {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-space-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>): ReactElement {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-size-9 w-fit items-center justify-center rounded-lg p-space-half",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>): ReactElement {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full flex-1 items-center justify-center gap-space-1-half rounded-md border border-transparent px-space-2 py-space-1 text-sm font-medium whitespace-nowrap transition-interactive focus-visible:ring-size-3 focus-visible:outline-size-1 disabled:pointer-events-none disabled:opacity-50 text-foreground dark:text-muted-foreground focus-visible:ring-ring-focus-subtle",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>): ReactElement {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
