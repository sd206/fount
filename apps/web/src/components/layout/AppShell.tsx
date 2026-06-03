'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NAV = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/flows', icon: 'stack-2', label: 'Flows' },
  { href: '/tasks', icon: 'checkbox', label: 'Tasks' },
  { href: '/calendar', icon: 'calendar', label: 'Calendar' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Slim sidebar (desktop) */}
      <aside className="hidden md:flex flex-col items-center w-14 bg-white border-r border-[var(--color-border-tertiary)] py-4 gap-1 fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center mb-4">
          <span className="text-white text-xs font-bold">F</span>
        </div>

        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={clsx(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-[var(--color-background-tertiary)] text-[var(--color-brand)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)]',
            )}
          >
            <i className={`ti ti-${item.icon} text-xl`} />
          </Link>
        ))}

        {/* Drop CTA */}
        <Link
          href="/drops/new"
          className="mt-auto w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity"
          title="Drop"
        >
          <i className="ti ti-plus text-xl" />
        </Link>

        {/* Profile */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center mt-2">
          <i className="ti ti-user text-sm text-[var(--color-text-secondary)]" />
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-14 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[var(--color-border-tertiary)] flex items-center justify-around px-2 h-16 z-20">
        <MobileNavItem href="/dashboard" icon="home" label="Home" pathname={pathname} />
        <MobileNavItem href="/search" icon="search" label="Search" pathname={pathname} />

        {/* Center Drop CTA */}
        <Link
          href="/drops/new"
          className="w-12 h-12 rounded-2xl bg-[var(--color-brand)] flex items-center justify-center shadow-md"
        >
          <i className="ti ti-plus text-white text-xl" />
        </Link>

        <MobileNavItem href="/flows" icon="stack-2" label="Flows" pathname={pathname} />
        <MobileNavItem href="/profile" icon="user" label="Me" pathname={pathname} />
      </nav>
    </div>
  );
}

function MobileNavItem({ href, icon, label, pathname }: {
  href: string; icon: string; label: string; pathname: string;
}) {
  const active = pathname.startsWith(href);
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5">
      <i className={clsx(`ti ti-${icon} text-xl`, active ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)]')} />
      <span className={clsx('text-[10px]', active ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)]')}>
        {label}
      </span>
    </Link>
  );
}
