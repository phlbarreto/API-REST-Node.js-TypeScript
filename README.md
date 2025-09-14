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
- **Dotenv** (variaveis de ambiente)
- **CORS** (controle de acesso entre dominios)
---

## 🗂️ Estrutura de Entidades

### User
- `id`   
- `name`  
- `email` (único)  
- `password` (hash)  
- `createdAt`

### UserSession
- `id` (uuid)
- `user_id`
- `expires_at`
- `last_act_at`

### Task
- `id` (uuid)  
- `title`  
- `description`  
- `status` (`TaskStatus`)  
- `userId` (FK → User)  
- `createdAt / updatedAt`

### Enums
- **TaskStatus**
- `pending`
- `in_progress`
- `done`

---

## 📌 Endpoints

### Auth
- `POST /register` → Criar novo usuário  
- `POST /login` → Autenticação do usuário  
- `GET /validate` → Autenticação de sessão do usuário, retorna dados do usuário logado

### Tasks
- `GET /tasks` → Listar todas as tarefas do usuário logado  
- `POST /tasks` → Criar nova tarefa  
- `PUT /tasks/:id` → Atualizar tarefa existente  
- `DELETE /tasks/:id` → Excluir tarefa  
