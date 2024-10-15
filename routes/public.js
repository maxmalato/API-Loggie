import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// IMPORTAR APENAS A FERRAMENTA DE ROTEAMENTO
const router = express.Router()
const prisma = new PrismaClient()

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLocaleLowerCase())
}

const validatePassword = (password) => {
    const minLength = 6
    return password.length >= minLength
}

// O JWT SECRET É UMA CAMADA EXTRA DE SEGURANÇA PARA O TOKEN (ENCRIPTAR OU DESENCRIPTAR)
const JWT_SECRET = process.env.JWT_SECRET

// CADASTRO DE USUÁRIO
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body

    // VALIDAÇÕES DE CAMPOS VAZIOS OU NÃO PREENCHIDOS CORRETAMENTE
    if (!name) {
        return res.status(422).json({ message: "Nome não informado. Por favor, preencha o campo." })
    }

    if (!email) {
        return res.status(422).json({ message: "E-mail não informado. Por favor, preencha o campo." })
    }

    if (!validateEmail(email)) {
        return res.status(422).json({ message: "Por favor, informe um e-mail válido." })
    }

    if (!password || !confirmPassword) {
        return res.status(422).json({ message: "Uma das senhas não estão preenchidas. Por favor, preencha os dois campos." })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "As senhas não são iguais." })
    }

    if (!validatePassword(password)) {
        return res.status(422).json({ message: "A senha precisa ter mais de seis dígitos." })
    }

    // VALIDAR SE O E-MAIL JÁ EXISTE NO BANCO DE DADOS
    const emailExist = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (emailExist) {
        return res.status(422).json({ message: "O e-mail já está cadastrado. Por favor, faça o login." })
    }

    // PESO DA ENCRIPTAÇÃO
    const salt = await bcrypt.genSalt(10)

    // CRIAÇÃO DO HASH NA SENHA
    const hashPassword = await bcrypt.hash(password, salt)

    try {
        const userDB = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashPassword
            },
            select: {
                name: true,
                email: true
            }
        })

        res.status(201).json(userDB)
    } catch (error) {
        res.status(500).json({ message: "Erro no servidor. Tente novamente." })
        console.log(error)
    }
})

// LOGIN DE USUÁRIO
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        return res.status(422).json({ message: "Por favor, informe o seu e-mail." })
    }

    if (!validateEmail(email)) {
        return res.status(422).json({ message: "Por favor, informe um e-mail válido." })
    }

    if (!password) {
        return res.status(422).json({ message: "Por favor, informe a sua senha." })
    }

    if (!validatePassword(password)) {
        return res.status(422).json({ message: "A senha precisa ter mais de seis dígitos."})
    }

    // VERIFICAR COM O PRISMA SE O EMAIL DIGITADO EM "req.body" É IGUAL AO E-MAIL NO DB.
    const userLogin = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    // VERIFICAR SE O E-MAIL EXISTE NA BASE DE DADOS
    if (!userLogin) {
        return res.status(422).json({ message: "E-mail não encontrado. Verifique se o e-mail está correto ou cadastre-se." })
    }

    // COMPARAÇÃO DE SENHA DO BANCO COM O A SENHA DIGITADA
    const isMatch = await bcrypt.compare(password, userLogin.password)

    if (!isMatch) {
        return res.status(400).json({ message: "A senha está errada." })
    }

    try {
        // GERAÇÃO DO TOKEN JWT
        const token = jwt.sign({ id: userLogin.id }, JWT_SECRET, { expiresIn: '10m' })

        res.status(200).json({ token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erro no servidor. Tente novamente." })
    }
})

export default router