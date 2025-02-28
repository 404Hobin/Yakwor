import React, { useState, useEffect, useRef } from "react";
import "../styles/WordPractice.css"; // CSS 파일명 변경

function WordPractice({ isDarkMode }) {
  const initialWordList = [
    { word: "결과", abbreviation: "ㄱㅗㅏㅋ" },
    { word: "안으로 ", abbreviation: "ㄴ-ㅋㄹㅇ" },
    { word: "판단", abbreviation: "ㅍㄷㅏㄴ" },
    { word: "지방", abbreviation: "ㅂㅈ-ㅇ" },
    { word: "사용", abbreviation: "ㅅ-ㅇ" },
    { word: "정치", abbreviation: "ㅈ-ㅊㅋ" },
    { word: "놓고 ", abbreviation: "ㄴㅎㅗㄱ" },
    { word: "언론", abbreviation: "ㄴ-ㅋㄴㄹ" },
    { word: "시장", abbreviation: "ㅅ-ㅇㅈ" },
    { word: "대기업", abbreviation: "ㄷㄱㅣㅂ" },
    { word: "가장 ", abbreviation: "ㄱ-ㅇㅈ" },
    { word: "피해", abbreviation: "ㅍㅣㅎ" },
    { word: "기본", abbreviation: "ㄱ-ㄴㅂ" },
    { word: "자동차", abbreviation: "ㄷㅈㅗㅊ" },
    { word: "더욱 ", abbreviation: "ㄷㅜㅋㄱ" },
    { word: "개혁", abbreviation: "ㄱㅎ" },
    { word: "기술", abbreviation: "ㅅㄱㅜㄹ" },
    { word: "선택", abbreviation: "ㅅ-ㅌㄱ" },
    { word: "학생", abbreviation: "ㄱㅎ-ㅅㅇ" },
    { word: "따라서 ", abbreviation: "ㄷㄹ-ㅋㅅ" },
    { word: "효과", abbreviation: "ㅎㅗㅡㄱ" },
    { word: "위협", abbreviation: "-ㅎㅋㅂ" },
    { word: "어느 때", abbreviation: "ㄴㅡㅋㄷ" },
    { word: "하루", abbreviation: "ㅎ-ㄹ" },
    { word: "자신", abbreviation: "ㅈ-ㄴㅅ" },
    { word: "현실", abbreviation: "ㅅㅎㅣㄹ" },
    { word: "마찬가지", abbreviation: "ㅈㅁ-ㄱㅈ" },
    { word: "공동", abbreviation: "ㄷㄱㅗㅇ" },
    { word: "사실", abbreviation: "ㅅㅣㅋㄹ" },
    { word: "시작", abbreviation: "ㅅ-ㄱㅈ" },
    { word: "청와대", abbreviation: "ㅊㅗㅏㅋㄷ" },
    { word: "총리", abbreviation: "ㅊ-ㅋㄹ" },
  ];

  const [wordList] = useState(initialWordList);
  const [currentWord, setCurrentWord] = useState("");
  const [currentAbbreviation, setCurrentAbbreviation] = useState("");
  const [inputWord, setInputWord] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [correctWords, setCorrectWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [wrongCount, setWrongCount] = useState({});

  const inputRef = useRef(null);
  const inputValueRef = useRef("");
  const answerCheckedRef = useRef(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputKey]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && currentWord) {
      showAnswer();
    }
  }, [timeLeft, gameOver, currentWord]);

  useEffect(() => {
    if (wordList.length > 0 && !gameOver) {
      getNextWord();
    }
  }, [wordList, gameOver]);

  const getNextWord = () => {
    const remainingWords = wordList.filter(
      (word) =>
        !correctWords.includes(word.word) && // 정답 맞춘 약어 제외
        word.word !== currentWord // 현재 약어도 제외
    );

    if (remainingWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingWords.length);
      const next = remainingWords[randomIndex];
      setCurrentWord(next.word);
      setCurrentAbbreviation(next.abbreviation);
      setTimeLeft(10);
      answerCheckedRef.current = false;
      setIsCorrect(null);
      setInputWord("");
      setInputKey((prev) => prev + 1);
    } else {
      setGameOver(true);
      setCurrentWord("");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputWord(value);
    inputValueRef.current = value;

    const cleanValue = value.replace(/\s/g, "");
    const cleanTarget = currentWord.replace(/\s/g, "");
    if (cleanValue.length === cleanTarget.length && cleanValue.length > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (!answerCheckedRef.current) {
          showAnswer();
        }
      }, 100);
    }
  };

  const showAnswer = () => {
    if (!currentWord || answerCheckedRef.current) return;
    answerCheckedRef.current = true;

    const cleanedInput = inputValueRef.current.replace(/\s/g, "");
    const cleanedCurrent = currentWord.replace(/\s/g, "");
    const elapsedTime = 10 - timeLeft;

    if (cleanedInput !== cleanedCurrent) {
      setIsCorrect(false);
      setIncorrectWords((prev) => [
        ...prev,
        {
          word: currentWord,
          abbreviation: currentAbbreviation,
          time: elapsedTime,
        },
      ]);
      setWrongCount((prev) => ({
        ...prev,
        [currentWord]: (prev[currentWord] || 0) + 1,
      }));

      setTimeout(() => {
        setIsCorrect(null);
        getNextWord();
      }, 3000);
    } else {
      setIsCorrect(true);
      setCorrectWords((prev) => [...prev, currentWord]);
      getNextWord();
    }

    setInputWord("");
    setInputKey((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentWord("");
    setCurrentAbbreviation("");
    setInputWord("");
    setInputKey(0);
    setTimeLeft(10);
    setIncorrectWords([]);
    setCorrectWords([]);
    setIsCorrect(null);
    setGameOver(false);
    setWrongCount({});
  };

  return (
    <div className={`word-practice-container ${isDarkMode ? "dark-mode" : ""}`}>
      <h1 className="title" style={{ marginBottom: "5px" }}>
        약어 연습장
      </h1>
      <h3 className="timer" style={{ marginTop: "0px" }}>
        남은 시간: {timeLeft}초
      </h3>

      {!gameOver && (
        <>
          <h3 className="remaining-words">
            남은 약어:{" "}
            {
              wordList.filter((word) => !correctWords.includes(word.word))
                .length
            }
          </h3>
          <h2 className="current-word">{currentWord}</h2>
          <input
            key={inputKey}
            ref={inputRef}
            type="text"
            value={inputWord}
            onChange={handleInputChange}
            className="input-box"
            placeholder="약어를 입력하세요..."
          />
          <button className="submit-button" onClick={showAnswer}>
            정답 확인
          </button>
          <div
            className="message-container"
            style={{ height: "24px", marginTop: "5px" }}
          >
            {isCorrect === false && (
              <h3 className="incorrect">
                틀렸습니다. 정답: {currentAbbreviation}
              </h3>
            )}
            {isCorrect === true && <h3 className="correct">정답입니다!</h3>}
          </div>
        </>
      )}

      {gameOver && (
        <div className="results-container">
          <h2 className="result-title">틀린 약어 목록</h2>
          {incorrectWords.length === 0 ? (
            <p className="perfect-message">모든 약어를 맞췄습니다! 🎉</p>
          ) : (
            <div className="incorrect-list">
              {Object.entries(wrongCount).map(([word, count]) => {
                const entry = incorrectWords.find((e) => e.word === word);
                return (
                  <div key={word} className="incorrect-item">
                    <span className="word">{word}</span>
                    <span className="abbreviation">({entry.abbreviation})</span>
                    <span className="time">- {entry.time}초</span>
                    <span className="count">({count}회)</span>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={handleRestart} className="restart-button">
            다시 시작하기
          </button>
        </div>
      )}
    </div>
  );
}

export default WordPractice;
