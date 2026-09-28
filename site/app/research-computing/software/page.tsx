import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = { title: 'Software | Research Computing | UCL Economics Research' };

const software = [
  ['MATLAB', 'matlab'],
  ['Julia', 'julia'],
  ['Stata', 'stata'],
  ['R and RStudio', 'r-rstudio'],
  ['Python', 'python'],
] as const;

export default function Page() {
  return (
    <ResearchComputingPage active="Software">
      <p>Installation, licence, and startup guidance for commonly used research software.</p>
      <div className="research-computing-table-wrap">
        <table className="research-computing-table">
          <thead><tr><th>Software</th><th>Resources</th></tr></thead>
          <tbody>
            {software.map(([name, slug]) => (
              <tr key={slug}>
                <td><strong>{name}</strong></td>
                <td><a href={sitePath(`/research-computing/software/${slug}/`)}>Myriad, Condenser, Windows, and macOS</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResearchComputingPage>
  );
}
