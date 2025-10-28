# 🃏 Scrum Poker - Planning Poker Online

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps/)

Uma aplicação moderna de **Planning Poker** para equipes ágeis, desenvolvida com Next.js 16, React 19 e TypeScript. Oferece salas colaborativas em tempo real, estimativas com cartas de Planning Poker, busca por proximidade geográfica e funciona como PWA (Progressive Web App).

![Scrum Poker Preview](https://scrumpoker.dev.br/og-image.png)

## ✨ Funcionalidades

- 🏠 **Salas Colaborativas** - Crie e participe de salas de estimativa em tempo real
- 🃏 **Cartas de Planning Poker** - Sistema completo de cartas para estimativa ágil
- 🌍 **Busca por Proximidade** - Encontre salas próximas geograficamente
- 🎨 **Temas Dinâmicos** - Modo claro/escuro com sincronização automática
- 📱 **PWA Completo** - Instale como app nativo no dispositivo
- 🔄 **Offline-First** - Funciona offline com Service Worker
- 🎯 **Real-time** - WebSocket para atualizações instantâneas
- 🎉 **Animações** - Confetti e animações suaves
- 📍 **QR Code** - Compartilhamento fácil de salas via QR Code
- 🔔 **Notificações** - Sistema de toast elegante e responsivo

## 🛠️ Tecnologias Principais

### **Frontend Core**
- **[Next.js 16.0.0](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://reactjs.org/)** - Biblioteca UI com hooks modernos
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática

### **Styling & UI**
- **[Tailwind CSS 4.1.16](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Merge de classes Tailwind
- **[Lucide React](https://lucide.dev/)** - Ícones SVG modernos
- **[React Icons](https://react-icons.github.io/react-icons/)** - Biblioteca de ícones

### **State Management & Data**
- **[TanStack Query 5.90.5](https://tanstack.com/query)** - Cache e sincronização de dados
- **[Zustand 5.0.8](https://zustand-demo.pmnd.rs/)** - State management minimalista
- **[use-context-selector](https://github.com/dai-shi/use-context-selector)** - Context otimizado

### **Real-time & Network**
- **[Socket.IO Client 4.8.1](https://socket.io/)** - WebSocket para comunicação real-time
- **[Axios 1.12.2](https://axios-http.com/)** - Cliente HTTP

### **PWA & Experience**
- **Service Worker** - Cache inteligente e funcionalidade offline
- **Web App Manifest** - Configuração PWA com temas dinâmicos
- **[React Hot Toast 2.6.0](https://react-hot-toast.com/)** - Sistema de notificações

### **UI Components**
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
  - `@radix-ui/react-popover` - Popovers acessíveis
  - `@radix-ui/react-tooltip` - Tooltips profissionais

### **Utilities**
- **[QRCode 1.5.4](https://github.com/soldair/node-qrcode)** - Geração de QR codes
- **[Canvas Confetti 1.9.4](https://github.com/catdad/canvas-confetti)** - Animações de confetti

### **Development Tools**
- **[ESLint 9.38.0](https://eslint.org/)** - Linting de código
- **[Prettier 3.6.2](https://prettier.io/)** - Formatação de código
- **[PostCSS 8.5.6](https://postcss.org/)** - Processamento CSS

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 18+
- npm, yarn, pnpm ou bun

### **Instalação**

```bash
# Clone o repositório
git clone https://github.com/igorssc/scrum-poker.git
cd scrum-poker

# Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install
```

### **Desenvolvimento**

```bash
# Execute o servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
pnpm dev

# O aplicativo estará disponível em http://localhost:3002
```

### **Produção**

```bash
# Build para produção
npm run build
npm run start

# ou
yarn build
yarn start
```

### **Scripts Disponíveis**

```bash
npm run dev          # Servidor de desenvolvimento (porta 3002)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de linting
npm run format       # Formatação do código
npm run format:check # Verificar formatação
```

## 🏗️ Arquitetura

### **Estrutura do Projeto**

```
src/
├── app/                    # App Router (Next.js 16)
│   ├── (game)/            # Grupo de rotas do jogo
│   ├── api/               # API Routes
│   │   └── manifest/      # PWA Manifest dinâmico
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── HomePage.tsx       # Página inicial
│   ├── RoomClient.tsx     # Cliente da sala
│   ├── ThemeColorManager.tsx  # Gerenciador de cores PWA
│   ├── DynamicManifest.tsx    # Manifest dinâmico
│   ├── PWAInstallBanner.tsx   # Banner de instalação PWA
│   └── ...               # Outros componentes
├── context/              # React Context
│   └── RoomContext.tsx   # Context da sala
├── hooks/                # Custom Hooks
│   ├── useWebsocket.ts   # Hook WebSocket
│   └── useTheme.ts       # Hook de tema
├── services/             # Serviços
│   └── api.ts           # Cliente API
├── utils/                # Utilitários
└── styles/               # Estilos globais
    └── globals.css
```

### **Principais Componentes**

- **`RoomClient`** - Gerencia toda a lógica da sala de poker
- **`ThemeColorManager`** - Controla cores do tema para PWA e mobile
- **`DynamicManifest`** - Atualiza manifest PWA baseado no tema
- **`PWAInstallBanner`** - Banner inteligente de instalação PWA
- **`ServiceWorkerRegistration`** - Registro e atualização do Service Worker

## 🔗 Backend API

A API backend está disponível em um repositório separado:

**🔗 [Scrum Poker API](https://github.com/igorssc/scrum-poker-api)**

### **Endpoints Principais**
- WebSocket para comunicação real-time
- Gerenciamento de salas e usuários
- Busca por proximidade geográfica
- Sistema de autenticação de salas

## 🌐 PWA (Progressive Web App)

### **Funcionalidades PWA**
- ✅ **Installable** - Pode ser instalado como app nativo
- ✅ **Offline-first** - Funciona offline com Service Worker
- ✅ **Responsive** - Otimizado para todos os dispositivos
- ✅ **Theme-aware** - Cores dinâmicas baseadas no tema
- ✅ **Fast** - Cache inteligente e pré-carregamento
- ✅ **Engaging** - Notificações e experiência nativa

### **Service Worker**
- Cache da página inicial para acesso offline
- Estratégia de fallback para navegação offline
- Atualização automática quando nova versão disponível

### **Manifest Dinâmico**
- Cores adaptáveis ao tema (claro/escuro)
- Ícones otimizados para diferentes dispositivos
- Screenshots para app stores

## 🎨 Sistema de Temas

### **Implementação Dual**
1. **Meta tags com media queries** - Para navegadores mobile nativos
2. **JavaScript dinâmico** - Para PWA e atualizações em tempo real

### **Cores do Tema**
- **Light Mode**: `#8b5cf6` (Purple 500)
- **Dark Mode**: `#374151` (Gray 700)

## 🔧 Configuração

### **Variáveis de Ambiente**

Crie um arquivo `.env.local`:

```env
# URL da API backend
NEXT_PUBLIC_API_URL=https://api.scrumpoker.dev.br

# URL base do frontend
NEXT_PUBLIC_BASE_URL=https://scrumpoker.dev.br

# Google Maps API (opcional, para busca geográfica)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **Configuração PWA**

O arquivo `next.config.mjs` inclui configurações PWA e otimizações.

## 📱 Compatibilidade

- ✅ **Desktop**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- ✅ **PWA**: Todos os navegadores com suporte PWA
- ✅ **Offline**: Funcionalidade básica offline

## 🚀 Deploy

### **Vercel (Recomendado)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/igorssc/scrum-poker)

### **Outras Plataformas**
- Netlify
- Railway
- Heroku
- Cloudflare Pages

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### **Padrões de Commit**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Igor Costa**
- GitHub: [@igorssc](https://github.com/igorssc)
- Twitter: [@igorssc](https://twitter.com/igorssc)
- LinkedIn: [Igor Costa](https://linkedin.com/in/igorssc)

## 🌟 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React incrível
- [Vercel](https://vercel.com/) - Plataforma de deploy
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [TanStack Query](https://tanstack.com/query) - Gerenciamento de estado servidor

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!**
