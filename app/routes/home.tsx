import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getPracticeData, recordSuccess, recordFailure, changeTrick, markChallengeCompleted, getKendamaDate, type PracticeData, TRICKS, type Trick } from "../utils/localStorage";
import { getGradeById, getNextGrade } from "../data/grades";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "けん玉練習アプリ" },
    { name: "description", content: "けん玉の練習を記録しよう" },
  ];
}

// 日付ベースのシンプルなハッシュ関数
function getDailyChallenge() {
  const today = getKendamaDate();
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const trickIndex = hash % TRICKS.length;
  const trick = TRICKS[trickIndex];
  
  // 目標回数（3〜10回）
  const target = 3 + (hash % 8);
  
  return {
    name: '今日のチャレンジ',
    description: trick,
    trick,
    target,
  };
}

export default function Home() {
  const [data, setData] = useState<PracticeData>({
    currentTrick: '大皿',
    currentGrade: null,
    clearedGrades: {},
    dailyRecords: {},
    updatedAt: Date.now(),
  });

  useEffect(() => {
    setData(getPracticeData());
  }, []);

  const todayChallenge = getDailyChallenge();
  const todayRecord = data.dailyRecords[getKendamaDate()];
  const challengeProgress = todayRecord?.tricks[todayChallenge.trick]?.totalSuccess || 0;
  const isChallengeCompleted = challengeProgress >= todayChallenge.target;
  
  const currentGrade = data.currentGrade ? getGradeById(data.currentGrade) : null;
  const nextGrade = data.currentGrade ? getNextGrade(data.currentGrade) : getGradeById('10');
  const canChallenge = !data.currentGrade || !!data.clearedGrades[data.currentGrade];
  
  const handleSuccess = () => {
    changeTrick(todayChallenge.trick);
    const newData = recordSuccess();
    setData(newData);
    
    // チャレンジ達成チェック
    const updatedRecord = newData.dailyRecords[getKendamaDate()];
    const updatedProgress = updatedRecord?.tricks[todayChallenge.trick]?.totalSuccess || 0;
    if (updatedProgress >= todayChallenge.target && !updatedRecord?.challengeCompleted) {
      const completedData = markChallengeCompleted();
      setData(completedData);
    }
  };
  
  const handleFailure = () => {
    changeTrick(todayChallenge.trick);
    const newData = recordFailure();
    setData(newData);
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">ホーム 🏠</h1>
      </header>
      
      <div className="content">
        {/* 今日のチャレンジカード */}
        <div className="home-card challenge-card">
          <h2 className="home-card-title">{todayChallenge.name}</h2>
          <p className="home-card-description">{todayChallenge.description}</p>
          <div className="challenge-progress-bar">
            <div 
              className="challenge-progress-fill"
              style={{ width: `${Math.min(100, (challengeProgress / todayChallenge.target) * 100)}%` }}
            />
          </div>
          <p className="challenge-progress-text">
            <strong>{challengeProgress}/{todayChallenge.target}回</strong> 成功
            {isChallengeCompleted && ' ✓'}
          </p>
          
          {!isChallengeCompleted && (
            <div className="challenge-buttons">
              <button 
                className="challenge-button success"
                onClick={handleSuccess}
                type="button"
              >
                ✓ 成功
              </button>
              <button 
                className="challenge-button failure"
                onClick={handleFailure}
                type="button"
              >
                × 失敗
              </button>
            </div>
          )}
        </div>

        {/* 検定に挑戦カード */}
        {nextGrade && (
          <Link 
            to={canChallenge ? `/grades/${nextGrade.id}` : '/grades'} 
            className={`home-card exam-card ${!canChallenge ? 'disabled' : ''}`}
          >
            <h2 className="home-card-title">検定に挑戦</h2>
            <p className="home-card-grade">{nextGrade.name}</p>
            {!canChallenge && (
              <p className="home-card-note">現在の級をクリアしてください</p>
            )}
          </Link>
        )}
      </div>
      
      <nav className="tab-bar">
        <Link to="/" className="tab-item active">
          <span className="tab-icon">🏠</span>
          <span className="tab-label">ホーム</span>
        </Link>
        <Link to="/grades" className="tab-item">
          <span className="tab-icon">🏆</span>
          <span className="tab-label">級・段</span>
        </Link>
        <Link to="/tricks" className="tab-item">
          <span className="tab-icon">🪀</span>
          <span className="tab-label">技</span>
        </Link>
        <Link to="/history" className="tab-item">
          <span className="tab-icon">📋</span>
          <span className="tab-label">履歴</span>
        </Link>
        <Link to="/settings" className="tab-item">
          <span className="tab-icon">⚙️</span>
          <span className="tab-label">設定</span>
        </Link>
      </nav>
    </div>
  );
}
