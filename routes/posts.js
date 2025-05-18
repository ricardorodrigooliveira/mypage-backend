import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Middleware para autenticação
const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Criar uma nova postagem
router.post("/", autenticar, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const result = await pool.query(
      `INSERT INTO t_postagem (usuario_id, titulo, conteudo) 
       VALUES ($1, $2, $3) RETURNING *`,
      [usuarioId, titulo, conteudo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar postagem" });
  }
});

// Listar postagens
router.get("/", autenticar, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS autor 
       FROM t_postagem p 
       JOIN t_usuario u ON u.id = p.usuario_id 
       ORDER BY p.data_criacao DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar postagens" });
  }
});

export default router;
