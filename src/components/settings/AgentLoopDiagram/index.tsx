interface AgentLoopDiagramProps {
  maxToolIterations: number;
  maxRevisions: number;
  reflection: boolean;
}

interface NodeSpec {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
  terminal?: boolean;
}

const W = 112;
const H = 46;

const NODES: NodeSpec[] = [
  { id: 'start', x: 18, y: 112, label: 'Question', detail: 'from the chat', terminal: true },
  { id: 'agent', x: 168, y: 112, label: 'agent', detail: 'Qwen 3.6 or planner' },
  { id: 'tools', x: 168, y: 14, label: 'tools', detail: 'search · stats · compare' },
  { id: 'verify', x: 348, y: 112, label: 'verify', detail: 'numbers, IDs, caveats' },
  { id: 'revise', x: 348, y: 210, label: 'revise', detail: 'reviewer feedback' },
  { id: 'finalize', x: 540, y: 112, label: 'finalize', detail: 'answer + sources', terminal: true },
];

const node = (id: string) => NODES.find((item) => item.id === id) as NodeSpec;

/** The agent's LangGraph: a tool loop (agent ⇄ tools) and a reflection loop (verify → revise → agent). */
export const AgentLoopDiagram = ({ maxToolIterations, maxRevisions, reflection }: AgentLoopDiagramProps) => {
  const agent = node('agent');
  const tools = node('tools');
  const verify = node('verify');
  const revise = node('revise');
  const finalize = node('finalize');
  const start = node('start');

  return (
    <figure>
      <svg
        viewBox="0 0 664 272"
        role="img"
        aria-labelledby="agent-loop-title agent-loop-desc"
        className="h-auto w-full max-w-3xl"
      >
        <title id="agent-loop-title">Agent graph with two loops</title>
        <desc id="agent-loop-desc">
          {`The question goes to the agent. The agent calls tools and gets their results back, up to ${maxToolIterations} times per round. Its draft goes to verify; if the checks fail, revise sends feedback to the agent, up to ${maxRevisions} times; otherwise finalize returns the answer with its sources.`}
        </desc>
        <defs>
          <marker
            id="arrow-stone"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#78716c" />
          </marker>
          <marker
            id="arrow-emerald"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#047857" />
          </marker>
          <marker
            id="arrow-violet"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#6d28d9" />
          </marker>
        </defs>

        {/* main path */}
        <g stroke="#78716c" strokeWidth={1.5} fill="none" markerEnd="url(#arrow-stone)">
          <line x1={start.x + W} y1={start.y + H / 2} x2={agent.x - 2} y2={agent.y + H / 2} />
          <line x1={agent.x + W} y1={agent.y + H / 2} x2={verify.x - 2} y2={verify.y + H / 2} />
          <line x1={verify.x + W} y1={verify.y + H / 2} x2={finalize.x - 2} y2={finalize.y + H / 2} />
        </g>
        <text
          x={(verify.x + W + finalize.x) / 2}
          y={verify.y + H / 2 - 8}
          textAnchor="middle"
          className="fill-stone-500 text-[11px]"
        >
          {reflection ? 'pass' : 'no checks'}
        </text>

        {/* tool loop */}
        <g stroke="#047857" strokeWidth={1.75} fill="none" markerEnd="url(#arrow-emerald)">
          <line x1={agent.x + 36} y1={agent.y - 2} x2={tools.x + 36} y2={tools.y + H + 2} />
          <line x1={tools.x + W - 36} y1={tools.y + H + 2} x2={agent.x + W - 36} y2={agent.y - 2} />
        </g>
        <text
          x={tools.x + W + 10}
          y={tools.y + H + 26}
          className="fill-emerald-800 text-[11px] font-semibold"
        >
          tool loop
        </text>
        <text x={tools.x + W + 10} y={tools.y + H + 40} className="fill-stone-500 text-[11px]">
          up to {maxToolIterations} steps
        </text>

        {/* reflection loop */}
        {reflection && (
          <>
            <g stroke="#6d28d9" strokeWidth={1.75} fill="none" markerEnd="url(#arrow-violet)">
              <line x1={verify.x + W / 2} y1={verify.y + H + 2} x2={revise.x + W / 2} y2={revise.y - 2} />
              <path d={`M${revise.x - 2},${revise.y + H / 2} H${agent.x + W / 2} V${agent.y + H + 4}`} />
            </g>
            <text
              x={verify.x + W / 2 + 8}
              y={verify.y + H + 30}
              className="fill-violet-800 text-[11px] font-semibold"
            >
              fail
            </text>
            <text
              x={agent.x + W / 2 + 10}
              y={revise.y + H / 2 - 8}
              className="fill-violet-800 text-[11px] font-semibold"
            >
              reflection loop
            </text>
            <text x={agent.x + W / 2 + 10} y={revise.y + H / 2 + 22} className="fill-stone-500 text-[11px]">
              up to {maxRevisions} revision{maxRevisions === 1 ? '' : 's'}
            </text>
          </>
        )}

        {NODES.filter((item) => reflection || item.id !== 'revise').map((item) => (
          <g key={item.id}>
            <rect
              x={item.x}
              y={item.y}
              width={W}
              height={H}
              rx={item.terminal ? H / 2 : 10}
              fill={item.terminal ? '#f5f5f4' : '#ffffff'}
              stroke={item.id === 'tools' ? '#047857' : item.id === 'revise' ? '#6d28d9' : '#a8a29e'}
              strokeWidth={1.5}
            />
            <text
              x={item.x + W / 2}
              y={item.y + 19}
              textAnchor="middle"
              className="fill-stone-800 text-[13px] font-semibold"
            >
              {item.label}
            </text>
            <text
              x={item.x + W / 2}
              y={item.y + 34}
              textAnchor="middle"
              className="fill-stone-500 text-[10px]"
            >
              {item.detail}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-stone-500">
        Every number in the answer must appear in a tool result, every trial ID must exist, and conflicts and
        missing controls must be disclosed – otherwise the reviewer's notes go back to the agent. Without
        Ollama the same graph runs with the rule-based planner in the agent node.
      </figcaption>
    </figure>
  );
};
