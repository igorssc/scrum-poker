# 🎨 PWA Manifest Dinâmico com Temas

## 🎯 Funcionalidade

Sistema que adapta automaticamente as cores do PWA manifest baseado no tema do usuário (claro/escuro).

## 🔄 Como Funciona

### **1. Detecção de Tema:**

- ✅ Detecta classe `dark` no `html`
- ✅ Detecta preferência do sistema (`prefers-color-scheme`)
- ✅ Atualiza em tempo real quando tema muda

### **2. Cores Adaptáveis:**

**Light Mode:**

```json
{
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6"
}
```

**Dark Mode:**

```json
{
  "background_color": "#1f2937",
  "theme_color": "#a855f7"
}
```

### **3. Atualização Automática:**

- Observer monitora mudanças na classe `dark`
- MediaQuery escuta mudanças na preferência do sistema
- Manifest é re-injetado automaticamente

## 📁 Arquivos Criados

### **API Route:**

- `src/app/api/manifest/route.ts` - Gera manifest dinamicamente

### **Componente:**

- `src/components/DynamicManifest.tsx` - Detecta tema e atualiza manifest

### **Configuração:**

- `next.config.mjs` - Rewrite `/manifest.json` → `/api/manifest`

## 🎨 Cores por Tema

| Elemento       | Light Mode | Dark Mode | Uso                                    |
| -------------- | ---------- | --------- | -------------------------------------- |
| **Background** | `#ffffff`  | `#1f2937` | Cor de fundo do splash screen          |
| **Theme**      | `#8b5cf6`  | `#a855f7` | Barra de status e elementos do sistema |

## 🔧 Personalização

Para alterar as cores, edite em `src/app/api/manifest/route.ts`:

```typescript
const colors = {
  light: {
    background_color: '#ffffff', // Sua cor clara
    theme_color: '#8b5cf6', // Sua cor de tema clara
  },
  dark: {
    background_color: '#1f2937', // Sua cor escura
    theme_color: '#a855f7', // Sua cor de tema escura
  },
};
```

## 🚀 Vantagens

### **UX Melhorada:**

- ✅ Splash screen combina com o tema
- ✅ Barra de status harmonizada
- ✅ Transição suave entre temas

### **Nativo:**

- ✅ Usa APIs padrão do navegador
- ✅ Compatível com todos os PWA
- ✅ Sem dependências externas

### **Performance:**

- ✅ Cache de 1 hora na API
- ✅ Atualização apenas quando necessário
- ✅ Não impacta carregamento inicial

## 🧪 Como Testar

### **Desktop:**

1. Abra DevTools
2. Vá em Application > Manifest
3. Mude o tema da página
4. Recarregue a seção Manifest
5. Veja as cores atualizadas

### **Mobile:**

1. Instale o PWA
2. Mude tema do sistema
3. Feche e abra o app
4. Splash screen deve refletir o tema

## ⚠️ Notas Importantes

### **Cache:**

- Manifest é cacheado por 1 hora
- Para testes, use `?theme=dark` ou `?theme=light` na URL

### **Fallback:**

- Se detecção falhar, usa tema claro por padrão
- Manifest estático em `public/manifest.json` como backup

### **Compatibilidade:**

- Funciona em Chrome, Edge, Firefox
- iOS Safari: suporte limitado para theme-color dinâmico

---

**Sistema completo e funcional para PWA com temas adaptativos! 🎨✨**
