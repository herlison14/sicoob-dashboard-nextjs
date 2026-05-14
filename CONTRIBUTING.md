# Contribuindo para Sicoob Dashboard

Obrigado por considerar contribuir para este projeto! 🙏

## Como Contribuir

### 1. Fork o Repositório
```bash
git clone https://github.com/herlison14/sicoob-dashboard-nextjs.git
cd sicoob-dashboard-nextjs
```

### 2. Crie uma Branch para Sua Feature
```bash
git checkout -b feature/minha-feature
```

### 3. Faça Commits Claros
```bash
git commit -m "feat: descrição clara da mudança"
```

### 4. Push para Sua Branch
```bash
git push origin feature/minha-feature
```

### 5. Abra um Pull Request
- Descreva as mudanças claramente
- Referencie issues relacionadas
- Inclua screenshots se aplicável

## Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudanças lógicas)
- `refactor:` Refatoração de código
- `perf:` Melhorias de performance
- `test:` Testes

Exemplo:
```
feat: adicionar exportação em CSV
fix: corrigir cálculo de KPI
docs: atualizar instruções de setup
```

## Guidelines de Código

### TypeScript
- Use tipos explícitos
- Evite `any`
- Documente tipos complexos

### React
- Use functional components
- Use hooks (useState, useContext, etc)
- Componentize reutilizável

### Styling
- Use Tailwind CSS
- Siga as cores Sicoob
- Mobile-first design

### API Routes
- Validação de input
- Error handling robusto
- Logs apropriados

## Setup Local

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Testes

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Build

```bash
npm run build
npm run start
```

## Issues

Ao reportar issues:
- Descreva claramente o problema
- Incluir steps to reproduce
- Sistema operacional e navegador
- Screenshots/logs se possível

## Dúvidas?

Abra uma discussion no GitHub ou entre em contato.

---

**Obrigado por contribuir! 🎉**
