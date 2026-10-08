import { useAtomValue } from 'jotai';
import { BrandLogo } from '@/components/ui';
import { APP_TAGLINE } from '@/constants';
import { settingsAtom, useRoute } from '@/hooks';
import { NavTabs } from '../NavTabs';
import { UserMenu } from '../UserMenu';

export const Header = () => {
  const { display } = useAtomValue(settingsAtom);
  const { navigate } = useRoute();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-emerald-900 px-4 py-3 text-white shadow-md sm:px-6">
      <button
        type="button"
        onClick={() => navigate({ page: 'dashboard' })}
        className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-emerald-300"
        aria-label="Go to the dashboard"
      >
        <BrandLogo surface="dark" name={display.app_name} tagline={display.organization || APP_TAGLINE} />
      </button>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <NavTabs />
        <UserMenu />
      </div>
    </header>
  );
};
