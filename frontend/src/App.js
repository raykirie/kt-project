import React, { useState, useEffect } from 'react';
import axios from 'axios';
import URLList from './components/URLList';
import DownloadStatus from './components/DownloadStatus';
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const initialContent = localStorage.getItem('downloadedContent')
      ? JSON.parse(localStorage.getItem('downloadedContent'))
      : [];

  const [downloadedContent, setDownloadedContent] = useState(initialContent);
  const [viewingContent, setViewingContent] = useState(null);
  const [ws, setWs] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSize, setDownloadSize] = useState(0);
  const [receivedSize, setReceivedSize] = useState(0);

  useEffect(() => {
    localStorage.setItem('downloadedContent', JSON.stringify(downloadedContent));
  }, [downloadedContent]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socket.onopen = (event) => {
      console.log('WebSocket opened:', event);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'downloadProgress':
          setDownloadProgress(data.payload.progress);
          setDownloadSize(data.payload.totalSize);
          setReceivedSize(data.payload.receivedSize);
          break;

        case 'downloadComplete':
          setDownloadedContent(prevContent => [{url: data.payload.url, content: data.payload.content}, ...prevContent]);
          break;

        case 'downloadError':
          console.error(data.payload.error);
          break;

        default:
          break;
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event);
    };

    setWs(socket);

  }, [downloadedContent, selectedUrl]);

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };

  const fetchUrls = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/urls', { params: { keyword } });
      setUrlList(response.data);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      alert("Ошибка при загрузке URL-ов");
    }
  };

  const handleUrlSelection = (url) => {
    setSelectedUrl(url);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'startDownload',
        payload: url
      }));
    }
  };

  const viewContent = (content) => {
    setViewingContent(content);
  };

  return (
      <div className="App">
        <div className="search-section">
          <input
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="Введите ключевое слово..."
          />
          <button onClick={fetchUrls}>Искать</button>
        </div>

        <URLList urls={urlList} onSelect={handleUrlSelection} />

        {selectedUrl && (
            <DownloadStatus
                status={{
                  url: selectedUrl,
                  downloadProgress,
                  downloadSize,
                  receivedSize
                }}
            />
        )}

        <div className="downloaded-content-section">
          <h2>Загруженный контент</h2>
          <ul>
            {viewingContent && (
                <div>
                  <h3>Просмотр контента:</h3>
                  <pre>{viewingContent}</pre>
                  <button onClick={() => setViewingContent(null)}>Закрыть</button>
                </div>
            )}

            {downloadedContent.map((item, index) => (
                <li key={index}>
                  {item.url}
                  <button onClick={() => viewContent(item.content)} disabled={!!viewingContent}>
                    Просмотр
                  </button>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}

export default App;
