import type { Route } from "./+types/tricks";
import { useState, useEffect } from "react";
import { getPracticeData, recordSuccess, recordFailure, changeTrick, getKendamaDate, type PracticeData, type Trick } from "../utils/localStorage";
import { TRICKS } from "../utils/localStorage";
import { TabBar } from "../components/TabBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "技一覧 - けん玉練習アプリ" },
    { name: "description", content: "けん玉の技一覧" },
  ];
}

export default function Tricks() {
  const [data, setData] = useState<PracticeData>({
    currentTrick: '大皿',
    currentGrade: null,
    clearedGrades: {},
    dailyRecords: {},
    updatedAt: Date.now(),
  });
  
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);

  useEffect(() => {
    setData(getPracticeData());
  }, []);

  // 各技の統計を集計
  const getTrickStats = (trick: Trick) => {
    let totalSuccess = 0;
    let maxStreak = 0;
    let todaySuccess = 0;
    let todayStreak = 0;

    const dates = Object.keys(data.dailyRecords).sort().reverse();
    const today = getKendamaDate();
    
    for (const date of dates) {
      const record = data.dailyRecords[date].tricks[trick];
      if (record) {
        totalSuccess += record.totalSuccess;
        maxStreak = Math.max(maxStreak, record.streak);
        
        // 今日の記録
        if (date === today) {
          todaySuccess = record.totalSuccess;
          todayStreak = record.streak;
        }
      }
    }

    return { totalSuccess, maxStreak, todaySuccess, todayStreak };
  };
  
  const handleTrickClick = (trick: Trick) => {
    setSelectedTrick(trick);
  };
  
  const handleSuccess = () => {
    if (selectedTrick) {
      changeTrick(selectedTrick);
      const newData = recordSuccess();
      setData(newData);
    }
  };
  
  const handleFailure = () => {
    if (selectedTrick) {
      changeTrick(selectedTrick);
      const newData = recordFailure();
      setData(newData);
    }
  };
  
  const closeModal = () => {
    setSelectedTrick(null);
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">技一覧 🪀</h1>
      </header>
      
      <div className="content">
        <div className="tricks-list">
          {TRICKS.map((trick) => {
            const stats = getTrickStats(trick);
            
            return (
              <button
                key={trick}
                className="trick-item"
                onClick={() => handleTrickClick(trick)}
                type="button"
              >
                <div className="trick-header">
                  <h3 className="trick-name">{trick}</h3>
                  <div className="trick-stats-inline">
                    <span className="trick-stat-inline">成功 {stats.todaySuccess}/{stats.totalSuccess}</span>
                    <span className="trick-stat-inline">連続 {stats.todayStreak}/{stats.maxStreak}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* 記録モーダル */}
        {selectedTrick && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">{selectedTrick}</h2>
              <div className="modal-stats">
                <div className="modal-stat">
                  <span className="modal-stat-label">今日</span>
                  <span className="modal-stat-value">{getTrickStats(selectedTrick).todaySuccess}回</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">累計</span>
                  <span className="modal-stat-value">{getTrickStats(selectedTrick).totalSuccess}回</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">最高連続</span>
                  <span className="modal-stat-value">{getTrickStats(selectedTrick).maxStreak}回</span>
                </div>
              </div>
              <div className="modal-buttons">
                <button 
                  className="modal-button success"
                  onClick={handleSuccess}
                  type="button"
                >
                  ✓ 成功
                </button>
                <button 
                  className="modal-button failure"
                  onClick={handleFailure}
                  type="button"
                >
                  × 失敗
                </button>
              </div>
              <button 
                className="modal-close"
                onClick={closeModal}
                type="button"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
      
      <TabBar activeTab="tricks" />
    </div>
  );
}
