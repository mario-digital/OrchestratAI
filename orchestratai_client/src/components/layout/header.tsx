import { Badge } from "@/components/ui/badge";

export function Header(): React.JSX.Element {
  return (
    <header className="bg-bg-secondary border-b border-border-default p-4">
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
