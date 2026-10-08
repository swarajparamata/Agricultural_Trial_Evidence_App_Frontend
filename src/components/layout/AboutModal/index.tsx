import { useAtomValue } from 'jotai';
import { Info } from 'lucide-react';
import { Modal } from '@/components/ui';
import { isAboutOpenAtom, settingsAtom, trialsAtom, useChatStore, useDisclosure } from '@/hooks';
import { getApiBaseUrl, getAppMode, insightKpis, plural } from '@/utils';

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 border-b border-stone-100 py-2 text-sm last:border-0">
    <dt className="text-stone-500">{label}</dt>
    <dd className="text-right font-medium text-stone-800">{value}</dd>
  </div>
);

export const AboutModal = () => {
  const { isOpen, close } = useDisclosure(isAboutOpenAtom);
  const { display } = useAtomValue(settingsAtom);
  const kpis = insightKpis(useAtomValue(trialsAtom));
  const status = useChatStore((state) => state.status);
  const isApi = getAppMode() === 'api';

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      title={
        <>
          <Info size={20} className="text-emerald-600" aria-hidden="true" /> About {display.app_name}
        </>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-stone-600">
        Agricultural trial evidence platform: it reconciles trial spreadsheets and reports into one record per
        trial, keeps every source and conflict visible, and answers questions with a LangGraph agent running
        on Ollama (Qwen 3.6).
      </p>
      <dl>
        <Row
          label="Data source"
          value={isApi ? `API at ${getApiBaseUrl()}` : 'Offline demo (this browser)'}
        />
        <Row label="Trials" value={`${kpis.trials} (${plural(kpis.openConflicts, 'open conflict')})`} />
        <Row label="Yield unit" value={display.yield_unit} />
        <Row
          label="Assistant"
          value={
            !isApi
              ? 'needs the backend'
              : status
                ? `${status.mode === 'llm' ? status.model : status.mode}`
                : 'not checked yet'
          }
        />
        <Row label="Stack" value="React · FastAPI · LangChain/LangGraph · Ollama" />
      </dl>
    </Modal>
  );
};
