import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const NotepadContainer = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  gap: 1rem;
  background: var(--background);
  color: var(--text-primary);
  padding: 1rem;
  box-sizing: border-box;
`;

const DocumentPanel = styled.div`
  flex: 0 0 35%;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const NotepadArea = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
`;

const DocumentList = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.2rem 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const DocumentItem = styled.div`
  position: relative; // 추가
  z-index: 1; // 추가
  height: 60px;
  padding: 0 0.8rem;
  margin: 0.2rem 0;
  cursor: pointer;
  border-radius: 8px;
  background: ${({ isActive }) =>
    isActive ? "var(--primary)" : "transparent"};
  border: 1px solid var(--border-color);
  color: ${({ isActive }) =>
    isActive ? "var(--button-text)" : "var(--text-primary)"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    background: ${({ isActive }) =>
      isActive ? "var(--primary)" : "rgba(0, 0, 0, 0.05)"};
  }
`;

const DocumentTitle = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  font-family: "Noto Sans KR", sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ active }) =>
    active ? "var(--primary)" : "var(--button-bg)"};
  color: ${({ active }) =>
    active ? "var(--button-text)" : "var(--text-primary)"};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    color: var(--button-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InlineControls = styled.div`
  display: ${({ show }) => (show ? "flex" : "none")};
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
  margin-left: 0.5rem;
  position: relative; // 추가
  z-index: 2; // 추가
`;

const ControlButton = styled.button`
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 6px;
  background: ${({ isActive }) =>
    isActive ? "var(--primary)" : "transparent"};
  color: ${({ isActive }) =>
    isActive ? "var(--button-text)" : "var(--text-primary)"};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-size: 0.9rem;

  &:hover {
    background: ${({ isActive }) =>
      isActive ? "var(--primary-hover)" : "rgba(0, 0, 0, 0.1)"};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ResultText = styled.div`
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--input-bg);
  border-radius: 8px;
  letter-spacing: 0.5px;
`;

function Notepad() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [nowPlayingId, setNowPlayingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/practiceFiles.json")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        setDocuments(sortedData);
      });
    return () => {
      if (audioPlayer instanceof HTMLAudioElement) {
        audioPlayer.pause();
        audioPlayer.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (selectedDoc) textAreaRef.current?.focus();
  }, [selectedDoc]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = documents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleSelectDocument = (doc) => {
    setSelectedDoc(doc);
    setUserInput("");
    setNowPlayingId(doc.id);

    if (audioPlayer instanceof HTMLAudioElement) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    if (doc.mp3Path) {
      const newAudio = new Audio(process.env.PUBLIC_URL + doc.mp3Path);
      newAudio.play().catch(console.error);
      setAudioPlayer(newAudio);
    }

    textAreaRef.current?.focus();
  };

  const togglePlayPause = () => {
    if (audioPlayer instanceof HTMLAudioElement) {
      audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
      setAudioPlayer(audioPlayer);
    }
  };

  const skipTime = (seconds) => {
    if (audioPlayer instanceof HTMLAudioElement) {
      audioPlayer.currentTime += seconds;
    }
  };

  const compareTextAdvanced = () => {
    if (!selectedDoc || !selectedDoc.content) {
      alert("문서를 먼저 선택해주세요!");
      return;
    }

    try {
      const original = selectedDoc.content.replace(/\s+/g, " ").trim();
      const user = userInput.replace(/\s+/g, " ").trim();

      const originalWords = original.split(" ");
      const userWords = user.split(" ");
      const diff = [];

      let 탈자 = 0,
        첨자 = 0,
        오자 = 0,
        correct = 0;
      let i = 0,
        j = 0;

      // 개선된 비교 알고리즘
      while (i < originalWords.length || j < userWords.length) {
        const origWord = originalWords[i] || "";
        const userWord = userWords[j] || "";

        if (origWord === userWord) {
          diff.push({ type: "correct", word: origWord });
          correct++;
          i++;
          j++;
        }
        // 약어 누락 (탈자)
        else if (userWord === "") {
          diff.push({ type: "탈자", word: origWord });
          탈자++;
          i++;
        }
        // 약어 추가 (첨자)
        else if (origWord === "") {
          diff.push({ type: "첨자", word: userWord });
          첨자++;
          j++;
        }
        // 불일치 시 최대 3약어 앞까지 탐색
        else {
          let foundMatch = false;
          for (let lookAhead = 1; lookAhead <= 3; lookAhead++) {
            if (
              i + lookAhead < originalWords.length &&
              originalWords[i + lookAhead] === userWord
            ) {
              for (let k = 0; k < lookAhead; k++) {
                diff.push({ type: "탈자", word: originalWords[i + k] });
                탈자++;
              }
              i += lookAhead;
              foundMatch = true;
              break;
            }
          }
          if (!foundMatch) {
            const index = userWord.indexOf(origWord);
            if (index !== -1) {
              // 단일 엔트리로 처리
              diff.push({
                type: "correct-with-additions",
                userWord,
                origWord,
                prefix: userWord.slice(0, index),
                suffix: userWord.slice(index + origWord.length),
              });
              correct++;
              if (index > 0) 첨자++;
              if (userWord.length > index + origWord.length) 첨자++;
            } else {
              diff.push({ type: "오자", userWord, origWord });
              오자++;
            }
            i++;
            j++;
          }
        }
      }

      setComparisonResult({
        diff,
        stats: {
          total: originalWords.length + 첨자, // 약어 수 기준
          탈자,
          첨자,
          오자,
          accuracy: ((correct / originalWords.length) * 100).toFixed(2),
        },
      });
      setShowModal(true);
    } catch (error) {
      console.error("채점 오류:", error);
      alert("채점 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <NotepadContainer>
      <DocumentPanel>
        <h2
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.1rem",
            padding: "0.5rem 0",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          연습 문서 목록
        </h2>
        <DocumentList>
          {currentItems.map((doc) => (
            <DocumentItem
              key={doc.id}
              isActive={selectedDoc?.id === doc.id}
              onClick={() => handleSelectDocument(doc)}
            >
              <DocumentTitle>{doc.title}</DocumentTitle>
              <InlineControls show={nowPlayingId === doc.id}>
                <ControlButton
                  isActive={selectedDoc?.id === doc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(-10);
                  }}
                  title="10초 뒤로"
                >
                  ⏪
                </ControlButton>
                <ControlButton
                  isActive={selectedDoc?.id === doc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  title={audioPlayer?.paused ? "재생" : "일시정지"}
                >
                  {audioPlayer?.paused ? "▶" : "⏸"}
                </ControlButton>
                <ControlButton
                  isActive={selectedDoc?.id === doc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(10);
                  }}
                  title="10초 앞으로"
                >
                  ⏩
                </ControlButton>
              </InlineControls>
            </DocumentItem>
          ))}
        </DocumentList>

        <Pagination>
          <PageButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </PageButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <PageButton
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              active={currentPage === i + 1}
            >
              {i + 1}
            </PageButton>
          ))}
          <PageButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </PageButton>
        </Pagination>
      </DocumentPanel>

      <NotepadArea>
        <TextArea
          ref={textAreaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="음성을 듣고 내용을 입력하세요..."
          autoFocus
        />

        <ControlButton
          onClick={compareTextAdvanced}
          disabled={!selectedDoc}
          style={{
            alignSelf: "flex-end",
            marginTop: "1rem",
            background: "var(--primary)",
            color: "var(--button-text)",
          }}
        >
          채점
        </ControlButton>

        {showModal && comparisonResult && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <h2>채점 결과</h2>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  margin: "1rem 0",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span>전체 글자: {comparisonResult.stats.total}</span>
                <span style={{ color: "var(--incorrect)" }}>
                  탈자: {comparisonResult.stats.탈자}
                </span>
                <span style={{ color: "var(--correct)" }}>
                  첨자: {comparisonResult.stats.첨자}
                </span>
                <span style={{ color: "var(--primary)" }}>
                  오자: {comparisonResult.stats.오자}
                </span>
                <span
                  style={{
                    color: `hsl(${
                      comparisonResult.stats.accuracy * 1.2
                    }, 70%, 40%)`,
                    fontWeight: "bold",
                  }}
                >
                  정확도: {comparisonResult.stats.accuracy}%
                </span>
              </div>

              <ResultText>
                {comparisonResult.diff.map((item, idx) => {
                  switch (item.type) {
                    case "correct":
                      return <span key={idx}>{item.word} </span>;
                    case "오자":
                      return (
                        <span key={idx} style={{ color: "var(--primary)" }}>
                          {item.userWord}
                          <span
                            style={{
                              fontSize: "0.8em",
                              color: "var(--text-secondary)",
                            }}
                          >
                            ({item.origWord})
                          </span>{" "}
                        </span>
                      );
                    case "correct-with-additions": // 새로운 타입 처리
                      return (
                        <span key={idx}>
                          {item.prefix && (
                            <span style={{ color: "var(--correct)" }}>
                              {item.prefix}
                            </span>
                          )}
                          <span>{item.origWord}</span>
                          {item.suffix && (
                            <span style={{ color: "var(--correct)" }}>
                              {item.suffix}
                            </span>
                          )}{" "}
                        </span>
                      );
                    case "탈자":
                      return (
                        <span
                          key={idx}
                          style={{
                            color: "var(--incorrect)",
                            textDecoration: "line-through",
                          }}
                        >
                          {item.word + " "}
                        </span>
                      );
                    default:
                      return null;
                  }
                })}
              </ResultText>
            </ModalContent>
          </ModalOverlay>
        )}
      </NotepadArea>
    </NotepadContainer>
  );
}

export default Notepad;
