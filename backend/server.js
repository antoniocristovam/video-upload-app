const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Módulo para ler arquivos no diretório

const app = express();
const PORT = 3001;

// Middleware para CORS
app.use(
  cors({
    origin: "*", // Permite qualquer origem (use com cuidado em produção)
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

// Rota para Upload de Vídeo
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }
  res.json({
    filePath: `http://192.168.1.100:${PORT}/uploads/${req.file.filename}`,
  });
});

// Rota para Listar Vídeos
app.get("/videos", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao listar vídeos" });
    }

    const videoFiles = files.filter((file) =>
      /\.(mp4|mov|avi|mkv)$/i.test(file)
    );
    const videoUrls = videoFiles.map(
      (file) => `http://192.168.1.100:${PORT}/uploads/${file}`
    );

    res.json(videoUrls);
  });
});

// Servir vídeos da pasta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://192.168.1.100:${PORT}`);
});
