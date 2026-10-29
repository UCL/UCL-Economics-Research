'use client';

import { BrandHeader } from '@/components/brand-header';
import { SiteNav } from '@/components/site-nav';
import { sitePath } from '@/lib/site-path';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import cohorts from '@/data/job-market.json';
type Year = keyof typeof cohorts;
type Candidate = { name: string; sortName: string; group: string; paper: string; paperUrl?: string; research: string; categories: string[]; email: string; website: string; currentPosition: string; photo: string };
type CandidateGroupId = 'phd' | 'postdoc';
const groupLabel = (group: CandidateGroupId) => group === 'phd' ? "UCL PhD's" : 'Postdocs';

function CandidateGroup({ candidates, group, former, showHeading = true }: {
  candidates: Candidate[]; group: CandidateGroupId; former: boolean; showHeading?: boolean;
}) {
  return <section className="job-market-group" aria-label={groupLabel(group)}>
    {showHeading && <h2>{groupLabel(group)}</h2>}
    <div className="job-market-grid">{candidates.map(c => <article className="job-market-candidate" key={c.email}>
        {c.photo ? <img src={c.photo.startsWith('/') ? sitePath(c.photo) : c.photo} alt={c.name} width="88" height="110" loading="lazy" /> : <div className="job-market-photo-placeholder" role="img" aria-label={`Photo pending for ${c.name}`}>Photo pending</div>}<div><h3>{c.website ? <a href={c.website}>{c.name}</a> : c.name}</h3><p><strong>Job market paper:</strong> {c.paperUrl && c.paper ? <a href={c.paperUrl}>{c.paper}</a> : c.paper || 'Title awaiting confirmation'}</p><p><strong>Research fields:</strong> {c.research}</p>{former && <p className="job-market-position"><strong>Current position:</strong> {c.currentPosition || 'Awaiting confirmation'}</p>}<div className="job-market-contact"><a href={`mailto:${c.email}`}>{c.email}</a>{c.website ? <a href={c.website} aria-label={`${c.name} website`}>Website ↗</a> : <span>Website awaiting confirmation</span>}</div></div>
      </article>)}</div>
  </section>;
}

function FieldCandidates({ candidates, field, former }: { candidates: Candidate[]; field: string; former: boolean }) {
  const matches = candidates.filter(c => field === 'All candidates' || c.categories.includes(field));
  const groups = (['phd', 'postdoc'] as const)
    .map(group => ({ group, candidates: matches.filter(c => c.group === group) }))
    .filter(group => group.candidates.length > 0);
  if (groups.length === 0) return <p className="job-market-pending">No candidates in this research field.</p>;
  if (groups.length === 1) return <CandidateGroup {...groups[0]} former={former} />;
  return <Tabs defaultValue={groups[0].group} className="job-market-group-tabs">
    <TabsList variant="line" className="tabs" aria-label="Candidate group">
      {groups.map(({ group }) => <TabsTrigger value={group} key={group}>{groupLabel(group)}</TabsTrigger>)}
    </TabsList>
    {groups.map(({ group, candidates: groupCandidates }) => <TabsContent value={group} key={group}>
      <CandidateGroup candidates={groupCandidates} group={group} former={former} showHeading={false} />
    </TabsContent>)}
  </Tabs>;
}

export function JobMarketPage({ year }: { year: Year }) {
  const candidates = (cohorts[year].candidates as Candidate[]).toSorted((a,b) => a.sortName.localeCompare(b.sortName, 'en-GB'));
  const former = year === '2025-26';
  const fields = ['All candidates', 'Applied Economics', 'Econometrics', 'Economic Theory', 'Macroeconomics', 'Finance'];
  return <div className="site"><BrandHeader /><SiteNav active="/job-market" /><main>
    <header className="people-heading"><h1>{former ? 'Former job market candidates' : 'Job market candidates'}</h1><p>{year.replace('-', '–')}</p></header>
    <nav className="job-market-years" aria-label="Job market year">{(['2026-27', '2025-26'] as Year[]).map(value => <a key={value} href={sitePath(`/job-market/${value}/`)} aria-current={value === year ? 'page' : undefined}>{value.replace('-', '–')}{value === '2025-26' ? ' · Placements' : ' · Candidates'}</a>)}</nav>
    <Tabs defaultValue="All candidates" className="job-market-tabs">
      <TabsList variant="line" className="tabs job-market-field-tabs" aria-label="Research field">
        {fields.map(field => <TabsTrigger value={field} key={field}>{field}</TabsTrigger>)}
      </TabsList>
      {fields.map(field => <TabsContent value={field} key={field}>
        <FieldCandidates candidates={candidates} field={field} former={former} />
      </TabsContent>)}
    </Tabs>
    {former && <p className="job-market-source">Profiles from the <a href="https://www.ucl.ac.uk/social-historical-sciences/economics/job-market-candidates">UCL Economics job market page</a>; placements based on best available information 2026/10/29.</p>}
    </main><footer><div><strong>UCL Economics Research</strong><span>{year.replace('-', '–')}</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer></div>;
}
