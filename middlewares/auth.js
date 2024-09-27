import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

// MIDDLEWARE
const auth = async (req, res, next) => {
    const tokenUser = await req.headers.authorization

    if (!tokenUser) {
        return res.status(401).json({ message: "Acesso negado" })
    }

    try {
        const decoded = jwt.verify(tokenUser.split(" ")[1], JWT_SECRET)

        req.userId = decoded.id

    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Token inválido" })
    }

    next()
}

export default auth