const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");
const Usuario = require("../models/User");
const { enviarEmailEstoqueBaixo } = require("../services/emailService");

router.get("/verificar-estoque-baixo", async (req, res) => {
  try {
    const produtos = await Produto.find({ quantidade: { $lte: 5 } });
    console.log(`Encontrados ${produtos.length} produtos com estoque baixo`);

    for (const produto of produtos) {
      console.log(
        `Verificando produto: ${produto.nome}, usuárioId: ${produto.usuarioId}`
      );
      const usuario = await Usuario.findById(produto.usuarioId);
      if (usuario && usuario.email) {
        console.log(`Enviando email para: ${usuario.email}`);
        await enviarEmailEstoqueBaixo(
          usuario.email,
          produto.nome,
          produto.quantidade
        );
      } else {
        console.log(
          `Usuário não encontrado ou sem email para o produto ${produto.nome}`
        );
      }
    }

    res.status(200).json({ mensagem: "E-mails enviados com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mails:", error);
    res.status(500).json({ erro: "Erro ao enviar e-mails." });
  }
});

module.exports = router;
