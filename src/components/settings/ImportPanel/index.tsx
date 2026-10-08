import { TrialFileImport } from '@/components/trials';
import { Card } from '@/components/ui';

interface ImportPanelProps {
  onImported: () => void;
}

/** Upload trial spreadsheets and reports; preview runs the whole pipeline without saving. */
export const ImportPanel = ({ onImported }: ImportPanelProps) => (
  <Card
    title="Import data"
    description="CSV/TSV spreadsheets in any column layout and text reports. Values are matched to fields through Settings → Import rules; reports the rules can't read go through the LLM extraction loop. Re-importing a file with the same name replaces it."
  >
    <TrialFileImport onImported={onImported} />
  </Card>
);
