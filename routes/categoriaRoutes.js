const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");

// Criar categoria
router.post("/", async (req, res) => {
  try {
    const novaCategoria = new Categoria(req.body);
    const salva = await novaCategoria.save();
    res.status(201).json(salva);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Listar categorias
router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ erro: "Não encontrada" });
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Atualizar
router.put("/:id", async (req, res) => {
  try {
    const atualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Deletar
router.delete("/:id", async (req, res) => {
  try {
    // Verifica se existem produtos com essa categoria
    const produtosRelacionados = await Produto.findOne({
      categoria: req.params.id,
    });

    if (produtosRelacionados) {
      return res.status(400).json({
        erro: "Não é possível excluir: existem produtos associados a esta categoria.",
      });
    }

    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ msg: "Categoria deletada com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
