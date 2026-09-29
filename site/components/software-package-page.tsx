import { ResearchComputingPage } from '@/components/research-computing-page';
import { sitePath } from '@/lib/site-path';

export function SoftwarePackagePage({ name, slug }: { name: string; slug: string }) {
  const resources = [
    ['Installation and licence', 'installation'],
    [`Using ${name}`, 'using'],
    ['UCL code library', 'code-library'],
  ] as const;

  return (
    <ResearchComputingPage active="Software" heading={name}>
      <p>Choose a guide below.</p>
      <ul className="software-resource-list">
        {resources.map(([label, path]) => (
          <li key={path}><a href={sitePath(`/research-computing/software/${slug}/${path}/`)}>{label}</a></li>
        ))}
      </ul>
    </ResearchComputingPage>
  );
}
