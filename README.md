# API Loggie

API para cadastro e autenticação de usuários utilizando JWT para proteger rotas privadas.

## Tecnologias Utilizadas
- Node.js
- Express
- Prisma ORM
- JSON Web Token (JWT)
- Bcrypt para hash de senhas
- CORS

## Endpoints Principais
### Autenticação
- POST /register - Cadastro de usuário
- POST /login - Autenticação e geração de token JWT

### Rotas Protegidas
- GET /profile - Retorna informações do usuário autenticado (requer JWT)
