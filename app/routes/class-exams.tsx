import { Link } from "react-router";
import type { Route } from "./+types/class-exams";
import { useState, useEffect } from "react";
import { CLASS_EXAMS } from "../data/class-exams";
import { TabBar } from "../components/TabBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "クラス検定 - けん玉練習アプリ" },
    { name: "description", content: "けん玉のクラス検定に挑戦しよう" },
  ];
}

interface ClassExamRecord {
  [classId: string]: {
    current: {
      [trickName: string]: boolean[]; // 現在進行中の試行
    };
    history: {
      timestamp: number;
      score: number;
      tricks: {
        [trickName: string]: boolean[];
      };
    }[];
  };
}

export default function ClassExams() {
  const [examRecords, setExamRecords] = useState<ClassExamRecord>({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('classExamRecords');
    if (stored) {
      setExamRecords(JSON.parse(stored));
    }
  }, []);

  // クラスの最高得点を取得
  const getBestScore = (classId: string): { score: number; timestamp: number } | null => {
    const record = examRecords[classId];
    if (!record || !record.history || record.history.length === 0) return null;
    
    const best = record.history.reduce((max, attempt) => 
      attempt.score > max.score ? attempt : max
    );
    
    return { score: best.score, timestamp: best.timestamp };
  };

  // クラスの最大可能回数を計算（技数 × 3回）
  const getClassMax = (classId: string): number => {
    const exam = CLASS_EXAMS.find(e => e.id === classId);
    return exam ? exam.tricks.length * 3 : 0;
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">クラス検定 🎯</h1>
        <button 
          className="info-button"
          onClick={() => setShowModal(true)}
          aria-label="説明を表示"
        >
          ℹ️
        </button>
      </header>
      
      <div className="content">
        {/* クラス一覧 */}
        <div className="grades-list">
          {CLASS_EXAMS.map((exam) => {
            const max = getClassMax(exam.id);
            const bestScore = getBestScore(exam.id);
            
            return (
              <Link
                key={exam.id}
                to={`/class-exams/${exam.id}`}
                className="grade-list-item"
              >
                <span className="grade-list-name">{exam.name}</span>
                {bestScore && (
                  <div className="grade-list-best">
                    <span className="grade-list-score">
                      最高: {bestScore.score}/{max}
                    </span>
                    <span className="grade-list-date">
                      {new Date(bestScore.timestamp).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                <span className="grade-list-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 説明モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>クラス検定について</h2>
            <p>各クラス10種の技を3回ずつ実施し、成功回数を記録します。</p>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}

      <TabBar activeTab="class-exams" />
    </div>
  );
}
