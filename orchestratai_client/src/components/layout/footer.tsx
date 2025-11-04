import { Clock, Cpu, TrendingUp, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
  latency?: number;
  tokens?: number;
  cost?: number;
  dbStatus?: "connected" | "disconnected" | "checking";
}

export function Footer({
  className,
  latency,
  tokens,
  cost,
  dbStatus = "checking",
}: FooterProps = {}): React.JSX.Element {
  // Format values with fallback to "--"
  const formatLatency =
    latency !== undefined ? `${latency.toLocaleString()}ms` : "--ms";
  const formatTokens = tokens !== undefined ? tokens.toLocaleString() : "--";
  const formatCost = cost !== undefined ? `$${cost.toFixed(4)}` : "$--";

  // Format database status with color coding
  const getDbStatusColor = (): string => {
    switch (dbStatus) {
      case "connected":
        return "text-green-500";
      case "disconnected":
        return "text-red-500";
      case "checking":
        return "text-yellow-500";
      default:
        return "text-text-secondary";
    }
  };

  const getDbStatusText = (): string => {
    switch (dbStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "checking":
        return "Checking...";
      default:
        return "Unknown";
    }
  };

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
          <span>Latency: {formatLatency}</span>
        </div>

        {/* Total Tokens */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <Cpu className="h-4 w-4" />
          <span>Tokens: {formatTokens}</span>
        </div>

        {/* Total Cost */}
        <div className="flex items-center gap-2 text-text-secondary text-small">
          <TrendingUp className="h-4 w-4" />
          <span>Cost: {formatCost}</span>
        </div>

        {/* Database Status */}
        <div
          className={cn(
            "flex items-center gap-2 text-small",
            getDbStatusColor()
          )}
        >
          <Database className="h-4 w-4" />
          <span>ChromaDB: {getDbStatusText()}</span>
        </div>
      </div>
    </footer>
  );
}
