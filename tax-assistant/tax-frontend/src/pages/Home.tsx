 import { useState, useEffect } from "react";
import "./Home.css";

type NewsItem = {
  title: string;
  link: string;
  date: string;
};

function Home() {
  const [running, setRunning] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [videos, setVideos] = useState<{title:string, url:string}[]>([]);


  const toggleRules = () => {
    setRunning(!running);
  };

  useEffect(() => {
    fetch("http://localhost:5000/rss")
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
  fetch("http://localhost:5000/videos")
    .then(res => res.json())
    .then(data => setVideos(data))
    .catch(err => console.error(err));
}, []);


  return (
    <div className="home-container">

      {/* Rules Section */}
      <div className="rules-container">
        <div className={"rules-scroll " + (running ? "running" : "paused")}>
          <p>1. New Tax Regime is Default...</p>
          <p>2. Tax Rebate Limit...</p>
          <p>3. Standard Deduction available for salaried employees...</p>
    <p>4. Senior citizens get higher exemption limit...</p>
    <p>5. PAN must be linked with Aadhaar...</p>
    <p>6. Late filing attracts penalty under section 234F...</p>
    <p>7. Advance tax payment required if liability exceeds ₹10,000...</p>
    <p>8. Digital Signature Certificate mandatory for audit cases...</p>

          {/* बाकी rules */}
        </div>
        <button className="toggle-btn" onClick={toggleRules}>
          {running ? "⏸" : "▶"}
        </button>
      </div>

      {/* Latest Updates Section */}
      <div className="updates-section">
        <div className="section-header">
          <h2>Latest Updates</h2>
          <div className="header-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            
          </div>
        </div>

        <div className="updates-grid">
          {news.length > 0 ? (
            news.slice(0, 4).map((item, index) => (
              <div className="update-card" key={index}>
                <div className="card-top">
                  <span>Date : {item.date}</span>
                  <span className="tag news">News</span>
                </div>
                <p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </p>
              </div>
            ))
          ) : (
            <p>Loading latest tax updates...</p>
          )}
        </div>

        <div className="view-all">
          <a href="#">View All →</a>
        </div>
      </div>

      {/* Things To Know Section */}
      <div className="things-to-know">
        <div className="section-header">
          <h2>Things To Know</h2>
        </div>

        <div className="tk-tabs">
          <span className="tk-tab active">How to ... Videos</span>
          <span className="tk-tab">Awareness Videos</span>
          <span className="tk-tab">Brochures</span>
        </div>

           <div className="tk-video-grid">
  {videos.map((video, index) => (
    <div className="video-item" key={index}>
      <div className="video-thumb">
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          <div className="play-placeholder">▶</div>
        </a>
      </div>
      <div className="video-info">
        <p>{video.title} 🔗</p>
      </div>
    </div>
  ))}
</div>


  <div className="video-item">
    <div className="video-thumb">
      <a href="https://www.youtube.com/watch?v=6oZkZkYwF9k" target="_blank" rel="noopener noreferrer">
        <div className="play-placeholder">▶</div>
      </a>
    </div>
    <div className="video-info">
      <p>Penalty & Prosecution Provisions 🔗</p>
    </div>
  </div>

  <div className="video-item">
    <div className="video-thumb">
      <a href="https://www.youtube.com/watch?v=8oZkZkYwF9m" target="_blank" rel="noopener noreferrer">
        <div className="play-placeholder">▶</div>
      </a>
    </div>
    <div className="video-info">
      <p>Major Changes in IT Act 2025 🔗</p>
    </div>
  </div>

  <div className="video-item">
    <div className="video-thumb">
      <a href="https://www.youtube.com/watch?v=9oZkZkYwF9n" target="_blank" rel="noopener noreferrer">
        <div className="play-placeholder">▶</div>
      </a>
    </div>
    <div className="video-info">
      <p>Samvaad – Awareness Series 🔗</p>
    </div>
  </div>
</div>

        <div className="view-all">
          <a href="#">View All →</a>
        </div>
      </div>
    
  );
}

export default Home;