import React, { useState } from "react";
import axios from "axios";

interface UploadResponse {
  filePath: string;
}

const VideoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post<UploadResponse>(
        "http://localhost:3333/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setVideoUrl(response.data.filePath);
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  return (
    <div>
      <h2>Upload de Vídeo</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Enviar Vídeo</button>
      {videoUrl && (
        <div>
          <h3>Vídeo Enviado:</h3>
          <video controls width="400">
            <source src={videoUrl} type="video/mp4" />
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
