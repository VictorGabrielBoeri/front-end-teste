# Front-End Teste - Internet Banking

Este projeto é uma aplicação de internet banking desenvolvida em Vue 3 + TypeScript, com Vuetify e Chart.js, simulando funcionalidades de um banco digital moderno.

## ✨ Funcionalidades

- **Dashboard** com saldo, extrato, resumo de transferências e gráfico de movimentação.
- **Transferências** (PIX e TED) entre contas.
- **Extrato** detalhado com filtros.
- **Modo escuro** global, com alternância e salvamento de preferência.
- **Gráficos** de recebimentos e envios.
- **Login e autenticação** (mock).

## 🛠️ Tecnologias Utilizadas

- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vuetify 3](https://vuetifyjs.com/)
- [Chart.js + vue-chartjs](https://vue-chartjs.org/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)

## 🚀 Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/VictorGabrielBoeri/front-end-teste.git
   cd front-end-teste
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Rode o projeto:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

> **Obs:** Certifique-se de que o backend (API) está rodando em `http://localhost:3000/v1` ou ajuste a URL em `src/services/authService.ts`.

## 🌗 Modo Escuro

- O modo escuro pode ser ativado/desativado pelo botão no menu lateral.
- A preferência é salva automaticamente.

## 📊 Gráficos

- O dashboard exibe um gráfico de barras com o total de transferências recebidas e enviadas.
- Os valores são atualizados em tempo real conforme o extrato.

## 📡 Endpoints da API utilizados

- `POST /v1/login` — Autenticação do usuário (login)
- `POST /v1/signup` — Cadastro de novo usuário
- `GET /v1/my_accounts` — Buscar contas bancárias do usuário logado
- `GET /v1/available_accounts` — Buscar contas disponíveis para transferência
- `POST /v1/transfer` — Realizar transferência (PIX ou TED)
- `GET /v1/statements` — Buscar extrato de transferências (com filtros de data, valor, tipo, etc)

Exemplo de uso de extrato:
```
GET /v1/statements?per_page=10
GET /v1/statements?page=1&per_page=10
```

## 🤝 Contribuição

Sinta-se à vontade para abrir issues ou pull requests!

---

**Desenvolvido por [Victor Gabriel](https://github.com/VictorGabrielBoeri)**
