const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Para gerar tokens

const app = express();
const PORT = 3001;
const JWT_SECRET = "sua_chave_secreta_super_segura"; // Altere para uma chave segura

// Middleware para CORS
app.use(
  cors({
    origin: "*", // Use com cuidado em produção
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/**
 * 🔒 Rota para Upload de Vídeo
 */
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }

  // Gera um token temporário para o vídeo
  const token = jwt.sign(
    { file: req.file.filename },
    JWT_SECRET,
    { expiresIn: "1h" } // Token expira em 1 hora
  );

  res.json({
    message: "Upload bem-sucedido!",
    filePath: `http://192.168.1.100:${PORT}/video/${token}`,
  });
});

/**
 * 🎥 Rota Protegida para Acessar Vídeo
 */
app.get("/video/:token", (req, res) => {
  const { token } = req.params;

  try {
    // Valida o token
    const decoded = jwt.verify(token, JWT_SECRET);
    const videoPath = path.join(__dirname, "uploads", decoded.file);

    if (fs.existsSync(videoPath)) {
      res.sendFile(videoPath);
    } else {
      res.status(404).json({ error: "Vídeo não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao validar token:", error.message);
    res.status(401).json({ error: "Acesso não autorizado ou token expirado." });
  }
});

/**
 * 📄 Rota para Listar Vídeos (URLs com Token)
 */
app.get("/videos", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Erro ao listar vídeos:", err.message);
      return res.status(500).json({ error: "Erro ao listar vídeos." });
    }

    const videoFiles = files.filter((file) =>
      /\.(mp4|mov|avi|mkv)$/i.test(file)
    );

    const videoUrls = videoFiles.map((file) => {
      const token = jwt.sign({ file }, JWT_SECRET, { expiresIn: "1h" });
      return `http://192.168.1.100:${PORT}/video/${token}`;
    });

    res.json(videoUrls);
  });
});

/**
 * 🚫 Bloqueia Acesso Direto à Pasta 'uploads'
 */
app.use("/uploads", (req, res) => {
  res.status(403).json({ error: "Acesso direto aos arquivos não permitido." });
});

/**
 * 🚀 Iniciar o Servidor
 */
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://192.168.1.100:${PORT}`);
});
