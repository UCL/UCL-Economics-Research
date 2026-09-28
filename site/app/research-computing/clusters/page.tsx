import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = { title: 'Clusters | Research Computing | UCL Economics Research' };
export default function Page() {
  return (
    <ResearchComputingPage active="Clusters">
      <div className="research-computing-table-wrap">
        <table className="research-computing-table research-computing-clusters-table">
          <thead><tr><th>Cluster or service</th><th>Resources</th></tr></thead>
          <tbody>
            <tr>
              <td><strong><a href="https://www.rc.ucl.ac.uk/docs/Clusters/Myriad" target="_blank" rel="noreferrer">Myriad</a></strong></td>
              <td><a href={sitePath('/research-computing/clusters/myriad/')}>Getting started, file transfer, interactive jobs</a></td>
            </tr>
            <tr>
              <td><strong><a href="https://www.rc.ucl.ac.uk/docs/Clusters/Kathleen" target="_blank" rel="noreferrer">Kathleen</a></strong></td>
              <td><a href={sitePath('/research-computing/clusters/myriad/')}>Getting started, file transfer, interactive jobs</a></td>
            </tr>
            <tr><td><strong>Condenser</strong></td><td>Connect to a VM · Install software · Intel oneAPI and NAG · Create a VM (administrators)</td></tr>
            <tr><td><strong>Computer Science computing services</strong></td><td>Coming soon — available services and eligibility</td></tr>
          </tbody>
        </table>
      </div>
    </ResearchComputingPage>
  );
}
