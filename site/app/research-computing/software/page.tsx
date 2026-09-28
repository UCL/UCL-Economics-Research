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
      <p>Installation guidance, practical introductions, and UCL code resources for commonly used research software.</p>
      <div className="research-computing-table-wrap">
        <table className="research-computing-table">
          <thead><tr><th>Software</th><th>Installation</th><th>Using the software</th><th>UCL code library</th></tr></thead>
          <tbody>
            {software.map(([name, slug]) => (
              <tr key={slug}>
                <td><strong><a href={sitePath(`/research-computing/software/${slug}/`)}>{name}</a></strong></td>
                <td><a href={sitePath(`/research-computing/software/${slug}/installation/`)}>Installation and licence</a></td>
                <td><a href={sitePath(`/research-computing/software/${slug}/using/`)}>Using {name}</a></td>
                <td><a href={sitePath(`/research-computing/software/${slug}/code-library/`)}>UCL code library</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResearchComputingPage>
  );
}
