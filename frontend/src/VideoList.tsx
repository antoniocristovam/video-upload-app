import React, { useEffect, useState } from "react";
import axios from "axios";

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get<string[]>(
          "http://localhost:3333/videos"
        );
        setVideos(response.data);
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h2>Lista de Vídeos</h2>
      {loading ? (
        <p>Carregando vídeos...</p>
      ) : videos.length > 0 ? (
        <div>
          {videos.map((videoUrl, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <h4>Vídeo {index + 1}</h4>
              <video controls width="400">
                <source src={videoUrl} type="video/mp4" />
                Seu navegador não suporta reprodução de vídeo.
              </video>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum vídeo disponível no momento.</p>
      )}
    </div>
  );
};

export default VideoList;
