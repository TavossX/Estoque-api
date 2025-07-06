const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");
const Categoria = require("../models/Categoria");
const multer = require("multer");
const XLSX = require("xlsx");
const { enviarEmailEstoqueBaixo } = require("../services/emailService");
const Usuario = require("../models/User");
const verifyToken = require("../middleware/auth"); // importe o middleware

// Configuração do multer para upload de arquivos
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
});

// Criar produto — agora com autenticação e pegando usuarioId do token
router.post("/", verifyToken, async (req, res) => {
  try {
    const { categoria } = req.body;
    const usuarioId = req.usuarioId; // pega do middleware

    const categoriaExiste = await Categoria.findById(categoria);
    if (!categoriaExiste) {
      return res
        .status(400)
        .json({ erro: "Categoria inválida ou não encontrada." });
    }

    const novoProduto = new Produto({ ...req.body, usuarioId });
    const produtoSalvo = await novoProduto.save();
    res.status(201).json(produtoSalvo);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Listar produtos
router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.find().populate("categoria");
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Verificar produtos com estoque baixo e enviar e-mails
router.get("/verificar-estoque-baixo", async (req, res) => {
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

    res.status(200).json({ mensagem: "E-mails enviados com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mails:", error);
    res.status(500).json({ erro: "Erro ao enviar e-mails." });
  }
});

// Buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Atualizar
router.put("/:id", async (req, res) => {
  try {
    const { categoria } = req.body;

    if (categoria) {
      const categoriaExiste = await Categoria.findById(categoria);
      if (!categoriaExiste) {
        return res
          .status(400)
          .json({ erro: "Categoria inválida ou não encontrada." });
      }
    }

    const produtoAtualizado = await Produto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(produtoAtualizado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Deletar
router.delete("/:id", async (req, res) => {
  try {
    await Produto.findByIdAndDelete(req.params.id);
    res.json({ msg: "Produto deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Exportar para Excel
router.get("/exportar/excel", async (req, res) => {
  try {
    const produtos = await Produto.find().populate("categoria");

    const dadosFormatados = produtos.map((produto, index) => ({
      "Nome do Produto": produto.nome,
      "Quantidade em Estoque": produto.quantidade,
      "Preço Unitário": produto.preco,
      Corredor: produto.localizacao?.corredor || "-",
      Prateleira: produto.localizacao?.prateleira || "-",
      Categoria: produto.categoria ? produto.categoria.nome : "Sem Categoria",
      "Valor Total em Estoque": {
        f: `C${index + 2}*B${index + 2}`,
        t: "n",
        z: '"R$"#,##0.00',
      },
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);

    ws["!cols"] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center" },
    };

    const numColunas = Object.keys(dadosFormatados[0]).length;
    for (let col = 0; col < numColunas; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellRef]) ws[cellRef].s = headerStyle;
    }

    const moneyFormat = '"R$"#,##0.00';
    for (let i = 0; i < produtos.length; i++) {
      const linha = i + 2;
      ["C", "G"].forEach((col) => {
        const cellRef = `${col}${linha}`;
        if (ws[cellRef]) ws[cellRef].z = moneyFormat;
      });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "buffer",
      bookSST: true,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="Estoque.xlsx"');
    res.send(excelBuffer);
  } catch (err) {
    console.error("Erro na exportação para Excel:", err);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
