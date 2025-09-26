# TV Show Tracker Frontend

Este diretório contém a aplicação web frontend da TV Show Tracker, desenvolvida com React.

## 🚀 Funcionalidades

- **Registo e Login**: Interface de utilizador para autenticação segura.
- **Listagem de Séries de TV**: Exibe séries com opções de filtro, ordenação e paginação.
- **Detalhes de Séries**: Páginas dedicadas com informações completas sobre cada série e seus episódios.
- **Perfis de Atores**: Visualização de perfis de atores e as séries em que participaram.
- **Gestão de Favoritos**: Adicionar e remover séries da lista de favoritos do utilizador.
- **Recomendações Personalizadas**: Exibe recomendações de séries baseadas nas preferências do utilizador.
- **Design Responsivo**: Adapta-se a diferentes tamanhos de ecrã (desktop, tablet, mobile).
- **Testes**: Estrutura para testes unitários e de UI.

## 🛠️ Tecnologias

- **Framework**: React 18
- **Estilização**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router
- **Ícones**: Lucide React
- **Cliente HTTP**: Fetch API
- **Ferramenta de Build**: Vite

## 🚀 Quick Start (Frontend)

### Pré-requisitos
- Node.js 16+ (preferencialmente 18+)

### Passos de Configuração

1.  **Navegue para o diretório do frontend:**
    ```bash
    cd tv-show-tracker-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    pnpm install
    ```

3.  **Configure as variáveis de ambiente:**
    *   Copie `tv-show-tracker-frontend/.env.example` para `tv-show-tracker-frontend/.env`.
    *   Edite o ficheiro `.env` e certifique-se de que `REACT_APP_API_BASE_URL` aponta para o endereço correto da sua API (por exemplo, `http://localhost:5001/api`).

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    pnpm run dev
    ```

A aplicação frontend estará acessível em `http://localhost:5173`.

