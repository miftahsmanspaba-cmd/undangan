import React from 'react';
import { CalendarHeart, Images, MapPin, MessageSquareHeart, Music, Pause, Users } from 'lucide-react';

interface NavigationBarProps {
  coupleTitle: string;
  isOpened: boolean;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  coupleTitle,
  isOpened,
  isPlayingMusic,
  onToggleMusic,
}) => {
  if (!isOpened) return null;

  const navItems = [
    { href: '#mempelai', label: 'Mempelai', icon: Users },
    { href: '#acara', label: 'Acara', icon: CalendarHeart },
    { href: '#lokasi', label: 'Lokasi', icon: MapPin },
    { href: '#galeri', label: 'Galeri', icon: Images },
    { href: '#rsvp', label: 'RSVP', icon: MessageSquareHeart },
  ];

  return (
    <>
      {/* Desktop Top Bar: Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 hidden border-b border-[#B8862D]/20 bg-[#FAF6EE]/90 backdrop-blur-md md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3.5">
          <a
            href="#top"
            className="font-serif text-xl font-semibold tracking-tight text-[#24160F] whitespace-nowrap shrink-0"
          >
            {coupleTitle}
          </a>

          <nav className="flex items-center gap-6 text-sm font-medium text-[#574439]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[#24160F] hover:underline hover:underline-offset-4 whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#rsvp"
              className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#24160F] px-5 py-2 text-xs font-semibold text-[#FAF6EE] transition-colors hover:bg-[#3A2419] whitespace-nowrap shrink-0"
            >
              Konfirmasi Kehadiran
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Navigation (Height = 56px, well under 15% mobile viewport cap) */}
      <nav
        aria-label="Navigasi Undangan"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#B8862D]/25 bg-[#FAF6EE]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 text-[#574439] transition-colors hover:text-[#24160F]"
              >
                <Icon className="h-4 w-4 text-[#8A5E14]" />
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Floating Compact Music Control */}
      <button
        type="button"
        onClick={onToggleMusic}
        aria-label={isPlayingMusic ? 'Jeda musik latar' : 'Putar musik latar'}
        title={isPlayingMusic ? 'Jeda Musik' : 'Putar Musik'}
        className="fixed right-4 bottom-20 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#DFB963]/55 bg-[#24160F] text-[#DFB963] shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D] md:bottom-6 md:right-6"
      >
        {isPlayingMusic ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Music className="h-4 w-4 animate-vinyl" />
        )}
      </button>
    </>
  );
};
