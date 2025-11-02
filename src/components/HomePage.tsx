'use client';

import { RoomContext } from '@/context/RoomContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaChartBar,
  FaClock,
  FaGlobe,
  FaLock,
  FaPlay,
  FaRocket,
  FaUsers,
} from 'react-icons/fa';
import { useContextSelector } from 'use-context-selector';
import { Button } from './Button';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';

export function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const { room, user, isHydrated } = useContextSelector(RoomContext, context => ({
    room: context.room,
    user: context.user,
    isHydrated: context.isHydrated,
  }));

  // Redirecionar para /board se já estiver em uma sala
  useEffect(() => {
    if (isHydrated && room && user) {
      window.location.replace('/board');
    }
  }, [isHydrated, room, user, router]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMenuOpen(false);
  };

  const features = [
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Colaboração em Tempo Real',
      description:
        'Colabore com sua equipe em tempo real, votando simultaneamente nas estimativas.',
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: 'Timer Integrado',
      description: 'Cronômetro integrado para manter as discussões focadas e produtivas.',
    },
    {
      icon: <FaChartBar className="w-8 h-8" />,
      title: 'Métricas e Insights',
      description: 'Visualize estatísticas das votações e tome decisões mais assertivas.',
    },
    {
      icon: <FaGlobe className="w-8 h-8" />,
      title: '100% Online',
      description: 'Acesse de qualquer lugar, sem necessidade de instalação ou cadastro.',
    },
    {
      icon: <FaLock className="w-8 h-8" />,
      title: 'Privacidade Total',
      description:
        'Suas sessões são privadas e seguras. Dados não são armazenados permanentemente.',
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: 'Interface Moderna',
      description:
        'Design intuitivo e responsivo que funciona perfeitamente em qualquer dispositivo.',
    },
  ];

  const benefits = [
    {
      title: 'Estimativas Mais Precisas',
      description:
        'O Planning Poker elimina o viés de ancoragem, onde a primeira estimativa influencia as demais, resultando em avaliações mais precisas.',
      statistic: '40%',
      detail: 'mais precisão',
    },
    {
      title: 'Melhor Engajamento da Equipe',
      description:
        'Todos os membros participam ativamente do processo de estimativa, aumentando o comprometimento com os prazos.',
      statistic: '85%',
      detail: 'mais engajamento',
    },
    {
      title: 'Discussões Mais Focadas',
      description:
        'As divergências nas estimativas geram discussões valiosas que revelam diferentes perspectivas sobre o trabalho.',
      statistic: '60%',
      detail: 'menos retrabalho',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-25 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-400 dark:text-purple-400 font-sinera">
                Scrum Poker
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="cursor-pointer text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
              >
                Recursos
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="cursor-pointer text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="cursor-pointer text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
              >
                Benefícios
              </button>
              <Link href="/board">
                <Button className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Começar Agora
                </Button>
              </Link>
              <ThemeToggle className="bg-transparent! dark:bg-transparent! border-transparent! dark:border-transparent! shadow-none!" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection('features')}
                  className="cursor-pointer text-left text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
                >
                  Recursos
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="cursor-pointer text-left text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
                >
                  Como Funciona
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="cursor-pointer text-left text-xs sm:text-sm md:text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-purple-400 dark:hover:text-purple-400 transition-colors"
                >
                  Benefícios
                </button>
                <Link href="/board">
                  <Button className="w-full light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Começar Agora
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Hero Section */}
      <section className="relative bg-cards bg-cover bg-center bg-fixed bg-no-repeat py-20">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-sinera">
              Planning Poker
              <span className="block text-purple-400 dark:text-purple-400">Gratuito e Online</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              A ferramenta perfeita para estimativas ágeis. Colabore com sua equipe em tempo real,
              vote nas histórias e melhore a precisão das suas estimativas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/board">
                <Button className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-medium text-xs sm:text-sm transition-all transform hover:scale-105 flex items-center gap-2">
                  <FaPlay className="w-3 h-3 lg:w-4 lg:h-4" />
                  Criar Sala
                </Button>
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="cursor-pointer text-purple-400 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                Ver Como Funciona
                <FaArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher nosso Scrum Poker?
            </h2>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Desenvolvido por desenvolvedores, para desenvolvedores. Uma ferramenta simples e
              poderosa para suas estimativas ágeis. Encontre salas próximas usando nossa
              funcionalidade de busca por localização.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-purple-400 dark:text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você estará fazendo estimativas com sua equipe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-50 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400 dark:text-purple-400">1</span>
              </div>
              <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Crie uma Sala
              </h3>
              <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Clique em "Criar Sala" e configure sua sessão de planning poker em segundos.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400 dark:text-purple-400">2</span>
              </div>
              <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Convide sua Equipe
              </h3>
              <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Compartilhe o link da sala com seus colegas. Eles podem entrar sem cadastro.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Vote e Estime
              </h3>
              <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Discutam as histórias, votem simultaneamente e cheguem a um consenso rapidamente.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/board">
              <Button className="light:bg-linear-to-r from-purple-300 via-purple-400 to-purple-500 focus:ring-purple-600 focus:ring-1 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-medium text-xs sm:text-sm transition-all transform hover:scale-105">
                Começar Agora!
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Por que usar Planning Poker?
            </h2>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Descubra como o Planning Poker pode transformar suas estimativas e melhorar a
              colaboração da sua equipe ágil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="mb-6">
                  <div className="text-4xl font-bold text-purple-400 dark:text-purple-400 mb-2">
                    {benefit.statistic}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-medium">
                    {benefit.detail}
                  </div>
                </div>
                <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 light:bg-linear-to-r from-purple-400 to-purple-600 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-4">
            Pronto para revolucionar suas estimativas?
          </h2>
          <p className="text-xs sm:text-sm md:text-sm lg:text-base text-purple-50 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de equipes que já estão usando nossa ferramenta para melhorar suas
            planning meetings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/board">
              <Button className="bg-white text-purple-500 hover:bg-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-medium text-xs sm:text-sm transition-all transform hover:scale-105">
                Criar Primeira Sala
              </Button>
            </Link>
            <span className="text-purple-50 text-xs sm:text-sm md:text-sm lg:text-base">
              100% gratuito • Sem cadastro • Sem limites
            </span>
          </div>
        </div>
      </section>{' '}
      {/* Footer */}
      <Footer />
    </div>
  );
}
