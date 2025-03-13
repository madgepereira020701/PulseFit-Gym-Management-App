const jwt = require('jsonwebtoken');
const JWT_SECRET = ''; //yoursecretkey (any name)

// Middleware to verify token
const protect2 = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);  // Log the decoded token
        req.user = { userId: decoded.userId, email: decoded.email, emno: decoded.emno }; // Ensure both userId and email are set
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};


module.exports = protect2;
