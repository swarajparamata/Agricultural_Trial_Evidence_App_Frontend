import { atom } from 'jotai';
import type { ChatTab } from '@/types';

/** The add/edit trial dialog: closed, adding, or editing one trial. */
export type TrialFormState = { mode: 'create' } | { mode: 'edit'; trialId: string } | null;

export const trialFormAtom = atom<TrialFormState>(null);

export const isCompareModalOpenAtom = atom(false);

/** ID of the trial shown in the detail dialog. */
export const detailTrialIdAtom = atom<string | null>(null);

/** Name of the source file shown in the source viewer. */
export const sourceFileAtom = atom<string | null>(null);

export const isUserMenuOpenAtom = atom(false);

export const isAboutOpenAtom = atom(false);

export const isChatOpenAtom = atom(false);

export const activeChatTabAtom = atom<ChatTab>('chat');
