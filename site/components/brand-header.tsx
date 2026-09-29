import { sitePath } from '@/lib/site-path';

export function BrandHeader() {
  return (
    <header className="brand">
      <div>
        <b aria-label="UCL">UCL</b>
        <span>Economics Research</span>
        <nav className="brand-links" aria-label="Related websites">
          <a href="https://ucleconbrief.co.uk" target="_blank" rel="noreferrer">Visit EconBrief</a>
          <a href={sitePath('/econ-brief/')}>Search EconBrief</a>
          <a href="https://www.ucl.ac.uk/social-historical-sciences/economics">Departmental webpage</a>
        </nav>
      </div>
    </header>
  );
}
