const Produto = require("./Models/Produto");
const Usuario = require("./Models/User");
const { enviarEmailEstoqueBaixo } = require("../services/emailService");

const verificarEstoqueBaixoEEnviarEmails = async (req, res) => {
  try {
    const produtos = await Produto.find({ quantidade: { $lte: 5 } });

    for (const produto of produtos) {
      const usuario = await Usuario.findById(produto.usuarioId);
      if (usuario && usuario.email) {
        await enviarEmailEstoqueBaixo(
          usuario.email,
          produto.nome,
          produto.quantidade
        );
      }
    }

    res.status(200).json({
      mensagem: "Verificação de estoque baixo realizada e e-mails enviados.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ erro: "Erro ao verificar estoque e enviar e-mails." });
  }
};

module.exports = { verificarEstoqueBaixoEEnviarEmails };
