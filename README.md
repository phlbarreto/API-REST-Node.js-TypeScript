# API-REST-Node.js-TypeScript

## 🚀 Tecnologias

### Principais

- **Node.js + Express**
- **TypeScript**
- **PostgreSQL** (com Prisma)
- **Bcrypt** (hash password)
- **Zod** (validação de dados)
- **CookieParser** (cookie httpOnly para sessão)

### Auxiliares

- **Dotenv e Dotenv-Expand** (variaveis de ambiente)
- **CORS** (controle de acesso entre dominios)
- **Docker** (com PostgreSQL para desenvolvimento local)

---

## 🗂️ Estrutura de Entidades

### User

- `id` (uuid)
- `name`
- `email` (único)
- `password` (hash)
- `createdAt`
- `updatedAt`

### UserSession

- `id` (uuid)
- `user_id`
- `expires_at`
- `last_active_at`

### Task

- `id` (uuid)
- `title`
- `description`
- `status` (`TaskStatus`)
- `userId` (`FK → User`)
- `createdAt`
- `updatedAt`

### Enums

- **TaskStatus**
- `pending`
- `in_progress`
- `done`

---

## 📌 Endpoints

### Auth

- `GET /user` → Retorna dados do usuário logado
- `POST /user` → Criar novo usuário
- `POST /login` → Autenticação do usuário

### Tasks

- `GET /tasks` → Listar todas as tarefas do usuário logado
- `GET /tasks/:id` → Buscar tarefa pelo id do usuário logado
- `POST /tasks` → Criar nova tarefa
- `PATCH /tasks/:id` → Atualizar tarefa existente
- `DELETE /tasks/:id` → Excluir tarefa

---

## 📥 Instalação e Uso

### 1. Clonar o repositório

```bash
git clone https://github.com/phlbarreto/API-REST-Node.js-TypeScript.git
cd API-REST-Node.js-TypeScript
```

### 2. Instalar dependências

- É necessário ter o docker instalado para desenvolvimento local.

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
NODE_ENV=dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=local_user
POSTGRES_DB=local_db
POSTGRES_PASSWORD=local_password
```

### 4. Iniciar servidor para desenvolvimento

```bash
npm run dev
```

### API ficará disponivel em:

```bash
http://localhost:5001
```
