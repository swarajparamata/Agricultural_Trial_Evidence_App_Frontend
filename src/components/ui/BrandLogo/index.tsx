import { Activity } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import { cn } from '@/utils';

interface BrandLogoProps {
  /** Surface the logo sits on: the dark app header or a light card. */
  surface?: 'light' | 'dark';
  /** Overrides the default name (admins can rename the app in the settings). */
  name?: string;
  tagline?: string;
  className?: string;
}

export const BrandLogo = ({
  surface = 'light',
  name = APP_NAME,
  tagline = APP_TAGLINE,
  className,
}: BrandLogoProps) =>
  surface === 'dark' ? (
    <div className={cn('flex items-center gap-3', className)}>
      <Activity className="shrink-0 text-emerald-400" size={28} aria-hidden="true" />
      <div className="min-w-0 text-left">
        <h1 className="truncate text-xl font-bold leading-tight tracking-tight">{name}</h1>
        <p className="truncate text-xs text-emerald-400/80">{tagline}</p>
      </div>
    </div>
  ) : (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <Activity className="text-emerald-600" size={32} aria-hidden="true" />
      <h1 className="text-2xl font-bold tracking-tight text-stone-800">{name}</h1>
    </div>
  );
