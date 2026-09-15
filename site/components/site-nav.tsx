import { sitePath } from '@/lib/site-path';

const links = [
  ['/', 'Seminars'],
  ['/events', 'Events'],
  ['/visitors', 'Visitors'],
  ['/publications', 'Publications'],
  ['/people', 'People'],
  ['/phd-students', 'PhD students'],
  ['/academic-partners', 'Research Centres'],
  ['/resources', 'Resources'],
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
