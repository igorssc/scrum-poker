# 📱 PWA Install Banner - Sistema Completo

## 🎯 Funcionalidade

Sistema inteligente que detecta se o usuário pode instalar o app como PWA e exibe um banner elegante com as seguintes regras:

### **Quando o Banner Aparece:**

- ✅ Primeira visita ao site
- ✅ Após 1 dia se foi dispensado com "Agora não" ou fechado com X
- ✅ Apenas se o PWA é instalável (evento `beforeinstallprompt`)
- ✅ Apenas se não está já instalado

### **Quando NÃO Aparece:**

- ❌ Se já está instalado como PWA
- ❌ Se o usuário instalou (removido permanentemente)
- ❌ Se foi dispensado há menos de 1 dia
- ❌ Se o browser não suporta PWA

## 🔧 Componentes Criados

### **1. Hooks:**

- `usePWAInstall.ts` - Detecta instalabilidade e controla prompt
- `usePWABanner.ts` - Gerencia estado e timing do banner

### **2. Componente:**

- `PWAInstallBanner.tsx` - Banner visual com botões

### **3. Estilos:**

- Animação `slide-up` adicionada ao globals.css

## 🎨 Design do Banner

### **Visual:**

- 📍 Posição: Fixed bottom (como banner de cookies)
- 🎨 Estilo: Card elegante com bordas arredondadas
- 🌙 Suporte: Light/Dark mode
- 📱 Responsivo: Máx 320px width, centralizado

### **Conteúdo:**

- 🏷️ Título: "Instalar Scrum Poker"
- 📝 Descrição: Benefícios da instalação
- 🔽 Ícone: Download/Cloud
- ⚡ Botões: "Instalar" e "Agora não"
- ❌ Fechar: X no canto superior direito

## 🛠️ Como Funciona

### **Detecção de Instalabilidade:**

```javascript
// Escuta o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); // Previne banner automático
  setDeferredPrompt(e); // Salva para usar depois
});
```

### **Detecção de PWA Instalado:**

```javascript
// Múltiplos métodos para detectar
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isIOSStandalone = window.navigator.standalone === true;
```

### **Controle de Timing:**

```javascript
// LocalStorage com timestamp
const bannerState = {
  dismissed: true,
  dismissedAt: Date.now(),
  permanentlyDismissed: false,
};
```

## 📋 Estados do Banner

### **1. Primeira Visita:**

- Mostra o banner imediatamente (se instalável)

### **2. "Agora não":**

- Salva timestamp no localStorage
- Remove banner por 1 dia
- Após 1 dia: mostra novamente

### **3. "Instalar":**

- Chama `deferredPrompt.prompt()`
- Se aceito: remove permanentemente
- Se cancelado: banner **continua visível** (não remove)

### **4. Fechar (X):**

- Mesmo comportamento que "Agora não"
- Remove por 1 dia

## 🚀 Próximos Passos

Para completar o PWA, crie os ícones:

### **Ícones Necessários:**

- `public/favicon.ico` (48x48px)
- `public/icon-192x192.png` (192x192px)
- `public/icon-512x512.png` (512x512px)

### **Screenshots (Opcional):**

- `public/screenshot-wide.png` (1280x720px)
- `public/screenshot-mobile.png` (390x844px)

## 🧪 Como Testar

### **Chrome (Desktop):**

1. Abra DevTools > Application > Manifest
2. Verifique se não há erros
3. Clique "Add to homescreen" para simular

### **Chrome (Mobile):**

1. Acesse via HTTPS
2. O banner do browser aparecerá
3. Nosso banner customizado deve aparecer

### **iOS Safari:**

- PWA funciona, mas sem `beforeinstallprompt`
- Banner não aparecerá (comportamento esperado)
- Usuário deve instalar manualmente via "Adicionar à Tela de Início"

## 🔍 Debugging

### **Banner não aparece:**

- Verificar se está em HTTPS
- Verificar manifest.json válido
- Verificar se não está já instalado
- Verificar localStorage para estado do banner

### **Instalação não funciona:**

- Verificar se `deferredPrompt` existe
- Verificar console para erros
- Verificar se PWA atende critérios mínimos

---

**Sistema completo e pronto para produção! 🎉**
