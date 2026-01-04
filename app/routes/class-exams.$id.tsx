import { Link, useParams } from "react-router";
import type { Route } from "./+types/class-exams.$id";
import { useState, useEffect } from "react";
import { getClassExamById } from "../data/class-exams";
import type { Trick } from "../utils/localStorage";
import { TabBar } from "../components/TabBar";

export function meta({ params }: Route.MetaArgs) {
  const exam = getClassExamById(params.id);
  return [
    { title: `${exam?.name || 'クラス検定'} - けん玉練習アプリ` },
    { name: "description", content: `${exam?.name}の検定に挑戦` },
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

interface ExamProgress {
  currentIndex: number; // 現在の技のインデックス
  results: {
    trick: Trick;
    attempts: boolean[]; // 各試行の結果
  }[];
}

export default function ClassExamDetail() {
  const params = useParams();
  const classId = params.id as string;
  const exam = getClassExamById(classId);

  const [examRecords, setExamRecords] = useState<ClassExamRecord>({});
  const [examProgress, setExamProgress] = useState<ExamProgress | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('classExamRecords');
    if (stored) {
      setExamRecords(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (exam && !examProgress) {
      // 既存の記録から進捗を復元
      const currentRecord = examRecords[classId];
      const currentAttempts = currentRecord?.current || {};
      const results = exam.tricks.map(trick => ({
        trick,
        attempts: currentAttempts[trick] || [],
      }));
      
      // 最初の未完了の技を探す
      let currentIndex = results.findIndex(r => r.attempts.length < 3);
      if (currentIndex === -1) currentIndex = results.length - 1;
      
      setExamProgress({
        currentIndex,
        results,
      });
    }
  }, [exam, examRecords, classId, examProgress]);

  if (!exam) {
    return (
      <div className="home-container">
        <header className="app-header">
          <Link to="/class-exams" className="back-button">←</Link>
          <h1 className="app-title">クラス検定</h1>
        </header>
        <div className="content">
          <p>クラスが見つかりません</p>
        </div>
      </div>
    );
  }

  if (!examProgress) {
    return <div>Loading...</div>;
  }

  const currentResult = examProgress.results[examProgress.currentIndex];
  const totalSuccess = examProgress.results.reduce((sum, r) => 
    sum + r.attempts.filter(a => a).length, 0
  );
  const totalAttempts = examProgress.results.reduce((sum, r) => 
    sum + r.attempts.length, 0
  );
  const maxAttempts = exam.tricks.length * 3;
  const allCompleted = examProgress.results.every(r => r.attempts.length >= 3);

  const handleSuccess = () => {
    if (currentResult.attempts.length >= 3) return;

    const newResults = [...examProgress.results];
    newResults[examProgress.currentIndex] = {
      ...currentResult,
      attempts: [...currentResult.attempts, true],
    };

    // localStorageに保存
    const newRecords = { ...examRecords };
    if (!newRecords[classId]) {
      newRecords[classId] = { current: {}, history: [] };
    }
    if (!newRecords[classId].current) {
      newRecords[classId].current = {};
    }
    newRecords[classId].current[currentResult.trick] = newResults[examProgress.currentIndex].attempts;
    
    // 全技完了したら履歴に追加
    const isAllCompleted = newResults.every(r => r.attempts.length >= 3);
    if (isAllCompleted) {
      const score = newResults.reduce((sum, r) => sum + r.attempts.filter(a => a).length, 0);
      const tricks: { [key: string]: boolean[] } = {};
      newResults.forEach(r => {
        tricks[r.trick] = r.attempts;
      });
      
      if (!newRecords[classId].history) {
        newRecords[classId].history = [];
      }
      newRecords[classId].history.push({
        timestamp: Date.now(),
        score,
        tricks,
      });
      
      // 現在の試行をクリア
      newRecords[classId].current = {};
    }
    
    setExamRecords(newRecords);
    localStorage.setItem('classExamRecords', JSON.stringify(newRecords));

    // 次の技に進む（現在の技が3回完了したら）
    let nextIndex = examProgress.currentIndex;
    if (newResults[examProgress.currentIndex].attempts.length >= 3) {
      // 次の未完了の技を探す
      nextIndex = newResults.findIndex((r, i) => i > examProgress.currentIndex && r.attempts.length < 3);
      if (nextIndex === -1) {
        nextIndex = examProgress.currentIndex; // 最後の技で止まる
      }
    }

    setExamProgress({
      currentIndex: nextIndex,
      results: newResults,
    });
  };

  const handleFailure = () => {
    if (currentResult.attempts.length >= 3) return;

    const newResults = [...examProgress.results];
    newResults[examProgress.currentIndex] = {
      ...currentResult,
      attempts: [...currentResult.attempts, false],
    };

    // localStorageに保存
    const newRecords = { ...examRecords };
    if (!newRecords[classId]) {
      newRecords[classId] = { current: {}, history: [] };
    }
    if (!newRecords[classId].current) {
      newRecords[classId].current = {};
    }
    newRecords[classId].current[currentResult.trick] = newResults[examProgress.currentIndex].attempts;
    
    // 全技完了したら履歴に追加
    const isAllCompleted = newResults.every(r => r.attempts.length >= 3);
    if (isAllCompleted) {
      const score = newResults.reduce((sum, r) => sum + r.attempts.filter(a => a).length, 0);
      const tricks: { [key: string]: boolean[] } = {};
      newResults.forEach(r => {
        tricks[r.trick] = r.attempts;
      });
      
      if (!newRecords[classId].history) {
        newRecords[classId].history = [];
      }
      newRecords[classId].history.push({
        timestamp: Date.now(),
        score,
        tricks,
      });
      
      // 現在の試行をクリア
      newRecords[classId].current = {};
    }
    
    setExamRecords(newRecords);
    localStorage.setItem('classExamRecords', JSON.stringify(newRecords));

    // 次の技に進む（現在の技が3回完了したら）
    let nextIndex = examProgress.currentIndex;
    if (newResults[examProgress.currentIndex].attempts.length >= 3) {
      // 次の未完了の技を探す
      nextIndex = newResults.findIndex((r, i) => i > examProgress.currentIndex && r.attempts.length < 3);
      if (nextIndex === -1) {
        nextIndex = examProgress.currentIndex; // 最後の技で止まる
      }
    }

    setExamProgress({
      currentIndex: nextIndex,
      results: newResults,
    });
  };

  const handleSelectTrick = (index: number) => {
    setExamProgress({
      ...examProgress,
      currentIndex: index,
    });
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <Link to="/class-exams" className="back-button">←</Link>
        <h1 className="app-title">{exam.name}</h1>
      </header>
      
      <div className="content">
        {/* 総合スコア */}
        <div className="exam-summary">
          <div className="exam-summary-score">
            <span className="exam-summary-label">総合スコア</span>
            <span className="exam-summary-value">
              {totalSuccess} / {maxAttempts}
              <span className="exam-summary-percent">
                ({Math.round((totalSuccess / maxAttempts) * 100)}%)
              </span>
            </span>
          </div>
        </div>

        {/* 現在の技 */}
        {!allCompleted && (
          <div className="exam-current">
            <h2 className="exam-current-title">現在の技</h2>
            <p className="exam-current-trick">{currentResult.trick}</p>
            <div className="exam-attempts">
              {[0, 1, 2].map(i => (
                <span 
                  key={i} 
                  className={`exam-attempt ${
                    i < currentResult.attempts.length 
                      ? currentResult.attempts[i] ? 'success' : 'failure'
                      : 'pending'
                  }`}
                >
                  {i < currentResult.attempts.length 
                    ? currentResult.attempts[i] ? '○' : '×'
                    : '−'
                  }
                </span>
              ))}
            </div>
            
            {currentResult.attempts.length < 3 && (
              <div className="exam-buttons">
                <button 
                  className="exam-button success-button" 
                  onClick={handleSuccess}
                  type="button"
                >
                  ✓ 成功
                </button>
                <button 
                  className="exam-button failure-button" 
                  onClick={handleFailure}
                  type="button"
                >
                  × 失敗
                </button>
              </div>
            )}
          </div>
        )}

        {/* 検定完了 */}
        {allCompleted && (
          <div className="exam-current">
            <h2 className="exam-current-title">{exam.name} 完了</h2>
            <p className="exam-complete-score">
              総合得点: {totalSuccess}/{maxAttempts} ({Math.round((totalSuccess / maxAttempts) * 100)}%)
            </p>
            <div className="exam-buttons">
              <button
                className="exam-button success-button"
                onClick={() => {
                  // 新しい挑戦を開始
                  const results = exam.tricks.map(trick => ({
                    trick,
                    attempts: [],
                  }));
                  setExamProgress({
                    currentIndex: 0,
                    results,
                  });
                }}
                type="button"
              >
                もう一度挑戦
              </button>
            </div>
          </div>
        )}

        {/* 全技の一覧 */}
        <div className="exam-list">
          <h3 className="exam-list-title">技一覧</h3>
          {examProgress.results.map((result, index) => {
            const successCount = result.attempts.filter(a => a).length;
            const completed = result.attempts.length >= 3;
            
            return (
              <div
                key={index}
                className={`exam-list-item ${index === examProgress.currentIndex ? 'current' : ''} ${completed ? 'completed' : ''}`}
                onClick={() => handleSelectTrick(index)}
              >
                <div className="exam-list-name">
                  {index + 1}. {result.trick}
                </div>
                <div className="exam-list-score">
                  {result.attempts.map((success, i) => (
                    <span key={i} className={`exam-list-result ${success ? 'success' : 'failure'}`}>
                      {success ? '○' : '×'}
                    </span>
                  ))}
                  {result.attempts.length < 3 && (
                    <>
                      {[...Array(3 - result.attempts.length)].map((_, i) => (
                        <span key={`pending-${i}`} className="exam-list-result pending">−</span>
                      ))}
                    </>
                  )}
                  <span className="exam-list-count">
                    {successCount}/3
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TabBar activeTab="class-exams" />
    </div>
  );
}
