import { HomePage } from '../components/HomePage';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Scrum Poker',
  alternateName: 'Planning Poker Online',
  description:
    'Planning Poker para equipes ágeis. Ferramenta colaborativa para estimativa de tarefas usando metodologia Scrum.',
  url: 'https://scrumpoker.dev.br',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  permissions: 'Free to use',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Igor Costa',
    url: 'https://github.com/igorssc',
  },
  softwareVersion: '1.0',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
  featureList: [
    'Salas colaborativas em tempo real',
    'Estimativas usando cartas de Planning Poker',
    'Interface intuitiva e responsiva',
    'Sem necessidade de cadastro',
    'Suporte a temas personalizados',
    'Busca de salas por proximidade geográfica',
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
