import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';

export const metadata: Metadata = { title: 'Clusters | Research Computing | UCL Economics Research' };
const clusters = [
  ['Myriad', 'Getting started, file transfer, interactive jobs, and Stata'],
  ['Kathleen', 'Coming soon — overview, access, login, storage, and jobs'],
  ['Condenser', 'Connect to a VM · Install software · Intel oneAPI and NAG · Create a VM (administrators)'],
  ['Computer Science computing services', 'Coming soon — available services and eligibility'],
] as const;

export default function Page() {
  return <ResearchComputingPage active="Clusters"><div className="research-computing-table-wrap"><table className="research-computing-table research-computing-clusters-table"><thead><tr><th>Cluster or service</th><th>Resources</th></tr></thead><tbody>{clusters.map(([cluster, resources]) => <tr key={cluster}><td><strong>{cluster}</strong></td><td>{resources}</td></tr>)}</tbody></table></div></ResearchComputingPage>;
}
