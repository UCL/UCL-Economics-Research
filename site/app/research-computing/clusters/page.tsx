import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';

export const metadata: Metadata = { title: 'Clusters | Research Computing | UCL Economics Research' };
const clusters = [
  ['Myriad', 'https://www.rc.ucl.ac.uk/docs/Clusters/Myriad', 'Getting started, file transfer, interactive jobs, and Stata'],
  ['Kathleen', 'https://www.rc.ucl.ac.uk/docs/Clusters/Kathleen', 'Coming soon — overview, access, login, storage, and jobs'],
  ['Condenser', null, 'Connect to a VM · Install software · Intel oneAPI and NAG · Create a VM (administrators)'],
  ['Computer Science computing services', null, 'Coming soon — available services and eligibility'],
] as const;

export default function Page() {
  return <ResearchComputingPage active="Clusters"><div className="research-computing-table-wrap"><table className="research-computing-table research-computing-clusters-table"><thead><tr><th>Cluster or service</th><th>Resources</th></tr></thead><tbody>{clusters.map(([cluster, href, resources]) => <tr key={cluster}><td><strong>{href ? <a href={href} target="_blank" rel="noreferrer">{cluster}</a> : cluster}</strong></td><td>{resources}</td></tr>)}</tbody></table></div></ResearchComputingPage>;
}
