import "./App.css";
import VideoList from "./VideoList";
import VideoUpload from "./VideoUpload";

function App() {
  return (
    <div>
      <h1>Upload e Reprodução de Vídeos</h1>
      <VideoUpload />
      <hr />
      <VideoList />
    </div>
  );
}

export default App;
