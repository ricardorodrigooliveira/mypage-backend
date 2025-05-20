import express from "express";
import upload from "../uploadConfig.js";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// Middleware de autenticação
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

// Criar nova postagem (com ou sem arquivo)
// Aceita múltiplos campos de arquivo (arquivo ou image)
router.post("/",autenticar,upload.fields([{ name: "arquivo", maxCount: 1 },
                                          { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    const { titulo, conteudo } = req.body;
    const usuarioId = req.usuario.id;

    const arquivo = req.files?.arquivo?.[0]?.filename || null;
    const image = req.files?.image?.[0]?.filename || null;

    try {
      const result = await pool.query(
        `INSERT INTO t_postagem (usuario_id, titulo, conteudo, arquivo) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [usuarioId, titulo, conteudo, arquivo || image] // só salva 1
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Erro ao criar postagem:", err);
      res.status(500).json({ error: "Erro ao criar postagem" });
    }
  }
);


// Listar postagens
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.usuario_id, p.titulo, p.conteudo, p.data_criacao, p.arquivo, u.name AS autor 
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
