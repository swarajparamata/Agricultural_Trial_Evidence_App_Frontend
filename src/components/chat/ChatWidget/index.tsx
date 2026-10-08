import { isChatOpenAtom, useDisclosure } from '@/hooks';
import { ChatToggleButton } from '../ChatToggleButton';
import { ChatWindow } from '../ChatWindow';

/** Floating AI assistant pinned to the bottom-right corner. */
export const ChatWidget = () => {
  const { isOpen, toggle, close } = useDisclosure(isChatOpenAtom);

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end">
      {isOpen && <ChatWindow onClose={close} />}
      <ChatToggleButton isOpen={isOpen} onToggle={toggle} />
    </div>
  );
};
