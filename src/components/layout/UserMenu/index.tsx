import { User } from 'lucide-react';
import { useId, useRef } from 'react';
import { Badge, IconButton, MenuItem } from '@/components/ui';
import {
  isAboutOpenAtom,
  isUserMenuOpenAtom,
  useAuthStore,
  useClickOutside,
  useDisclosure,
  useEscapeKey,
  useIsAdmin,
  useRoute,
} from '@/hooks';
import { canSwitchToOfflineDemo, getAppMode, setOfflineDemo } from '@/utils';

export const UserMenu = () => {
  const { isOpen, toggle, close } = useDisclosure(isUserMenuOpenAtom);
  const about = useDisclosure(isAboutOpenAtom);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const isAdmin = useIsAdmin();
  const { navigate } = useRoute();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isDemo = getAppMode() === 'demo';

  useClickOutside(containerRef, close, isOpen);
  useEscapeKey(close, isOpen);

  const choose = (action: () => void) => () => {
    close();
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <IconButton
        icon={User}
        label="Account menu"
        variant="avatar"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggle}
      />

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-stone-200 bg-white py-1 text-stone-800 shadow-lg"
        >
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="truncate text-sm font-semibold">{user?.fullName || user?.email}</p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
            <div className="mt-2 flex gap-1.5">
              <Badge tone={isAdmin ? 'emerald' : 'neutral'}>{isAdmin ? 'Admin' : 'Viewer'}</Badge>
              {isDemo && <Badge tone="amber">Offline demo</Badge>}
            </div>
          </div>
          <MenuItem onClick={choose(() => navigate({ page: 'dashboard' }))}>Dashboard</MenuItem>
          <MenuItem onClick={choose(() => navigate({ page: 'settings', tab: 'account' }))}>
            My account
          </MenuItem>
          {isAdmin && (
            <MenuItem onClick={choose(() => navigate({ page: 'settings', tab: 'users' }))}>Settings</MenuItem>
          )}
          <MenuItem onClick={choose(about.open)}>About</MenuItem>
          {canSwitchToOfflineDemo() && (
            <MenuItem onClick={choose(() => setOfflineDemo(!isDemo))}>
              {isDemo ? 'Connect to the backend' : 'Switch to the offline demo'}
            </MenuItem>
          )}
          <div role="separator" className="my-1 h-px bg-stone-100" />
          <MenuItem tone="danger" onClick={choose(() => void signOut())}>
            Logout
          </MenuItem>
        </div>
      )}
    </div>
  );
};
