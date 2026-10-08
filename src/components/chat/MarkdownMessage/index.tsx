import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Raw HTML in answers is not rendered (react-markdown escapes it), so model output can't inject markup.
const COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
  em: ({ children }) => <em className="text-stone-600">{children}</em>,
  h1: ({ children }) => <p className="mb-1 font-semibold text-stone-900">{children}</p>,
  h2: ({ children }) => <p className="mb-1 font-semibold text-stone-900">{children}</p>,
  h3: ({ children }) => <p className="mb-1 font-semibold text-stone-900">{children}</p>,
  code: ({ children }) => (
    <code className="rounded-sm bg-stone-100 px-1 font-mono text-[0.85em]">{children}</code>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-stone-200 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-stone-100 px-2 py-1 align-top">{children}</td>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-emerald-700 underline">
      {children}
    </a>
  ),
};

/** An assistant answer, rendered from Markdown. */
export const MarkdownMessage = ({ text }: { text: string }) => (
  <div className="text-sm leading-relaxed break-words">
    <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {text}
    </Markdown>
  </div>
);
