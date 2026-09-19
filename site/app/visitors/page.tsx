import type { Metadata } from 'next';
import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';
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
import { BrandHeader } from '@/components/brand-header';
import visitorData from '@/data/visitors.json';

export const metadata: Metadata = {
  title: 'Visitors | UCL Economics Research',
  description: 'Academic visitors to UCL Economics during 2026–27.',
};

type Visitor = {
  name: string;
  institution: string;
  webpage: string;
  email: string;
  startDate: string;
  endDate: string;
  dateLabel?: string;
  office: string;
};

const visitors = visitorData as Visitor[];
const workingDays = (visitor: Visitor) => {
  if (!visitor.startDate || !visitor.endDate) return 0;
  return eachDayOfInterval({ start: parseISO(visitor.startDate), end: parseISO(visitor.endDate) })
    .filter((date) => !isWeekend(date)).length;
};
const byStartDate = (a: Visitor, b: Visitor) =>
  a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name);
const longTermVisitors = visitors
  .filter((visitor) => workingDays(visitor) > 3)
  .sort(byStartDate);
const shortTermVisitors = visitors
  .filter((visitor) => workingDays(visitor) <= 3)
  .sort(byStartDate);

function VisitorsTable({ items, roomNumberOnly = false }: { items: Visitor[]; roomNumberOnly?: boolean }) {
  if (!items.length) {
    return <div className="visitors-empty">No visitors currently listed.</div>;
  }

  return (
    <div className="table-shell visitors-table-shell">
      <Table className="visitors-table">
        <TableHeader>
          <TableRow>
            {['Name', 'Visit dates', 'Office'].map((heading) => (
              <TableHead key={heading}>{heading}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((visitor) => {
            const office = roomNumberOnly
              ? visitor.office.replace(/^Drayton House\s*/i, '')
              : visitor.office;
            return <TableRow key={`${visitor.name}-${visitor.startDate}`}>
              <TableCell data-label="Name">
                <span className="visitor-name">
                  {visitor.webpage ? (
                    <a className="visitor-webpage" href={visitor.webpage} target="_blank" rel="noreferrer">{visitor.name}</a>
                  ) : (
                    <strong>{visitor.name}</strong>
                  )}
                  <span>{visitor.institution}</span>
                  {visitor.email ? <a className="visitor-email" href={`mailto:${visitor.email}`}>{visitor.email}</a> : null}
                </span>
              </TableCell>
              <TableCell data-label="Visit dates">
                {visitor.dateLabel ? (
                  visitor.dateLabel
                ) : visitor.startDate === visitor.endDate ? (
                  <time dateTime={visitor.startDate}>{format(parseISO(visitor.startDate), 'd MMM yyyy')}</time>
                ) : (
                  <span>
                    <time dateTime={visitor.startDate}>{format(parseISO(visitor.startDate), 'd MMM yyyy')}</time>
                    {' – '}
                    <time dateTime={visitor.endDate}>{format(parseISO(visitor.endDate), 'd MMM yyyy')}</time>
                  </span>
                )}
              </TableCell>
              <TableCell data-label="Office">{office || <span className="not-available">—</span>}</TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function VisitorsPage() {
  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/visitors" />
      <main>
        <header className="visitors-heading">
          <div>
            <p className="eyebrow">2026–27 academic year</p>
            <h1>Visitors</h1>
          </div>
          <p>{visitors.length} expected visitors</p>
        </header>
        <Tabs defaultValue="short-term" className="visitor-tabs">
          <TabsList variant="line" className="tabs">
            <TabsTrigger value="short-term">Short-term visitors</TabsTrigger>
            <TabsTrigger value="long-term">Long-term visitors</TabsTrigger>
          </TabsList>
          <TabsContent value="short-term"><VisitorsTable items={shortTermVisitors} /></TabsContent>
          <TabsContent value="long-term"><VisitorsTable items={longTermVisitors} roomNumberOnly /></TabsContent>
        </Tabs>
      </main>
      <footer>
        <div>
          <strong>UCL Economics Research</strong>
          <span>2026–27</span>
        </div>
        <a href="mailto:l.nesheim@ucl.ac.uk">Contact Professor Lars Nesheim</a>
      </footer>
    </div>
  );
}
