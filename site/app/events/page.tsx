import type { Metadata } from 'next';
import eventData from '@/data/events.json';
import { SiteNav } from '@/components/site-nav';
import { BrandHeader } from '@/components/brand-header';

export const metadata: Metadata = {
  title: 'Events | UCL Economics Research',
  description: 'Conferences, lectures and special research events at UCL Economics.',
};

type Event = {
  id: string;
  type: string;
  title: string;
  speaker?: string;
  eventUrl: string;
  dates: string;
  startDate: string;
  endDate: string;
  location: string;
  locationUrl: string;
  organisers: string[];
  bookingUrl: string;
};

const monthNumbers: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  spring: 2,
  summer: 5,
  autumn: 8,
  winter: 11,
};

function eventSortKey(event: Event) {
  if (event.startDate) return Date.parse(`${event.startDate}T00:00:00Z`);

  const approximateDate = event.dates.toLowerCase().match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|spring|summer|autumn|winter)\s+(\d{4})\b/,
  );
  if (approximateDate) {
    return Date.UTC(Number(approximateDate[2]), monthNumbers[approximateDate[1]], 1);
  }

  return Number.POSITIVE_INFINITY;
}

const events = (eventData as Event[])
  .map((event, sourceIndex) => ({ event, sourceIndex }))
  .sort((a, b) => eventSortKey(a.event) - eventSortKey(b.event) || a.sourceIndex - b.sourceIndex)
  .map(({ event }) => event);

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export default function EventsPage() {
  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/events" />
      <main>
        <header className="events-heading">
          <p className="eyebrow">Upcoming programme</p>
          <h1>Events</h1>
          <p>Conferences, lectures and other special research events.</p>
        </header>

        <section className="events-list" aria-label="Research events">
          {events.map((event) => (
            <article className="event-item" key={event.id}>
              <p className="event-type">{event.type}</p>
              <div className="event-content">
                <h2>
                  {event.eventUrl ? (
                    <ExternalLink href={event.eventUrl}>{event.title}</ExternalLink>
                  ) : event.title}
                </h2>
                {event.speaker && <p>{event.speaker}</p>}
                <dl className="event-details">
                  <div>
                    <dt>Dates</dt>
                    <dd>{event.dates}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {event.locationUrl ? (
                        <ExternalLink href={event.locationUrl}>{event.location}</ExternalLink>
                      ) : event.location}
                    </dd>
                  </div>
                  <div>
                    <dt>Organisers</dt>
                    <dd>{event.organisers.join(', ')}</dd>
                  </div>
                  {event.bookingUrl && (
                    <div>
                      <dt>Booking</dt>
                      <dd><ExternalLink href={event.bookingUrl}>Book a place</ExternalLink></dd>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          ))}
        </section>
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
