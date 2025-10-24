export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-white">
          Orchestrat<span className="text-blue-400">AI</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl">
          AI-powered workflow orchestration platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check API Health
          </a>
        </div>
      </div>
    </div>
  );
}
