import express from "express"
import publicRoutes from "./routes/public.js"
import privateRoutes from "./routes/private.js"
import auth from "./middlewares/auth.js"

const app = express()
app.use(express.json())

// CONF. PORTA
app.listen(3000, () => console.log("Servidor ligado! 🚀"))

/** 
 * ROTA PÚBLICA: LOGIN E CADASTRO
 * ROTA PRIVADA: LISTA DE USUÁRIOS
*/ 

// TOKEN JWT: AUXILIA EM ESCOLHER ROTAS PÚBLICAS E PRIVADAS

app.use('/', publicRoutes )
app.use('/',auth, privateRoutes )