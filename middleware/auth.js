// middleware/auth.js
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    const secret = process.env.SECRET;
    const decoded = jwt.verify(token, secret);
    req.usuarioId = decoded.id; // aqui salva o id do usuário no req
    next();
  } catch (error) {
    return res.status(400).json({ msg: "Token inválido!" });
  }
}

module.exports = verifyToken;
