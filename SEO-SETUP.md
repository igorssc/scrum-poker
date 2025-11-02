# Scrum Poker - SEO Setup

## 📊 Google Search Console - Como Indexar no Google

### 1. **Adicionar Propriedade no Google Search Console**

1. Acesse [Google Search Console](https://search.google.com/search-console/)
2. Clique em "Adicionar propriedade"
3. Escolha "Prefixo de URL" e digite: `https://scrumpoker.dev.br`

### 2. **Verificar Propriedade**

**Método recomendado - Meta tag HTML:**

1. O Google fornecerá um código como: `<meta name="google-site-verification" content="ABC123...">`
2. Substitua o valor em `src/app/layout.tsx` na linha:
   ```typescript
   verification: {
     google: 'ABC123...', // Substituir pelo código real
   },
   ```

### 3. **Submeter Sitemap**

1. No Google Search Console, vá para "Sitemaps"
2. Adicione: `https://scrumpoker.dev.br/sitemap.xml`
3. Clique em "Enviar"

### 4. **Solicitar Indexação**

1. No Google Search Console, vá para "Inspeção de URL"
2. Digite: `https://scrumpoker.dev.br`
3. Clique em "Solicitar indexação"

## 🗂️ Arquivos Criados para SEO

### **Sitemap e Robots**

- ✅ `public/sitemap.xml` - Sitemap estático
- ✅ `src/app/api/sitemap/route.ts` - Sitemap dinâmico
- ✅ `public/robots.txt` - Instrução para crawlers

### **SEO Metadata**

- ✅ `src/app/layout.tsx` - Meta tags otimizadas
- ✅ `src/app/page.tsx` - JSON-LD structured data
- ✅ `public/manifest.json` - PWA manifest

### **Configuração**

- ✅ `next.config.mjs` - Headers de segurança e rewrites

## 🎯 Metas Tags Implementadas

### **Básicas**

- Title otimizado com keywords
- Description atrativa
- Keywords relevantes
- Canonical URL

### **Open Graph (Facebook/LinkedIn)**

- og:title, og:description, og:url
- og:type, og:locale, og:site_name

### **Twitter Cards**

- twitter:card, twitter:title
- twitter:description, twitter:creator

### **Structured Data (JSON-LD)**

- WebApplication schema
- Features, ratings, author
- Pricing information

## 🚀 Próximos Passos

1. **Deploy da aplicação** com as mudanças
2. **Obter código de verificação** do Google Search Console
3. **Atualizar** o código de verificação no layout.tsx
4. **Submeter sitemap** no Google Search Console
5. **Solicitar indexação** da página principal

## 📈 Monitoramento

Após configuração, monitore:

- **Cobertura do índice** - quantas páginas foram indexadas
- **Desempenho** - impressões, cliques, CTR
- **Problemas de usabilidade móvel**
- **Core Web Vitals** - métricas de performance

## 🎨 Icons Necessários

Para completar o PWA, adicione os ícones:

- `public/icon-192x192.png` (192x192px)
- `public/icon-512x512.png` (512x512px)
- `public/favicon.ico` (32x32px)

---

**Desenvolvido por Igor Costa** - [GitHub](https://github.com/igorssc)
