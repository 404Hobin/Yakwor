import React, { useState, useEffect } from "react";
import styled from "styled-components";

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
`;

const DocumentList = styled.div`
  width: 1500px;
  margin-top: 2rem;
  background: ${({ theme }) => theme.listBg};
  border-radius: 8px;
  padding: 2rem;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  transition: background 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.hoverBg};
  }

  &.favorite {
    background: ${({ theme }) => theme.favoriteBg};
  }
`;

const DetailView = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Pagination = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const ArrowIcon = styled.div`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

  &.left {
    left: 2rem;
  }

  &.right {
    right: 2rem;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

// 테마 설정
const themes = {
  light: {
    cardBg: "#ffffff",
    listBg: "#f8f9fa",
    textPrimary: "#2c3e50",
    borderColor: "#dee2e6",
    hoverBg: "#e9ecef",
    favoriteBg: "#fff3cd",
  },
  dark: {
    cardBg: "#2d2d2d",
    listBg: "#3a3a3a",
    textPrimary: "#e0e0e0",
    borderColor: "#4a4a4a",
    hoverBg: "#4d4d4d",
    favoriteBg: "#4a3c20",
  },
};

function HwpManager({ isDarkMode }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentIndex = documents.findIndex((doc) => doc.id === selectedDoc?.id);
  const currentTheme = isDarkMode ? themes.dark : themes.light;

  // 데이터 로드
  useEffect(() => {
    fetch("/data/practiceFiles.json")
      .then((res) => res.json())
      .then((data) => setDocuments(data));
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id);
    setFavorites(newFavorites);
  };

  // 문서 네비게이션
  const handleNavigation = (direction) => {
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < documents.length) {
      setSelectedDoc(documents[newIndex]);
    }
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedDoc) {
        if (e.key === "ArrowLeft") handleNavigation("prev");
        if (e.key === "ArrowRight") handleNavigation("next");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDoc, currentIndex]);

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = documents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Container style={{ color: currentTheme.textPrimary }}>
      {selectedDoc && (
        <DetailView theme={currentTheme}>
          <button
            onClick={() => setSelectedDoc(null)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>

          {currentIndex > 0 && (
            <ArrowIcon
              className="left"
              onClick={() => handleNavigation("prev")}
              theme={currentTheme}
            >
              ←
            </ArrowIcon>
          )}

          {currentIndex < documents.length - 1 && (
            <ArrowIcon
              className="right"
              onClick={() => handleNavigation("next")}
              theme={currentTheme}
            >
              →
            </ArrowIcon>
          )}

          <h2>{selectedDoc.title}</h2>
          <div
            style={{
              whiteSpace: "pre-wrap",
              marginTop: "1rem",
              lineHeight: "1.8",
              padding: "0.5rem 0",
            }}
          >
            {selectedDoc.content.split("\n").map((paragraph, index) => (
              <p key={index} style={{ marginBottom: "1.2rem" }}>
                {paragraph}
              </p>
            ))}
          </div>
        </DetailView>
      )}

      <DocumentList theme={currentTheme}>
        {currentItems.map((doc) => (
          <ListItem
            key={doc.id}
            theme={currentTheme}
            className={favorites.has(doc.id) ? "favorite" : ""}
            onClick={() => setSelectedDoc(doc)}
          >
            <div>
              <h3>{doc.title}</h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(doc.id);
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {favorites.has(doc.id) ? "★" : "☆"}
            </button>
          </ListItem>
        ))}
      </DocumentList>

      <Pagination>
        {Array.from(
          { length: Math.ceil(documents.length / itemsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                background: currentPage === i + 1 ? "#007bff" : "none",
                color: currentPage === i + 1 ? "white" : "inherit",
                border: "1px solid #ddd",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
              }}
            >
              {i + 1}
            </button>
          )
        )}
      </Pagination>
    </Container>
  );
}

export default HwpManager;
