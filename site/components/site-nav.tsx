import { sitePath } from '@/lib/site-path';

const links = [
  ['/', 'Seminars'],
  ['/visitors', 'Visitors'],
  ['/events', 'Events'],
  ['/publications', 'Recent publications'],
  ['/people', 'People'],
  ['/research-computing', 'Research Computing'],
  ['/data', 'Data'],
  ['/academic-partners', 'Academic Partners'],
] as const;

export function SiteNav({ active }: { active: string }) {
  return (
    <nav className="primary" aria-label="Primary navigation">
      <div>
        {links.map(([href, label]) => (
          <a className={active === href ? 'active' : undefined} href={sitePath(href === '/' ? '/' : `${href}/`)} key={href}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
