import type { Metadata } from 'next';
import { BrandHeader } from '@/components/brand-header';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Research Centres | UCL Economics Research',
  description: 'Research centres associated with the UCL Department of Economics.',
};

const centres = [
  {
    title: 'James M. and Cathleen D. Stone Centre on Wealth Concentration, Inequality and the Economy',
    href: 'https://www.stone-econ.org',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/Stone%20Centre.png.jpg?itok=iNPMia3A',
    alt: 'Stone Econ logo',
  },
  {
    title: 'Centre for Microdata Methods and Practice',
    href: 'https://cemmap.ac.uk/',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/CEMMAP.png.jpg?itok=_C5CyHs1',
    alt: 'cemmap logo',
  },
  {
    title: 'Centre for the Microeconomic Analysis of Public Policy (CPP)',
    href: 'https://ifs.org.uk/centre-microeconomic-analysis-public-policy',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/CPP.png.jpg?itok=5WW-TZwk',
    alt: 'Centre for the Microeconomic Analysis of Public Policy logo',
  },
  {
    title: 'Centre for Finance',
    href: 'https://centreforfinance.org/',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/CFF.png.jpg?itok=mazoAc-F',
    alt: 'Centre for Finance logo',
  },
  {
    title: 'Centre for Macroeconomics',
    href: 'https://www.centreformacroeconomics.ac.uk/Home.aspx',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/Macroeconomics.png.jpg?itok=CY9Z6Oe8',
    alt: 'Centre for Macroeconomics logo',
  },
  {
    title: 'Centre for Research and Analysis of Migration',
    href: 'https://www.cream-migration.org/',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/CReAM.png.jpg?itok=JjKW3Y45',
    alt: 'Centre for Research and Analysis of Migration logo',
  },
  {
    title: 'Centre for Teaching and Learning in Economics',
    href: 'https://ctale.org/',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/CTaLE.png.jpg?itok=cpIQCIGH',
    alt: 'Centre for Teaching and Learning in Economics logo',
  },
  {
    title: 'Microeconomic Insights',
    href: 'https://microeconomicinsights.org/',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/Microeconomic%20insights.png.jpg?itok=wGKPi2YP',
    alt: 'Microeconomic Insights logo',
  },
  {
    title: 'CORE Econ (Curriculum Open access Resources in Economics)',
    href: 'https://www.core-econ.org',
    logo: 'https://www.ucl.ac.uk/social-historical-sciences/sites/social_historical_sciences/files/styles/content_cards_mobile/public/2025-08/Coreecon.png.jpg?itok=BwdHAfC0',
    alt: 'CORE Econ logo',
  },
] as const;

export default function ResearchCentresPage() {
  return (
    <div className="site">
      <BrandHeader />
      <SiteNav active="/academic-partners" />
      <main>
        <header className="research-centres-heading">
          <h1>Research Centres</h1>
        </header>
        <section className="research-centres-grid" aria-label="UCL Economics research centres">
          {centres.map((centre) => (
            <article className="research-centre-card" key={centre.title}>
              <div className="research-centre-logo">
                <img src={centre.logo} alt={centre.alt} loading="lazy" />
              </div>
              <h2>
                <a href={centre.href} target="_blank" rel="noreferrer">
                  {centre.title}
                </a>
              </h2>
            </article>
          ))}
        </section>
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
