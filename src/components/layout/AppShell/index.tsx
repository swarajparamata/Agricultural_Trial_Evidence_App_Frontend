import { ChatWidget } from '@/components/chat';
import { DashboardPage, SettingsPage } from '@/components/pages';
import { CompareModal, SourceViewerModal, TrialDetailModal, TrialFormModal } from '@/components/trials';
import { useAppDataLoader, useRoute } from '@/hooks';
import { AboutModal } from '../AboutModal';
import { Header } from '../Header';
import { ModeBanner } from '../ModeBanner';

/** The signed-in app: header, the current page, the shared dialogs and the assistant. */
export const AppShell = () => {
  useAppDataLoader();
  const { route } = useRoute();

  return (
    <div className="relative flex min-h-screen flex-col bg-stone-50 font-sans text-stone-900">
      <Header />
      <ModeBanner />
      {route.page === 'settings' ? <SettingsPage tab={route.tab} /> : <DashboardPage />}

      <TrialFormModal />
      <TrialDetailModal />
      <CompareModal />
      <SourceViewerModal />
      <AboutModal />
      <ChatWidget />
    </div>
  );
};
