import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://ricardorodrigooliveira.github.io",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // use apenas se estiver usando cookies com autenticação
}));

// Serve arquivos da pasta uploads
//app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
