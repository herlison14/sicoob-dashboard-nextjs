# 🏦 Sicoob Dashboard - Integralização de Capital

Dashboard executivo para análise de integralização de capital em cooperativas. Desenvolvido com **Next.js 16**, **React 19**, **TypeScript** e **Tailwind CSS**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=flat-square)](https://sicoob-dashboard-nextjs.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square)](https://github.com/herlison14/sicoob-dashboard-nextjs)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org)

## 🎯 Funcionalidades

### 📊 Dashboard Principal
- 10+ indicadores-chave de desempenho (KPIs)
- Evolução do capital integralizado
- Status de conformidade
- Análise de distribuição por família

### 🛡️ Páginas Temáticas
- **Enquadrados**: Análise de cooperativas C1 blindadas e medianas
- **Desenquadrados**: Identificação de cooperativas com conformidade crítica
- **Concentração**: Top 10 maiores devedores
- **Análise de Risco**: Classificação de tendência
- **Exportar**: Geração de relatórios em PDF e Excel

### 📁 Upload de Dados
- Suporte a arquivos Excel (.xlsx)
- Parser automático de 3 abas
- Validação em tempo real
- Cache em sessão do navegador

### 🔐 Autenticação
- NextAuth v4 com Credentials Provider
- Login seguro
- Sessão gerenciada automaticamente

## 🚀 Deploy

**Status:** ✅ Ativo em Produção no Vercel

- **URL:** https://sicoob-dashboard-nextjs.vercel.app
- **Credenciais:** admin@sicoob.com.br / sicoob123

## 💻 Stack Tecnológico

- **Next.js 16** - Framework React com App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Gráficos
- **ExcelJS** - Parsing/Geração Excel
- **PDFKit** - Geração PDF
- **NextAuth v4** - Autenticação
- **Vercel** - Hosting

## 📋 Estrutura

```
app/
├── login/                    # 🔐 Autenticação
├── dashboard/
│   ├── page.tsx             # 📊 Dashboard
│   ├── enquadrados/
│   ├── desenquadrados/
│   ├── concentracao/
│   ├── analise-risco/
│   └── exportar/
├── api/
│   ├── auth/[...nextauth]   # NextAuth
│   ├── dados/               # Upload Excel
│   ├── pdf/                 # Gera PDF
│   └── excel/               # Gera Excel
└── components/
    ├── Sidebar.tsx
    ├── KPICard.tsx
    └── ...
```

## 🛠️ Instalação Local

```bash
# Clone
git clone https://github.com/herlison14/sicoob-dashboard-nextjs.git
cd sicoob-dashboard-nextjs

# Instale dependências
npm install

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build
npm run start
```

Acesse http://localhost:3000

## 📊 Como Usar

1. **Login**: Use admin@sicoob.com.br / sicoob123
2. **Upload**: Carregue arquivo Excel na página Dashboard
3. **Navegue**: Use sidebar para explorar 6 páginas
4. **Exporte**: Gere PDF ou Excel na página Exportar

## 🎨 Design

Cores Sicoob:
- Verde Escuro: #003641
- Verde Médio: #00524F
- Verde Claro: #7DB61C

## 🔐 Segurança

✅ NextAuth v4 com sessões seguras
✅ Proteção de rotas
✅ HTTPS via Vercel
✅ Environment variables para secrets

**Para Produção:**
- Integrar banco de dados real
- Usar provedor auth gerenciado (Clerk, Auth0)
- Implementar rate limiting
- Audit logging

## 📝 Changelog

### v1.0.0 (2026-05-14)
- ✅ Sidebar lateral com 6 páginas
- ✅ Login com NextAuth v4
- ✅ Upload e parsing de Excel
- ✅ Dashboard com 10+ KPIs
- ✅ Geração de PDF e Excel
- ✅ Deploy no Vercel

## 👤 Autor

**Herlison Santos**
- GitHub: [@herlison14](https://github.com/herlison14)
- Email: herlison14@gmail.com

## 📄 Licença

CONFIDENCIAL - Propriedade da Sicoob Cecremef

---

**Desenvolvido com ❤️ usando Next.js 16 e React 19**
