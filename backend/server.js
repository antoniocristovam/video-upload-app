const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Módulo para ler arquivos no diretório

const app = express();
const PORT = 5000;

// Middleware para CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
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
    filePath: `http://localhost:${PORT}/uploads/${req.file.filename}`,
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
      (file) => `http://localhost:${PORT}/uploads/${file}`
    );

    res.json(videoUrls);
  });
});

// Servir vídeos da pasta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
