import type { Metadata } from 'next';
import eventData from '@/data/events.json';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Events | UCL Economics Research',
  description: 'Conferences and special research events at UCL Economics in 2026–27.',
};

type Event = {
  id: string;
  type: string;
  title: string;
  eventUrl: string;
  dates: string;
  startDate: string;
  endDate: string;
  location: string;
  locationUrl: string;
  organisers: string[];
  bookingUrl: string;
};

const events = eventData as Event[];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export default function EventsPage() {
  return (
    <div className="site">
      <header className="brand">
        <div>
          <b aria-label="UCL">UCL</b>
          <span>Economics Research</span>
        </div>
      </header>
      <SiteNav active="/events" />
      <main>
        <header className="events-heading">
          <p className="eyebrow">2026–27 academic year</p>
          <h1>Events</h1>
          <p>Conferences, lectures and other special research events.</p>
        </header>

        <section className="events-list" aria-label="Events in 2026–27">
          {events.map((event) => (
            <article className="event-item" key={event.id}>
              <p className="event-type">{event.type}</p>
              <div className="event-content">
                <h2>
                  {event.eventUrl ? (
                    <ExternalLink href={event.eventUrl}>{event.title}</ExternalLink>
                  ) : event.title}
                </h2>
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
