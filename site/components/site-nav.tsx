import { sitePath } from '@/lib/site-path';

const links = [
  ['/', 'Seminars'],
  ['/visitors', 'Visitors'],
  ['/events', 'Events'],
  ['/publications', 'Publications'],
  ['/people', 'People'],
  ['/research-computing', 'Computing'],
  ['/data', 'Data'],
  ['/resources', 'Resources'],
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
