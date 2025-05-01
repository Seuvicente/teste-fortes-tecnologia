# Teste Fortes Tecnologia 

O sistema consiste em:

* **Backend:** Uma API Web construída com ASP.NET Core 8 e Entity Framework Core 8, utilizando um banco de dados SQLite.
* **Frontend:** Uma aplicação Single-Page Application (SPA) construída com React, TypeScript e Vite, utilizando Context API para gerenciamento de estado, Axios para chamadas à API, e Tailwind CSS para estilização.

## Funcionalidades

* **Gerenciamento de Cursos:**
    * Criar, Listar, Editar e Excluir Cursos (Nome e Descrição).
* **Gerenciamento de Alunos:**
    * Criar, Listar, Editar e Excluir Alunos (Nome, Email, Data de Nascimento).
    * Validação de idade mínima (18 anos) no backend ao criar/editar alunos.
* **Gerenciamento de Matrículas:**
    * Matricular um aluno em um ou mais cursos.
    * Remover a matrícula de um aluno de um curso específico.
* **Consultas e Listagens:**
    * Listar todos os cursos.
    * Listar todos os alunos registrados.
    * Visualizar alunos matriculados em um curso específico.
    * Visualizar cursos em que um aluno específico está matriculado.
    * Interface de Dashboard com estatísticas básicas.

## Tecnologias Utilizadas

**Backend:**

* .NET 8
* ASP.NET Core 8 Web API
* Entity Framework Core 8
* SQLite (Banco de Dados)
* C#

**Frontend:**

* React (v18+)
* TypeScript
* Vite (Build Tool)
* Axios (Requisições HTTP)
* Tailwind CSS (Estilização)
* Lucide React (Ícones)
* React Context API (Gerenciamento de Estado)

## Pré-requisitos

Antes de começar, garanta que você tem as seguintes ferramentas instaladas:

* [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) ou superior
* [Node.js](https://nodejs.org/) (Versão LTS recomendada)
* [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) (gerenciador de pacotes Node)
* [Git](https://git-scm.com/) (para clonar o repositório)
* Um editor de código (Ex: Visual Studio Code, Visual Studio 2022)

## Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina.

**1. Clone o Repositório:**

```bash
git clone <URL_DO_SEU_REPOSITORIO_GIT>
cd <NOME_DA_PASTA_DO_PROJETO>
```

**2. Configure o Backend:**

* Navegue até a pasta do projeto backend (substitua `NomeDaPastaBackend` pelo nome real):
    ```bash
    cd NomeDaPastaBackend
    ```
* Restaure as dependências do .NET:
    ```bash
    dotnet restore
    ```
* Aplique as migrações do Entity Framework para criar o banco de dados SQLite:
    * (Certifique-se de que o arquivo `TesteFortesTecnologia.db` não exista ou possa ser sobrescrito, se for o caso)
    ```bash
    dotnet ef database update
    ```
    * Isso criará o arquivo `TesteFortesTecnologia.db` na pasta do projeto backend (ou onde estiver configurado).

**3. Configure o Frontend:**

* Navegue até a pasta do projeto frontend (a partir da raiz do repositório):
    ```bash
    cd ../NomeDaPastaFrontend
    # ou ajuste o caminho relativo se necessário
    ```
* Instale as dependências do Node.js:
    ```bash
    npm install
    # ou
    yarn install
    ```
* **Configure a URL da API:**
    * Crie um arquivo chamado `.env` na raiz da pasta do **frontend**.
    * Adicione a seguinte linha a este arquivo, ajustando a porta se o seu backend rodar em uma porta diferente da `5127` (verifique o `launchSettings.json` do backend ou a saída do `dotnet run`):
        ```env
        VITE_API_URL=http://localhost:5127/api
        ```
        *(O prefixo `VITE_` é necessário para que o Vite exponha a variável de ambiente para o seu código frontend).*

**4. Execute a Aplicação:**

* **Execute o Backend:**
    * Abra um terminal **na pasta do backend**.
    * Execute o comando:
        ```bash
        dotnet run
        ```
    * Observe a saída no terminal. Ele indicará em qual URL a API está rodando (Ex: `http://localhost:5127` ou `https://localhost:7XXX`). Anote essa URL base (sem o `/api`).
* **Execute o Frontend:**
    * Abra **outro terminal** na pasta do **frontend**.
    * Execute o comando:
        ```bash
        npm run dev
        # ou
        yarn dev
        ```
    * O terminal indicará em qual URL o servidor de desenvolvimento do frontend está rodando (geralmente `http://localhost:5173`).
    * Abra essa URL do frontend no seu navegador.

Agora você deve conseguir acessar a aplicação frontend no seu navegador, e ela se comunicará com o backend que está rodando localmente.

## API Endpoints

A API possui endpoints para gerenciar Cursos, Alunos e Matrículas. Para uma documentação detalhada e interativa dos endpoints, execute o backend e acesse a interface do Swagger UI na URL:

`http://localhost:5127/swagger`

*(Substitua `5127` pela porta real em que seu backend está rodando).*

## Estrutura de Pastas (Exemplo)

```
/seu-repositorio
|-- /NomeDaPastaBackend/       # Projeto ASP.NET Core API
|   |-- Controllers/
|   |-- Data/
|   |-- Models/
|   |-- TesteFortesTecnologia.csproj
|   |-- Program.cs
|   `-- TesteFortesTecnologia.db  # Banco de dados SQLite (criado após migrations)
|
|-- /NomeDaPastaFrontend/      # Projeto React + Vite + TS
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- services/
|   |   |-- types/
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- .env                   # Arquivo de configuração da API URL (VOCÊ CRIA)
|   |-- package.json
|   |-- vite.config.ts
|   `-- tsconfig.json
|
`-- README.md                  # Este arquivo
```

*(Ajuste os nomes das pastas `NomeDaPastaBackend` e `NomeDaPastaFrontend` conforme a sua estrutura).*

```

---

## Tutorial Rápido (Resumo do README)

Para colocar o projeto para rodar:

1.  **Pré-requisitos:** Instale .NET SDK 8, Node.js (com npm ou yarn) e Git.
2.  **Clonar:** `git clone <URL_DO_REPOSITORIO>` e entre na pasta criada `cd <NOME_PASTA>`.
3.  **Backend Setup:**
    * Vá para a pasta do backend: `cd NomeDaPastaBackend`
    * Restaure pacotes: `dotnet restore`
    * Crie/Atualize o banco: `dotnet ef database update`
4.  **Frontend Setup:**
    * Vá para a pasta do frontend: `cd ../NomeDaPastaFrontend` (ou caminho correto)
    * Instale pacotes: `npm install` (ou `yarn install`)
    * Crie um arquivo `.env` na pasta do frontend.
    * Adicione a linha `VITE_API_URL=http://localhost:5127/api` ao arquivo `.env` (verifique e ajuste a porta `5127` se necessário, conforme a saída do backend).
5.  **Rodar Backend:**
    * Em um terminal, na pasta do backend, execute: `dotnet run`
    * Observe a URL que ele informa (ex: `http://localhost:5127`).
6.  **Rodar Frontend:**
    * Em **outro** terminal, na pasta do frontend, execute: `npm run dev` (ou `yarn dev`)
    * Observe a URL que ele informa (ex: `http://localhost:5173`).
7.  **Acessar:** Abra a URL do frontend (ex: `http://localhost:5173`) no seu navegador.

Lembre-se de substituir `<URL_DO_SEU_REPOSITORIO_GIT>`, `<NOME_DA_PASTA_DO_PROJETO>`, `NomeDaPastaBackend` e `NomeDaPastaFrontend` pelos nomes corretos do seu projeto e estrutura. Verifique também as portas em que os servidores frontend e backend estão rodando e ajuste o arquivo `.env` e a configuração de CORS no backend (`Program.cs`) se necessário.
