'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { BrandHeader } from '@/components/brand-header';
import { SiteNav } from '@/components/site-nav';

type Brief = {
  title: string;
  authors: string[];
  date: string;
  topic: string;
  url: string;
  image: string;
};

const briefs: Brief[] = [
  {
    title: 'Macroeconomic shocks: the importance of knowing who is most affected',
    authors: ['Raffaella Giacomini'],
    date: '2026-09-17',
    topic: 'Prices & interest rates',
    url: 'https://ucleconbrief.co.uk/2026/09/17/macroeconomic-shocks-the-importance-of-knowing-who-is-most-affected/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/09/dan-meyers-sP445Zr4Bnc-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'When good businesses cannot borrow: the wider cost of the gender credit gap',
    authors: ['Marta Morazzoni'],
    date: '2026-09-10',
    topic: 'Banking & finance',
    url: 'https://ucleconbrief.co.uk/2026/09/10/when-good-businesses-cannot-borrow-the-wider-cost-of-the-gender-credit-gap/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/08/vitaly-gariev-mymmyXl5rSA-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'The role of relationships in bank lending: a new approach',
    authors: ['Daniel Lewis'],
    date: '2026-09-03',
    topic: 'Banking & finance',
    url: 'https://ucleconbrief.co.uk/2026/09/03/the-role-of-relationships-in-bank-lending-a-new-approach/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/08/radission-us-_XeQ8XEWb4Q-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'Better teacher interactions boost children’s success: evidence from Ecuador',
    authors: ['Pedro Carneiro'],
    date: '2026-08-27',
    topic: 'Schools & early years',
    url: 'https://ucleconbrief.co.uk/2026/08/27/better-teacher-interactions-boost-childrens-success-evidence-from-ecuador/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/05/031_cover.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'How prices in financial markets can exaggerate people’s inflation worries',
    authors: ['Saleem Bahaj'],
    date: '2026-08-13',
    topic: 'Prices & interest rates',
    url: 'https://ucleconbrief.co.uk/2026/08/13/how-prices-in-financial-markets-can-exaggerate-peoples-inflation-worries/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/03/aedrian-salazar-MTxseYMqYzk-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'Jobs in America today offer more freedom – but they’re also more stressful',
    authors: ['Fabien Postel-Vinay', 'Gregory Jolivet'],
    date: '2026-08-06',
    topic: 'Jobs, work & pay',
    url: 'https://ucleconbrief.co.uk/2026/08/06/jobs-in-america-today-offer-more-freedom-but-theyre-also-more-stressful/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/07/l-ch-S3jgTJ91pio-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'Improving access to university can change how school students prepare',
    authors: ['Michela Tincani'],
    date: '2026-07-30',
    topic: 'Higher education',
    url: 'https://ucleconbrief.co.uk/2026/07/30/improving-access-to-university-can-change-how-school-students-prepare/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/06/christian-lendl-nxBucBB_ihQ-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'Honesty is the best policy: how ‘gaming the system’ costs everyone',
    authors: ['Vasiliki Skreta'],
    date: '2026-07-23',
    topic: 'Behaviour & decision-making',
    url: 'https://ucleconbrief.co.uk/2026/07/23/honesty-is-the-best-policy-how-gaming-the-system-costs-everyone/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/05/felix-mittermeier-nAjil1z3eLk-unsplash.jpg?fit=300%2C200&ssl=1',
  },
  {
    title: 'How disruptive classmates affect a child’s learning: evidence from Ecuador',
    authors: ['Pedro Carneiro'],
    date: '2026-07-16',
    topic: 'Schools & early years',
    url: 'https://ucleconbrief.co.uk/2026/07/16/how-disruptive-classmates-affect-a-childs-learning-evidence-from-ecuador/',
    image: 'https://i0.wp.com/ucleconbrief.co.uk/wp-content/uploads/2026/05/joshua-dixon-lRhedSIgeo0-unsplash.jpg?fit=300%2C200&ssl=1',
  },
];

const topics = Array.from(new Set(briefs.map((brief) => brief.topic))).sort();
const topicOptions = ['All topics', ...topics];
const topicRows = topicOptions.length <= 7
  ? [topicOptions]
  : [topicOptions.slice(0, Math.ceil(topicOptions.length / 2)), topicOptions.slice(Math.ceil(topicOptions.length / 2))];
const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));

export default function EconBriefSearchPage() {
  const [topic, setTopic] = useState('All topics');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return briefs.filter((brief) =>
      (topic === 'All topics' || brief.topic === topic) &&
      (!needle || `${brief.title} ${brief.authors.join(' ')} ${brief.topic}`.toLowerCase().includes(needle))
    );
  }, [query, topic]);

  const resetFilters = () => {
    setTopic('All topics');
    setQuery('');
  };

  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/resources" />
      <main className="econ-brief-page">
        <header className="econ-brief-heading">
          <h1>Search EconBrief</h1>
          <div className="econ-brief-search">
            <Search aria-hidden="true" size={20} />
            <label className="sr-only" htmlFor="brief-search">Search briefs</label>
            <input id="brief-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or topic" />
          </div>
        </header>

        <div className="econ-brief-browser">
          <aside className="econ-brief-topics" aria-label="Browse by topic">
            {topicRows.map((row) => (
              <div className="econ-brief-topic-row" key={row[0]}>
                {row.map((item) => (
                <button
                  className={topic === item ? 'active' : ''}
                  key={item}
                  onClick={() => setTopic(item)}
                  type="button"
                >
                  {item}
                </button>
                ))}
              </div>
            ))}
          </aside>

          <section className="econ-brief-results">
            <div className="econ-brief-result-heading" aria-live="polite">
              <h2>{topic}</h2>
              <p>{results.length} {results.length === 1 ? 'brief' : 'briefs'}</p>
            </div>

            <div className="econ-brief-list">
              {results.map((brief) => (
                <article key={brief.url}>
                  <div className="econ-brief-icon">
                    <Image src={brief.image} alt="" width={132} height={132} unoptimized />
                  </div>
                  <div>
                    <p className="econ-brief-topic">{brief.topic}</p>
                    <h3><a href={brief.url} target="_blank" rel="noreferrer">{brief.title}</a></h3>
                    <p className="econ-brief-meta"><strong>{brief.authors.join(' & ')}</strong><span aria-hidden="true"> · </span>{formatDate(brief.date)}</p>
                  </div>
                </article>
              ))}
              {!results.length && (
                <div className="econ-brief-empty">
                  <h3>No matching briefs</h3>
                  <p>Try another topic, author, date, or search term.</p>
                  <button type="button" onClick={resetFilters}>Clear all filters</button>
                </div>
              )}
            </div>
          </section>
        </div>
        <p className="econ-brief-note">This index currently highlights recent briefs. Briefs open on the EconBrief website.</p>
      </main>
      <footer><div><strong>UCL Economics Research</strong><span>2026–27</span></div><a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a></footer>
    </div>
  );
}
