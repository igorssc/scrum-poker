# Prettier Configuration

Este projeto está configurado com Prettier para formatação automática de código.

## Comandos Disponíveis

- `npm run format` - Formata todos os arquivos do projeto
- `npm run format:check` - Verifica se os arquivos estão formatados corretamente
- `npm run format:staged` - Formata apenas arquivos staged no Git

## Configuração

### .prettierrc
Configurações de formatação:
- **Semi**: Adiciona ponto e vírgula no final das linhas
- **TrailingComma**: Vírgulas finais nos objetos/arrays (es5)
- **SingleQuote**: Usa aspas simples ao invés de duplas
- **PrintWidth**: Máximo de 100 caracteres por linha
- **TabWidth**: 2 espaços para indentação
- **BracketSpacing**: Espaços dentro de chaves `{ foo }`
- **ArrowParens**: Evita parênteses desnecessários em arrow functions

### .prettierignore
Arquivos/pastas ignorados:
- `node_modules/`
- `.next/`
- `build/`
- `dist/`
- `public/`
- Arquivos de configuração específicos

## Integração com VS Code

### Extensões Recomendadas
- **Prettier - Code formatter**: Formatação automática
- **ESLint**: Linting de código
- **Tailwind CSS IntelliSense**: Autocomplete para Tailwind

### Configurações Automáticas
- Formatação ao salvar habilitada
- Correção automática do ESLint ao salvar
- Organização automática de imports

## Como Usar

1. **Formatação Manual**: Execute `npm run format`
2. **Formatação Automática**: Salve o arquivo no VS Code (Ctrl/Cmd + S)
3. **Verificação**: Execute `npm run format:check` antes de commits

## Git Hooks (Opcional)

Para garantir que todo código commitado esteja formatado, você pode configurar um pre-commit hook:

```bash
# Instalar husky
npm install --save-dev husky lint-staged

# Configurar no package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```