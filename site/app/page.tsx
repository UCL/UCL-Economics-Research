'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  addWeeks,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfWeek,
} from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteNav } from '@/components/site-nav';
import seminarData from '@/data/seminars.json';

type SeriesId =
  | 'all'
  | 'applied'
  | 'econometrics'
  | 'theory'
  | 'finance'
  | 'macro'
  | 'ifs';
type Seminar = {
  id: string;
  series: Exclude<SeriesId, 'all'>;
  date: string;
  speaker: string;
  institution: string;
  speakerUrl?: string;
  title?: string;
  paperUrl?: string;
  location: string;
  locationUrl?: string;
  time: string;
};

const series: { id: SeriesId; label: string }[] = [
  { id: 'all', label: 'All seminars' },
  { id: 'applied', label: 'Applied Economics' },
  { id: 'econometrics', label: 'CeMMAP' },
  { id: 'theory', label: 'THEBES' },
  { id: 'finance', label: 'Finance' },
  { id: 'macro', label: 'Macroeconomics' },
  { id: 'ifs', label: 'IFS Seminars' },
];
const seminars = seminarData as Seminar[];

function Speaker({ s }: { s: Seminar }) {
  return (
    <span className="speaker">
      {s.speakerUrl ? (
        <a href={s.speakerUrl} target="_blank" rel="noreferrer">
          {s.speaker}
        </a>
      ) : (
        <strong>{s.speaker}</strong>
      )}
      <span>{s.institution}</span>
    </span>
  );
}
function Title({ s }: { s: Seminar }) {
  const text = s.title || 'TBA';
  return s.title && s.paperUrl ? (
    <a href={s.paperUrl}>{text}</a>
  ) : (
    <span className={!s.title ? 'tba' : ''}>{text}</span>
  );
}

function Schedule({ items, nextId }: { items: Seminar[]; nextId?: string }) {
  return (
    <div className="table-shell">
      <Table className="schedule">
        <TableHeader>
          <TableRow>
          {['Date and time', 'Speaker', 'Title', 'Location'].map((x) => (
              <TableHead key={x}>{x}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id} className={s.id === nextId ? 'next-row' : ''}>
              <TableCell data-label="Date">
                <time dateTime={s.date}>
                  {format(parseISO(s.date), 'd MMM')}
                </time>
                <span className="table-time">{s.time}</span>
                {s.id === nextId && <small>Next</small>}
              </TableCell>
              <TableCell data-label="Speaker">
                <Speaker s={s} />
              </TableCell>
              <TableCell data-label="Title" className="paper">
                <Title s={s} />
              </TableCell>
              <TableCell data-label="Location">{s.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Next({ s, label }: { s: Seminar; label: string }) {
  return (
    <section className="next-card">
      <p className="eyebrow">Next {label} seminar</p>
      <div className="next-grid">
        <div>
          <p className="icon-line">
            <CalendarDays />
            <span className="desktop-date">
              {format(parseISO(s.date), 'EEEE d MMMM yyyy')}
            </span>
            <span className="mobile-date">
              {format(parseISO(s.date), 'EEE d MMM yyyy')}
            </span>
          </p>
          <h2>
            <Speaker s={s} />
          </h2>
          <p className="next-title">
            <Title s={s} />
          </p>
        </div>
        <dl>
          <div>
            <dt>
              <Clock3 />
              Time
            </dt>
            <dd>{s.time}</dd>
          </div>
          <div>
            <dt>
              <MapPin />
              Location
            </dt>
            <dd>
              {s.locationUrl ? (
                <a href={s.locationUrl}>{s.location}</a>
              ) : (
                s.location
              )}
            </dd>
          </div>
        </dl>
      </div>
      <Link className="signup" href={`/sign-up?seminar=${s.id}`}>
        Sign up to meet the speaker <ArrowRight />
      </Link>
    </section>
  );
}

function Series({
  id,
  label,
}: {
  id: Exclude<SeriesId, 'all'>;
  label: string;
}) {
  const items = seminars.filter((s) => s.series === id);
  const next = items.find((s) => !isBefore(parseISO(s.date), new Date()));
  return (
    <div className="stack">
      <header className="title-row">
        <div>
          <p className="eyebrow">2026–27</p>
          <h1>
            {id === 'econometrics' ? (
              <>
                CeMMAP{' '}
                <a href="https://cemmap.ac.uk" target="_blank" rel="noreferrer">
                  (Centre for Microdata Methods and Practice)
                </a>
              </>
            ) : (
              label
            )}
          </h1>
        </div>
        <p>Autumn term</p>
      </header>
      {next && <Next s={next} label={label} />}
      <section>
        <header className="section-row">
          <div>
            <p className="eyebrow">Current term</p>
            <h2>Seminar schedule</h2>
          </div>
          <p>{items.length} seminars</p>
        </header>
        {items.length ? (
          <Schedule items={items} nextId={next?.id} />
        ) : (
          <Empty
            title="Schedule coming soon"
            text="The 2026–27 programme has not yet been confirmed."
          />
        )}
      </section>
      <section className="organisers">
        <p className="eyebrow">Contact</p>
        <h2>Seminar organisers</h2>
        <p>Organisers to be confirmed</p>
      </section>
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <CalendarDays />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function All() {
  const [week, setWeek] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const end = endOfWeek(week, { weekStartsOn: 1 });
  const items = useMemo(
    () =>
      seminars.filter((s) => {
        const d = parseISO(s.date);
        return !isBefore(d, week) && !isAfter(d, end);
      }),
    [week, end],
  );
  const move = (n: number) => setWeek((w) => addWeeks(w, n));
  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);
  return (
    <section
      className="stack"
      aria-label="Weekly seminar browser"
    >
      <section className="week">
        <div className="week-nav">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => move(-1)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') move(-1);
              if (e.key === 'ArrowRight') move(1);
            }}
            aria-label="Show previous week"
          >
            <ArrowLeft />
          </Button>
          <h1 aria-live="polite">
            <span className="desktop-date">
              Seminars: {format(week, 'd MMMM')}–{format(end, 'd MMMM yyyy')}.
            </span>
            <span className="mobile-date">
              Seminars: {format(week, 'd MMM')}–{format(end, 'd MMM yyyy')}.
            </span>
          </h1>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => move(1)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') move(-1);
              if (e.key === 'ArrowRight') move(1);
            }}
            aria-label="Show next week"
          >
            <ArrowRight />
          </Button>
        </div>
      </section>
      {items.length ? (
        <div className="week-list">
          {items.map((s) => (
            <article key={s.id}>
              <time dateTime={s.date}>
                <strong>{format(parseISO(s.date), 'EEE')}</strong>
                <span>{format(parseISO(s.date), 'd MMM')}</span>
              </time>
              <div>
                <p className="tag">
                  {series.find((x) => x.id === s.series)?.label}
                </p>
                <h2>
                  <Speaker s={s} />
                </h2>
                <p className="paper">
                  <Title s={s} />
                </p>
              </div>
              <div className="meta">
                <span>
                  <Clock3 />
                  {s.time}
                </span>
                <span>
                  <MapPin />
                  {s.location}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No seminars scheduled"
          text="Choose another week to browse the 2026–27 programme."
        />
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="site">
      <header className="brand">
        <div>
          <b aria-label="UCL">UCL</b>
          <span>Economics Research</span>
        </div>
      </header>
      <SiteNav active="/" />
      <main>
        <Tabs defaultValue="all">
          <div className="tab-scroll">
            <TabsList variant="line" className="tabs">
              {series.map((x) => (
                <TabsTrigger key={x.id} value={x.id}>
                  {x.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="all">
            <All />
          </TabsContent>
          {series
            .filter(
              (x): x is { id: Exclude<SeriesId, 'all'>; label: string } =>
                x.id !== 'all',
            )
            .map((x) => (
              <TabsContent key={x.id} value={x.id}>
                <Series {...x} />
              </TabsContent>
            ))}
        </Tabs>
      </main>
      <footer>
        <div>
          <strong>UCL Economics Research</strong>
          <span>Prototype · 2026–27</span>
        </div>
        <a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a>
      </footer>
    </div>
  );
}
