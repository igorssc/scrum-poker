# Implementação do Timer Sincronizado com Servidor

## Resumo das Alterações

### 1. Protocolo Room Atualizado
- **Arquivo**: `src/protocols/Room.ts`
- **Adicionado**: Campos `start_timer?: string | null` e `stop_timer?: string | null`
- **Propósito**: Permitir armazenamento das datas de início e parada do timer no servidor

### 2. Hook useServerTimer Criado
- **Arquivo**: `src/hooks/useServerTimer.ts`
- **Funcionalidade**: 
  - Sincroniza timer local com dados do servidor (`cachedRoomData.start_timer/stop_timer`)
  - Calcula tempo decorrido baseado na diferença entre data atual e `start_timer`
  - Gerencia estados de pausa usando `stop_timer`
  - Chama `updateRoom()` para sincronizar mudanças com o servidor

### 3. NavBar Atualizado
- **Arquivo**: `src/components/NavBar.tsx`
- **Mudança**: Substituído `useTimer` por `useServerTimer`
- **Resultado**: Timer agora persiste entre refreshes e é sincronizado entre usuários

## Como Funciona

### Estados do Timer:
1. **Timer Resetado/Não Iniciado**: `start_timer = null`, `stop_timer = null`
2. **Timer Rodando**: `start_timer = data_de_inicio`, `stop_timer = null`
3. **Timer Pausado**: `start_timer = data_de_inicio`, `stop_timer = data_da_pausa`

### Lógica de Cálculo:
- **Timer Rodando**: `tempo_atual = agora - start_timer`
- **Timer Pausado**: `tempo_pausado = stop_timer - start_timer`
- **Timer Resetado**: `tempo = 0`

### Ações:
- **Play/Pause**: Chama `updateRoom()` para atualizar `start_timer` ou `stop_timer`
- **Reset**: Chama `updateRoom()` para limpar ambos os campos (`null`)

## Benefícios

1. **Persistência**: Timer mantém estado entre refreshes da página
2. **Sincronização**: Todos os usuários veem o mesmo tempo
3. **Servidor Autoritativo**: Estado do timer é controlado pelo servidor
4. **Tempo Real**: Atualização local combina com dados do servidor

## Testagem Recomendada

1. Iniciar timer e verificar se incrementa
2. Pausar e verificar se mantém tempo
3. Refresh da página e verificar persistência
4. Múltiplos usuários vendo mesmo tempo
5. Reset do timer limpando estado