import { Clock, Cpu, TrendingUp, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps = {}): React.JSX.Element {
  return (
    <footer
      className={cn(
        "bg-bg-secondary border-t border-border-default p-4",
        className
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Latency */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <Clock className="h-4 w-4" />
          <span>Latency: --ms</span>
        </div>

        {/* Total Tokens */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <Cpu className="h-4 w-4" />
          <span>Tokens: --</span>
        </div>

        {/* Total Cost */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <TrendingUp className="h-4 w-4" />
          <span>Cost: $--</span>
        </div>

        {/* Database Status */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <Database className="h-4 w-4" />
          <span>ChromaDB: Connected</span>
        </div>
      </div>
    </footer>
  );
}
