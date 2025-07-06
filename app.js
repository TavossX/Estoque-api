/*Imports*/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const produtoRoutes = require("./routes/produtoRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//Config JSON response
app.use(express.json());

//Models
const User = require("./models/User");

app.use("/api/produtos", produtoRoutes);

app.use("/api/categorias", categoriaRoutes);

// Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //Check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" });
  }
  res.status(200).json({ user });
});

//Middleware para verificar o token
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido!" });
  }
}

//Register User
app.post("/auth/register", async (req, res) => {
  const { email, password, confirmpassword } = req.body;
  console.log(req.body);

  // Validações
  if (!email) {
    return res.status(422).json({ msg: "O e-mail é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  //Check if User exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  //CREATE PASSWORD
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //Create User
  const user = new User({
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
});

//Login User
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  //Validations
  if (!email) {
    return res.status(422).json({ msg: "O e-mail é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  //Check if user exists]
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: "Usuário não encontrado!" });
  }
  //Check if password match
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);
    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
});
// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URL).then(() => {
  app.listen(5000);
  console.log("Conectado ao MongoDB! 🚀");
  console.log("Servidor rodando na porta 3000! 🚀");
});
