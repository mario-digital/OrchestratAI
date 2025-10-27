import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps = {}): React.JSX.Element {
  return (
    <header
      className={cn(
        "bg-bg-secondary border-b border-border-default p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* Branding */}
        <div>
          <h1 className="text-h2 font-bold text-text-primary">OrchestratAI</h1>
          <p className="text-small text-text-secondary">
            LangGraph Orchestrator + RAG/CAG Hybrid
          </p>
        </div>

        {/* Status Badge */}
        <Badge className="bg-badge-active-bg text-badge-active-text border-0">
          ACTIVE
        </Badge>
      </div>
    </header>
  );
}
