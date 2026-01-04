import { Link } from "react-router";
import type { Route } from "./+types/grades";
import { useState, useEffect } from "react";
import { getPracticeData, type PracticeData } from "../utils/localStorage";
import { GRADES, getGradeById, getNextGrade, getPreviousGrade } from "../data/grades";
import { TabBar } from "../components/TabBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "級・段 - けん玉練習アプリ" },
    { name: "description", content: "けん玉の級・段に挑戦しよう" },
  ];
}

export default function Grades() {
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

  const currentGrade = data.currentGrade ? getGradeById(data.currentGrade) : null;
  const nextGrade = data.currentGrade ? getNextGrade(data.currentGrade) : getGradeById('10');
  
  // 飛び級防止: 現在の級をクリアしていれば次の級に挑戦可能
  const canChallenge = !data.currentGrade || !!data.clearedGrades[data.currentGrade];

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">級・段 🏆</h1>
      </header>
      
      <div className="content">
        {/* 現在の級 */}
        <div className="current-grade-card">
          <h2 className="grade-card-title">現在の級</h2>
          <p className="grade-card-name">{currentGrade?.name || '級なし'}</p>
        </div>

        {/* 次の級 */}
        {nextGrade && (
          <div className="next-grade-card">
            <h2 className="grade-card-title">{data.currentGrade ? '次の級' : '最初の級'}</h2>
            <p className="grade-card-name">{nextGrade.name}</p>
            {canChallenge ? (
              <Link to={`/grades/${nextGrade.id}`} className="grade-challenge-btn">
                検定にチャレンジ
              </Link>
            ) : (
              <button className="grade-challenge-btn disabled" disabled>
                現在の級をクリアしてください
              </button>
            )}
          </div>
        )}

        {/* 全級一覧 */}
        <div className="grades-list">
          <h3 className="grades-list-title">全ての級</h3>
          {GRADES.map((grade) => {
            const clearedAt = data.clearedGrades[grade.id];
            const formattedDateTime = clearedAt ? new Date(clearedAt).toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : null;
            
            // 挑戦可能かチェック
            let canAccess = false;
            if (grade.id === '10') {
              canAccess = true; // 10級は常に挑戦可能
            } else {
              const previousGrade = getPreviousGrade(grade.id);
              if (previousGrade) {
                canAccess = !!data.clearedGrades[previousGrade.id];
              } else {
                canAccess = true;
              }
            }
            
            const className = `grade-list-item ${grade.id === data.currentGrade ? 'current' : ''} ${!canAccess ? 'locked' : ''}`;
            
            if (!canAccess) {
              return (
                <div
                  key={grade.id}
                  className={className}
                >
                  <div>
                    <span className="grade-list-name">{grade.name}</span>
                  </div>
                  <span className="grade-list-lock">🔒</span>
                </div>
              );
            }
            
            return (
              <Link
                key={grade.id}
                to={`/grades/${grade.id}`}
                className={className}
              >
                <div>
                  <span className="grade-list-name">{grade.name}</span>
                </div>
                <div className="grade-list-right">
                  {formattedDateTime && (
                    <span className="grade-list-date">{formattedDateTime}</span>
                  )}
                  {grade.id === data.currentGrade && (
                    <span className="grade-list-badge">現在</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <TabBar activeTab="grades" />
    </div>
  );
}
