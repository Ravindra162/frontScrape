import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  const [news, setNews] = useState([]);
  const [recentStoriesCount, setRecentStoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const notifyReceived = () => toast("Latest news received");
  const notify=() => toast("News updated")

  useEffect(() => {
    let ws = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket("ws://localhost:3001/");

        ws.onopen = () => {
          console.log("WebSocket connected");
          setWsConnected(true);
          reconnectAttempts = 0;
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setWsConnected(false);
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
            setTimeout(connectWebSocket, reconnectDelay);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("WebSocket connection error");
        };

        ws.onmessage = (message) => {
          
          try {
            notify();
            const data = JSON.parse(message.data);
            if (data.type === "initial" || data.type === "update") {

              setRecentStoriesCount(data.recentStoriesCount);
              if (Array.isArray(data.recentStories)) {
                
                setNews(data.recentStories);
                
              }
            }
          } catch (err) {
            console.error("WebSocket message error:", err);
          }
        };
      } catch (err) {
        console.error("WebSocket connection error:", err);
        setError("Failed to establish WebSocket connection");
      }
    };

    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:3001/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setNews(data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setNews([]);
      }
    };

    // Initial fetch
    fetchNews();
    
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []); 
  if (loading) return <div className="text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
        Latest News
      </h1>
      <div className="flex justify-center items-center gap-2 mb-6">
        <p className="text-center text-gray-700">
          {recentStoriesCount} stories added in the last 5 minutes
        </p>
        <span 
          className={`inline-block w-2 h-2 rounded-full ${
            wsConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={wsConnected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <ul className="space-y-4">
        {Array.isArray(news) && news.length > 0 ? (
          news.map((item, index) => (
            <li
              key={index}
              className="bg-white shadow-md p-4 rounded-md border border-gray-200"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-500 hover:underline font-medium"
              >
                {item.title}
              </a>
              <span className="block text-sm text-gray-500 mt-1">
                ({item.domain || "Unknown"})
              </span>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500">No news items available</li>
        )}
      </ul>
      <ToastContainer
position="top-center"
autoClose={2000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="colored"
transition={Bounce}
/>
    </div>
  );
};

export default App;