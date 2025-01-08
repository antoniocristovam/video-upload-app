const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 3001;

// Middleware para CORS (Ajustado)
app.use(
  cors({
    origin: "*", // Permite qualquer origem (use com cuidado em produção)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware padrão do Express
app.use(express.json());

// Armazenamento com Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Compressão de Vídeo com FFmpeg
const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputPath}" -vcodec libx264 -crf 28 "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao comprimir vídeo:", error.message);
        console.error(stderr);
        reject(error);
      } else {
        console.log("Vídeo comprimido com sucesso:", outputPath);
        resolve(outputPath);
      }
    });
  });
};

// Rota para Upload de Vídeo com Compressão
app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  const originalPath = req.file.path;
  const compressedPath = path.join(
    __dirname,
    "uploads",
    `compressed-${req.file.filename}`
  );

  try {
    await compressVideo(originalPath, compressedPath);

    // Remove o vídeo original após compressão
    fs.unlinkSync(originalPath);

    res.json({
      message: "Upload e compressão bem-sucedidos.",
      filePath: `http://192.168.1.100:${PORT}/uploads/compressed-${req.file.filename}`,
    });
  } catch (error) {
    console.error("Erro no upload/compressão:", error.message);
    res.status(500).json({ error: "Erro ao comprimir o vídeo." });
  }
});

// Rota para Listar Vídeos
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
  console.log(`🚀 Servidor rodando em: http://192.168.1.100:${PORT}`);
});
