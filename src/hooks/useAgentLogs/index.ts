import { useChatStore } from '../stores';

export const useAgentLogs = () => useChatStore((state) => state.logs);
