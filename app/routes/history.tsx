import type { Route } from "./+types/history";
import { useState, useEffect } from "react";
import { getPracticeData, getKendamaDate, type PracticeData, type DailyRecord } from "../utils/localStorage";
import { TabBar } from "../components/TabBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "履歴 - けん玉練習アプリ" },
    { name: "description", content: "けん玉の練習履歴" },
  ];
}

export default function History() {
  const [data, setData] = useState<PracticeData>({
    currentTrick: '大皿',
    currentGrade: null,
    clearedGrades: {},
    dailyRecords: {},
    updatedAt: Date.now(),
  });
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setData(getPracticeData());
  }, []);

  // 統計情報を計算
  const getStats = () => {
    const dates = Object.keys(data.dailyRecords);
    const totalDays = dates.length;
    
    let totalSuccess = 0;
    for (const date of dates) {
      const record = data.dailyRecords[date];
      Object.values(record.tricks).forEach(trick => {
        totalSuccess += trick.totalSuccess;
      });
    }
    
    // 連続練習日数を計算
    let currentStreak = 0;
    const today = getKendamaDate();
    const sortedDates = dates.sort().reverse();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expected) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return { totalDays, totalSuccess, currentStreak };
  };

  // カレンダーの日付を取得
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // 月の最初の日の曜日分、nullで埋める
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // 月の日数分、日付を追加
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (data.dailyRecords[dateStr]) {
      setSelectedDate(dateStr);
    }
  };

  const stats = getStats();
  const calendarDays = getCalendarDays();
  const selectedRecord = selectedDate ? data.dailyRecords[selectedDate] : null;

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">履歴 📋</h1>
      </header>
      
      <div className="content">
        {/* 統計サマリー */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-value">{stats.totalDays}</span>
            <span className="stat-label">練習日数</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalSuccess}</span>
            <span className="stat-label">総成功回数</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.currentStreak}</span>
            <span className="stat-label">連続日数 🔥</span>
          </div>
        </div>

        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="calendar-nav" type="button">‹</button>
            <h2 className="calendar-title">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h2>
            <button onClick={handleNextMonth} className="calendar-nav" type="button">›</button>
          </div>
          
          <div className="calendar-weekdays">
            <div className="calendar-weekday">日</div>
            <div className="calendar-weekday">月</div>
            <div className="calendar-weekday">火</div>
            <div className="calendar-weekday">水</div>
            <div className="calendar-weekday">木</div>
            <div className="calendar-weekday">金</div>
            <div className="calendar-weekday">土</div>
          </div>
          
          <div className="calendar-days">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="calendar-day empty"></div>;
              }
              
              const dateStr = day.toISOString().split('T')[0];
              const hasPractice = !!data.dailyRecords[dateStr];
              const hasChallenge = data.dailyRecords[dateStr]?.challengeCompleted;
              const isToday = dateStr === getKendamaDate();
              
              return (
                <button
                  key={index}
                  className={`calendar-day ${hasPractice ? 'has-practice' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasPractice}
                  type="button"
                >
                  <span className="calendar-day-number">{day.getDate()}</span>
                  {hasChallenge && <span className="calendar-star">⭐</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedDate && selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {new Date(selectedDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
            </h2>
            <div className="daily-detail">
              {Object.entries(selectedRecord.tricks).map(([trick, record]) => {
                if (record.totalSuccess === 0) return null;
                return (
                  <div key={trick} className="daily-trick">
                    <span className="daily-trick-name">{trick}</span>
                    <div className="daily-trick-stats">
                      <span className="daily-trick-stat">成功 {record.totalSuccess}回</span>
                      <span className="daily-trick-stat">連続 {record.streak}回</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              className="modal-close"
              onClick={() => setSelectedDate(null)}
              type="button"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      
      <TabBar activeTab="history" />
    </div>
  );
}
