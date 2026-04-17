import { Request, Response } from "express";

export const index = (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>API REST - Node.js + TypeScript</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 text-gray-800 font-sans">
        <div class="max-w-4xl mx-auto py-12 px-6">
          <!-- Título -->
          <h1 class="text-3xl font-bold text-center text-blue-600 mb-1">
            API REST - Node.js + TypeScript 
          </h1>
          <h2 class="text-center text-gray-600 mb-8">
            por <a href="https://github.com/phlbarreto" class="text-black">Pedro Barreto</a>
          </h2>

          <!-- Descrição -->
          <p class="text-center text-gray-600 mb-8">
            Projeto de API REST com autenticação, validação de dados e CRUD de
            tarefas.
          </p>

          <!-- Tecnologias -->
          <section class="mb-10">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">🚀 Tecnologias</h2>
            <ul class="list-disc list-inside space-y-1">
              <li>Node.js + Express</li>
              <li>TypeScript</li>
              <li>PostgreSQL (com Prisma)</li>
              <li>Bcrypt (hash de senhas)</li>
              <li>Zod (validação)</li>
              <li>CookieParser (sessões HttpOnly)</li>
            </ul>
          </section>

          <section class="mb-10">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">🧰 Auxiliares</h2>
            <ul class="list-disc list-inside space-y-1">
              <li>Dotenv + Dotenv Expand</li>
              <li>CORS</li>
              <li>Docker (banco de dados local)</li>
              </ul>
          </section>

          <!-- Estrutura -->
          <section class="mb-10">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
              🗂️ Estrutura de Entidades
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-white shadow rounded-lg p-4">
                <h3 class="font-bold text-blue-500 mb-2">User</h3>
                <ul class="list-disc list-inside text-sm">
                  <li>id</li>
                  <li>name</li>
                  <li>email (único)</li>
                  <li>password (hash)</li>
                  <li>created_at</li>
                  <li>updated_at</li>
                </ul>
              </div>
              <div class="bg-white shadow rounded-lg p-4">
                <h3 class="font-bold text-blue-500 mb-2">Task</h3>
                <ul class="list-disc list-inside text-sm">
                  <li>id</li>
                  <li>title</li>
                  <li>description</li>
                  <li>status TaskStatus</li>
                  <li>userId (FK → User)</li>
                  <li>created_at / updatedAt</li>
                </ul>
              </div>
              <div class="bg-white shadow rounded-lg p-4">
                <h3 class="font-bold text-blue-500 mb-2">TaskStatus</h3>
                <ul class="list-disc list-inside text-sm">
                  <li>pending</li>
                  <li>in_progress</li>
                  <li>done</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Endpoints -->
          <section class="mb-10">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">📌 Endpoints</h2>
            <div class="bg-white shadow rounded-lg p-4">
              <h3 class="font-bold text-green-500 mb-2">Auth</h3>
              <ul class="list-disc list-inside text-sm mb-4">
                <li>GET /user</li>
                <li>POST /user</li>
                <li>POST /login</li>
              </ul>
              <h3 class="font-bold text-green-500 mb-2">Tasks</h3>
              <ul class="list-disc list-inside text-sm">
                <li>GET /tasks</li>
                <li>GET /tasks/:id</li>
                <li>POST /tasks</li>
                <li>PUT /tasks/:id</li>
                <li>DELETE /tasks/:id</li>
              </ul>
            </div>
          </section>

          <!-- GitHub -->
          <div class="text-center">
            <a
              href="https://github.com/phlbarreto/API-REST-Node.js-TypeScript/tree/main"
              target="_blank"
              class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              🔗 Ver no GitHub
            </a>
          </div>
        </div>
      </body>
    </html>

    `);
};
