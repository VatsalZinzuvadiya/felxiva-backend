const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized r21831' })
    }
    const token = authHeader.split(' ')[1]
    
    jwt.verify(token, process.env.Jwt_Secret_Key, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Session Expired Please Login Again!' })
        }
        const { id, role } = decoded;
    
    if (role !== 'provider' && role !== 'user' && role !== 'employee' && role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Invalid role' });
    }
    req.userId = id;
    req.role = role;
        next()
    })
}
module.exports = verifyJWT
