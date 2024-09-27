import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/listUsers', async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
            select: {
                id: false,
                name: true,
                email: true,
                password: false
            }
        })

        res.status(200).json({ message: "Usuários listados com sucesso!", allUsers })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erro no servidor." })
    }
})

export default router