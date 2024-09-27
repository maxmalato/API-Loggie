import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// IMPORTAR APENAS A FERRAMENTA DE ROTEAMENTO
const router = express.Router()
const prisma = new PrismaClient()

// O JWT SECRET É UMA CAMADA EXTRA DE SEGURANÇA PARA O TOKEN (ENCRIPTAR OU DESENCRIPTAR)
const JWT_SECRET = process.env.JWT_SECRET

// CADASTRO DE USUÁRIO
router.post('/register', async (req, res) => {
    try {
        const user = req.body

        if(user.password !== user.confirmPassword) {
            res.status(400).json({ message: "As senhas não são iguais"})
        }

        // PESO DA ENCRIPTAÇÃO
        const salt = await bcrypt.genSalt(10)

        // CRIAÇÃO DO HASH NA SENHA
        const hashPassword = await bcrypt.hash(user.password, salt)

        const userDB = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword
            }
        })

        res.status(201).json(userDB)
    } catch (err) {
        res.status(500).json({ message: "Erro no servidor. Tente novamente." })
        console.log(err)
    }
})

// LOGIN DE USUÁRIO
router.post('/login', async (req, res) => {
    try {
        const userLogin = req.body

        // VERIFICAR COM O PRISMA SE O EMAIL DIGITADO EM "req.body" É IGUAL AO E-MAIL NO DB.
        const user = await prisma.user.findUnique({
            where: {
                email: userLogin.email
            }
        })

        // VERIFICAR SE O E-MAIL EXISTE NA BASE DE DADOS
        if (!user) {
            return res.status(404).json({ message: "E-mail não encontrado." })
        }

        // COMPARAÇÃO DE SENHA DO BANCO COM O A SENHA DIGITADA
        const isMatch = await bcrypt.compare(userLogin.password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "A senha está errada." })
        }

        // GERAÇÃO DO TOKEN JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1m' })

        res.status(200).json({ token })

    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Erro no servidor. Tente novamente" })
    }
})

export default router