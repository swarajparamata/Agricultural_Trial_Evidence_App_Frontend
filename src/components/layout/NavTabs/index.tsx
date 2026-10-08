import { LayoutDashboard, Settings } from 'lucide-react';
import { useIsAdmin, useRoute } from '@/hooks';
import { cn } from '@/utils';

/** Top-level pages; viewers get "My account" instead of the admin settings. */
export const NavTabs = () => {
  const { route, navigate } = useRoute();
  const isAdmin = useIsAdmin();
  const items = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: route.page === 'dashboard',
      go: () => navigate({ page: 'dashboard' }),
    },
    {
      label: isAdmin ? 'Settings' : 'My account',
      icon: Settings,
      active: route.page === 'settings',
      go: () => navigate({ page: 'settings', tab: route.page === 'settings' ? route.tab : 'account' }),
    },
  ];

  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {items.map(({ label, icon: Icon, active, go }) => (
        <button
          key={label}
          type="button"
          onClick={go}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-300',
            active
              ? 'bg-emerald-800 text-white'
              : 'text-emerald-100/80 hover:bg-emerald-800/60 hover:text-white',
          )}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
};
