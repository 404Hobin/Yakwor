// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WordPractice from "./components/WordPractice";
import Notepad from "./components/Notepad";
import HwpManager from "./components/HwpManager";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.body.className = isDarkMode ? "dark-mode" : "";
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`App ${isDarkMode ? "dark-mode" : ""}`}>
        <header className="header">
          <Link to="/" className="header-link">
            <h1>Shorthand Program</h1>
          </Link>
          <button
            className="dark-mode-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>
        </header>

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="feature-card">
                    <Link to="/word-practice">
                      <h2>약어 연습장</h2>
                      <p>약어를 빠르게 입력하는 연습을 해보세요.</p>
                    </Link>
                  </div>
                  <div className="feature-card">
                    <Link to="/notepad">
                      <h2>메모장</h2>
                      <p>단어 목록을 추가, 수정, 삭제할 수 있습니다.</p>
                    </Link>
                  </div>
                  <div className="feature-card">
                    <Link to="/hwpmanager">
                      <h2>통계 확인</h2>
                      <p>연습 결과를 통계로 확인해보세요.</p>
                    </Link>
                  </div>
                  <div className="feature-card">
                    <h2>설정</h2>
                    <p>테마, 음성 속도 등을 설정할 수 있습니다.</p>
                  </div>
                </>
              }
            />
            <Route
              path="/word-practice"
              element={<WordPractice isDarkMode={isDarkMode} />}
            />
            <Route path="/notepad" element={<Notepad />} />
            <Route
              path="/hwpmanager"
              element={<HwpManager isDarkMode={isDarkMode} />}
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>
            &copy; 2023 Shorthand Program. All rights reserved.
            <a
              href="https://github.com/shorthand-program"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/shorthand_program"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
