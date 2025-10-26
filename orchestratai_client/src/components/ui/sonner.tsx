"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps): React.JSX.Element => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "bg-toast-bg border-toast-border text-toast-text rounded-toast",
          title: "text-toast-text",
          description: "text-toast-text-secondary",
          actionButton:
            "bg-button-primary-bg text-button-primary-text hover:bg-button-primary-hover",
          cancelButton:
            "bg-button-secondary-bg text-button-secondary-text hover:bg-button-secondary-hover",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
