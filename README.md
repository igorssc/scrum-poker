# 🃏 Scrum Poker - Planning Poker Online

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps/)

A modern **Planning Poker** application for agile teams, built with Next.js 16, React 19, and TypeScript. Features real-time collaborative rooms, Planning Poker card estimation, geographic proximity search, and works as a PWA (Progressive Web App).

<img width="1139" height="429" alt="og-image" src="https://github.com/user-attachments/assets/945c70d8-d520-484a-ab86-849f72ff457b" />

## ✨ Features

- 🏠 **Collaborative Rooms** - Create and join real-time estimation rooms
- 🃏 **Planning Poker Cards** - Complete card system for agile estimation
- 🌍 **Proximity Search** - Find nearby rooms geographically
- 🎨 **Dynamic Themes** - Light/dark mode with automatic sync
- 📱 **Full PWA** - Install as native app on devices
- 🔄 **Offline-First** - Works offline with Service Worker
- 🎯 **Real-time** - WebSocket for instant updates
- 🎉 **Animations** - Confetti and smooth animations
- 📍 **QR Code** - Easy room sharing via QR Code
- 🔔 **Notifications** - Elegant and responsive toast system

## 🛠️ Main Technologies

### **Frontend Core**

- **[Next.js 16.0.0](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://reactjs.org/)** - UI library with modern hooks
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static typing

### **Styling & UI**

- **[Tailwind CSS 4.1.16](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes
- **[Lucide React](https://lucide.dev/)** - Modern SVG icons
- **[React Icons](https://react-icons.github.io/react-icons/)** - Icon library

### **State Management & Data**

- **[TanStack Query 5.90.5](https://tanstack.com/query)** - Data caching and synchronization
- **[Zustand 5.0.8](https://zustand-demo.pmnd.rs/)** - Minimalist state management
- **[use-context-selector](https://github.com/dai-shi/use-context-selector)** - Optimized Context

### **Real-time & Network**

- **[Socket.IO Client 4.8.1](https://socket.io/)** - WebSocket for real-time communication
- **[Axios 1.12.2](https://axios-http.com/)** - HTTP client

### **PWA & Experience**

- **Service Worker** - Smart caching and offline functionality
- **Web App Manifest** - PWA configuration with dynamic themes
- **[React Hot Toast 2.6.0](https://react-hot-toast.com/)** - Notification system

### **UI Components**

- **[Radix UI](https://www.radix-ui.com/)** - Accessible components
  - `@radix-ui/react-popover` - Accessible popovers
  - `@radix-ui/react-tooltip` - Professional tooltips

### **Utilities**

- **[QRCode 1.5.4](https://github.com/soldair/node-qrcode)** - QR code generation
- **[Canvas Confetti 1.9.4](https://github.com/catdad/canvas-confetti)** - Confetti animations

### **Development Tools**

- **[ESLint 9.38.0](https://eslint.org/)** - Code linting
- **[Prettier 3.6.2](https://prettier.io/)** - Code formatting
- **[PostCSS 8.5.6](https://postcss.org/)** - CSS processing

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- npm, yarn, pnpm or bun

### **Installation**

```bash
# Clone the repository
git clone https://github.com/igorssc/scrum-poker.git
cd scrum-poker

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### **Development**

```bash
# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev

# The app will be available at http://localhost:3002
```

### **Production**

```bash
# Build for production
npm run build
npm run start

# or
yarn build
yarn start
```

### **Available Scripts**

```bash
npm run dev          # Development server (port 3002)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting check
npm run format       # Code formatting
npm run format:check # Check formatting
```

## 🏗️ Architecture

### **Project Structure**

```
src/
├── app/                    # App Router (Next.js 16)
│   ├── (game)/            # Game routes group
│   ├── api/               # API Routes
│   │   └── manifest/      # Dynamic PWA Manifest
│   ├── layout.tsx         # Main layout
│   └── page.tsx           # Home page
├── components/            # React Components
│   ├── HomePage.tsx       # Home page
│   ├── RoomClient.tsx     # Room client
│   ├── ThemeColorManager.tsx  # PWA color manager
│   ├── DynamicManifest.tsx    # Dynamic manifest
│   ├── PWAInstallBanner.tsx   # PWA install banner
│   └── ...               # Other components
├── context/              # React Context
│   └── RoomContext.tsx   # Room context
├── hooks/                # Custom Hooks
│   ├── useWebsocket.ts   # WebSocket hook
│   └── useTheme.ts       # Theme hook
├── services/             # Services
│   └── api.ts           # API client
├── utils/                # Utilities
└── styles/               # Global styles
    └── globals.css
```

### **Main Components**

- **`RoomClient`** - Manages all poker room logic
- **`ThemeColorManager`** - Controls theme colors for PWA and mobile
- **`DynamicManifest`** - Updates PWA manifest based on theme
- **`PWAInstallBanner`** - Smart PWA installation banner
- **`ServiceWorkerRegistration`** - Service Worker registration and updates

## 🔗 Backend API

The backend API is available in a separate repository:

**🔗 [Scrum Poker API](https://github.com/igorssc/scrum-poker-api)**

### **Main Endpoints**

- WebSocket for real-time communication
- Room and user management
- Geographic proximity search
- Room authentication system

## 🌐 PWA (Progressive Web App)

### **PWA Features**

- ✅ **Installable** - Can be installed as native app
- ✅ **Offline-first** - Works offline with Service Worker
- ✅ **Responsive** - Optimized for all devices
- ✅ **Theme-aware** - Dynamic colors based on theme
- ✅ **Fast** - Smart caching and pre-loading
- ✅ **Engaging** - Notifications and native experience

### **Service Worker**

- Home page caching for offline access
- Fallback strategy for offline navigation
- Automatic updates when new version available

### **Dynamic Manifest**

- Theme-adaptive colors (light/dark)
- Icons optimized for different devices
- Screenshots for app stores

## 🎨 Theme System

### **Dual Implementation**

1. **Meta tags with media queries** - For native mobile browsers
2. **Dynamic JavaScript** - For PWA and real-time updates

### **Theme Colors**

- **Light Mode**: `#8b5cf6` (Purple 500)
- **Dark Mode**: `#374151` (Gray 700)

## 🔧 Configuration

### **Environment Variables**

Create a `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.scrumpoker.dev.br

# Frontend base URL
NEXT_PUBLIC_BASE_URL=https://scrumpoker.dev.br

# Google Maps API (optional, for geographic search)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **PWA Configuration**

The `next.config.mjs` file includes PWA configurations and optimizations.

## 📱 Compatibility

- ✅ **Desktop**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- ✅ **PWA**: All browsers with PWA support
- ✅ **Offline**: Basic offline functionality

## 🚀 Deploy

### **Vercel (Recommended)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/igorssc/scrum-poker)

### **Other Platforms**

- Netlify
- Railway
- Heroku
- Cloudflare Pages

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add: new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### **Commit Patterns**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Refactoring
- `test:` - Tests

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Igor Costa**

- GitHub: [@igorssc](https://github.com/igorssc)
- LinkedIn: [Igor Costa](https://linkedin.com/in/igorssc)

## 🌟 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) - Server state management

---

**⭐ If this project helped you, consider giving it a star on the repository!**
