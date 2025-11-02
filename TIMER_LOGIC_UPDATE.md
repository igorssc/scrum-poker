# Atualização da Lógica do Timer - Comportamento de Pausa/Retomada

## Resumo das Mudanças

Ajustada a lógica do timer para comportar-se corretamente ao pausar e retomar, mantendo o `start_timer` original e manipulando apenas o `stop_timer`.

### 🔧 **Nova Lógica de Estados:**

#### **Estados do Timer:**
1. **Nunca iniciado**: `start_timer = null`, `stop_timer = null`
2. **Rodando**: `start_timer = data_inicial`, `stop_timer = null` 
3. **Pausado**: `start_timer = data_inicial`, `stop_timer = data_da_pausa`

#### **Comportamento do Botão Toggle:**

| Estado Atual | Ação | Resultado |
|--------------|------|-----------|
| Nunca iniciado | Clique | `start_timer = agora`, `stop_timer = null` |
| Rodando | Clique | Mantém `start_timer`, `stop_timer = agora` |
| Pausado | Clique | Mantém `start_timer`, `stop_timer = null` |

### 💡 **Principais Melhorias:**

#### **1. Toggle Inteligente:**
```typescript
if (!startTimer) {
  // Primeira inicialização
  await updateRoom({
    start_timer: new Date().toISOString(),
    stop_timer: null,
  });
} else if (startTimer && stopTimer) {
  // Retomar timer pausado - remove apenas stop_timer
  await updateRoom({
    stop_timer: null,
  });
} else {
  // Pausar timer rodando
  await updateRoom({
    stop_timer: new Date().toISOString(),
  });
}
```

#### **2. Cálculo de Tempo Baseado no start_timer Original:**
- **Timer rodando**: Calcula `agora - start_timer` (tempo total desde o início)
- **Timer pausado**: Calcula `stop_timer - start_timer` (tempo até a pausa)
- **Timer resetado**: Ambos campos = `null`, tempo = 0

#### **3. Interval Simplificado:**
- Remove lógica de tempo acumulado desnecessária
- Calcula sempre baseado no `start_timer` original
- Mais preciso e simples de entender

### 🎯 **Benefícios:**

1. **Preservação do Tempo**: Quando pausado e retomado, o timer continua de onde parou
2. **Precisão**: Sempre calcula baseado no timestamp original do servidor
3. **Simplicidade**: Lógica mais clara e fácil de manter
4. **Consistência**: Todos os usuários veem exatamente o mesmo tempo
5. **Reset Completo**: Reset limpa ambos os campos corretamente

### 📊 **Exemplo de Fluxo:**

```
1. Usuário inicia timer:
   start_timer = "2025-11-02T10:00:00Z", stop_timer = null
   Timer mostra: 00:00, 00:01, 00:02... (rodando)

2. Usuário pausa aos 2 minutos:
   start_timer = "2025-11-02T10:00:00Z", stop_timer = "2025-11-02T10:02:00Z"
   Timer mostra: 02:00 (pausado)

3. Usuário retoma:
   start_timer = "2025-11-02T10:00:00Z", stop_timer = null
   Timer mostra: 02:05, 02:06... (continua de onde parou)

4. Usuário reseta:
   start_timer = null, stop_timer = null
   Timer mostra: 00:00 (zerado)
```

Agora o timer comporta-se exatamente como solicitado! 🎉