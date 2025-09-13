# API-REST-Node.js-TypeScript

## 🚀 Tecnologias
- **Node.js + Express**
- **TypeScript**
- **PostgreSQL** (com Prisma)
- **JWT** (autenticação)
- **Zod** (validação de dados)

---

## 🗂️ Estrutura de Entidades

### User
- `id` (uuid)  
- `name`  
- `email` (único)  
- `password` (hash)  
- `createdAt`  

### Task
- `id` (uuid)  
- `title`  
- `description`  
- `status` (`pending | in_progress | done`)  
- `userId` (FK → User)  
- `createdAt / updatedAt`  

---

## 📌 Endpoints

### Auth
- `POST /auth/register` → Criar novo usuário  
- `POST /auth/login` → Autenticação do usuário  

### Users
- `GET /users/me` → Retorna dados do usuário logado  

### Tasks
- `GET /tasks` → Listar todas as tarefas do usuário logado  
- `POST /tasks` → Criar nova tarefa  
- `PUT /tasks/:id` → Atualizar tarefa existente  
- `DELETE /tasks/:id` → Excluir tarefa  
