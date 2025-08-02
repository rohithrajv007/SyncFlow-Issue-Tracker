const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        
        req.user = { id: payload.userId };
        
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
