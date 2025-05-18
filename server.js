import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
