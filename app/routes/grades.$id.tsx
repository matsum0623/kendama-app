import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/grades.$id";
import { useState, useEffect } from "react";
import { getPracticeData, clearGrade, type PracticeData } from "../utils/localStorage";
import { getGradeById, getPreviousGrade, type GradeRequirement } from "../data/grades";
import { TabBar } from "../components/TabBar";

// 検定の進捗状態
interface ExamProgress {
  currentIndex: number; // 現在の技のインデックス
  results: {
    trick: string;
    attempts: number; // 試行回数
    successes: number; // 成功回数
    required: number; // 必要回数
    cleared: boolean; // クリア済みか
    type?: 'normal' | 'moshikame'; // 技の種類
    moshikameAttempts?: number[]; // もしかめの場合の各試技の連続回数
  }[];
}

export function meta({ params }: Route.MetaArgs) {
  const grade = getGradeById(params.id);
  return [
    { title: `${grade?.name || '級'} 検定 - けん玉練習アプリ` },
    { name: "description", content: `${grade?.name || '級'}の検定に挑戦` },
  ];
}

export default function GradeChallenge({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<PracticeData>({
    currentTrick: '大皿',
    currentGrade: null,
    clearedGrades: {},
    dailyRecords: {},
    updatedAt: Date.now(),
  });
  
  const [examProgress, setExamProgress] = useState<ExamProgress | null>(null);
  const [moshikameInput, setMoshikameInput] = useState<string>('');

  useEffect(() => {
    const loadedData = getPracticeData();
    setData(loadedData);
    
    // 飛び級チェック
    const grade = getGradeById(params.id);
    if (grade) {
      // 10級は常に挑戦可能
      if (params.id === '10') {
        return;
      }
      
      // 一つ前の級（下の級）を取得
      const previousGrade = getPreviousGrade(params.id);
      if (previousGrade) {
        // 前の級をクリアしていない場合はリダイレクト
        if (!loadedData.clearedGrades[previousGrade.id]) {
          navigate('/grades');
          return;
        }
      }
    }
  }, [params.id, navigate]);

  const grade = getGradeById(params.id);

  useEffect(() => {
    // 検定を初期化
    if (grade && !examProgress) {
      setExamProgress({
        currentIndex: 0,
        results: grade.requirements.map(req => ({
          trick: req.trick,
          attempts: 0,
          successes: 0,
          required: req.requiredCount,
          cleared: false,
          type: req.type || 'normal',
          moshikameAttempts: req.type === 'moshikame' ? [] : undefined,
        })),
      });
    }
  }, [grade, examProgress]);

  // 全技クリアしたら自動的に保存
  useEffect(() => {
    if (examProgress && examProgress.results.every(r => r.cleared)) {
      const newData = clearGrade(params.id);
      setData(newData);
    }
  }, [examProgress, params.id]);

  if (!grade || !examProgress) {
    return (
      <div className="home-container">
        <header className="app-header">
          <h1 className="app-title">検定 🏆</h1>
        </header>
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentResult = examProgress.results[examProgress.currentIndex];
  const currentRequirement = grade.requirements[examProgress.currentIndex];
  const isMoshikame = currentRequirement.type === 'moshikame';
  const isCurrentComplete = isMoshikame 
    ? (currentResult.moshikameAttempts?.length || 0) >= 2 || currentResult.cleared
    : currentResult.attempts >= 10 || currentResult.cleared;
  const isCurrentCleared = currentResult.cleared;
  const allCleared = examProgress.results.every(r => r.cleared);

  const handleMoshikameSubmit = () => {
    const count = parseInt(moshikameInput, 10);
    if (isNaN(count) || count < 0) {
      alert('正しい数値を入力してください');
      return;
    }
    
    const newResults = [...examProgress.results];
    const newAttempts = [...(currentResult.moshikameAttempts || []), count];
    newResults[examProgress.currentIndex] = {
      ...currentResult,
      moshikameAttempts: newAttempts,
      attempts: newAttempts.length,
      successes: Math.max(...newAttempts),
    };
    
    // 1回でも規定回数に達したらクリア
    if (count >= currentResult.required) {
      newResults[examProgress.currentIndex].cleared = true;
    }
    
    setExamProgress({
      ...examProgress,
      results: newResults,
    });
    setMoshikameInput('');
  };

  const handleSuccess = () => {
    if (isCurrentComplete) return;
    
    const newResults = [...examProgress.results];
    newResults[examProgress.currentIndex] = {
      ...currentResult,
      attempts: currentResult.attempts + 1,
      successes: currentResult.successes + 1,
    };
    
    // 規定回数達成したらすぐにクリア
    if (newResults[examProgress.currentIndex].successes >= newResults[examProgress.currentIndex].required) {
      newResults[examProgress.currentIndex].cleared = true;
    }
    
    setExamProgress({
      ...examProgress,
      results: newResults,
    });
  };

  const handleFailure = () => {
    if (isCurrentComplete) return;
    
    const newResults = [...examProgress.results];
    newResults[examProgress.currentIndex] = {
      ...currentResult,
      attempts: currentResult.attempts + 1,
    };
    
    // 10回終わったら判定（規定回数未達の場合）
    if (newResults[examProgress.currentIndex].attempts >= 10) {
      const cleared = newResults[examProgress.currentIndex].successes >= newResults[examProgress.currentIndex].required;
      newResults[examProgress.currentIndex].cleared = cleared;
    }
    
    setExamProgress({
      ...examProgress,
      results: newResults,
    });
  };

  const handleNextTrick = () => {
    if (examProgress.currentIndex < examProgress.results.length - 1) {
      setExamProgress({
        ...examProgress,
        currentIndex: examProgress.currentIndex + 1,
      });
    }
  };

  const handleRetry = () => {
    // 検定全体を最初からやり直す
    if (grade) {
      setExamProgress({
        currentIndex: 0,
        results: grade.requirements.map(req => ({
          trick: req.trick,
          attempts: 0,
          successes: 0,
          required: req.requiredCount,
          cleared: false,
          type: req.type || 'normal',
          moshikameAttempts: req.type === 'moshikame' ? [] : undefined,
        })),
      });
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">{grade.name} 検定 🏆</h1>
      </header>
      
      <div className="content">
        {!allCleared ? (
          <>
            {/* 現在の技 */}
            <div className="exam-current-trick">
              <h2 className="exam-trick-name">
                {currentResult.trick}
                {isMoshikame && ` ${currentResult.required}回`}
              </h2>
              <p className="exam-trick-target">
                {isMoshikame
                  ? '2回チャレンジ、1回でも達成すれば合格'
                  : `10回中 ${currentResult.required}回成功で合格`
                }
              </p>
            </div>

            {/* 進捗表示 */}
            {isMoshikame ? (
              <div className="exam-moshikame-progress">
                <div className="exam-score-item">
                  <span className="exam-score-label">試技回数</span>
                  <span className="exam-score-value">{currentResult.moshikameAttempts?.length || 0}/2</span>
                </div>
                <div className="exam-score-item success">
                  <span className="exam-score-label">最高記録</span>
                  <span className="exam-score-value">
                    {currentResult.moshikameAttempts && currentResult.moshikameAttempts.length > 0
                      ? Math.max(...currentResult.moshikameAttempts)
                      : 0}
                    回
                  </span>
                </div>
                {currentResult.moshikameAttempts && currentResult.moshikameAttempts.length > 0 && (
                  <div className="exam-moshikame-attempts">
                    {currentResult.moshikameAttempts.map((count, idx) => (
                      <div key={idx} className="exam-moshikame-attempt">
                        試技{idx + 1}: {count}回
                        {count >= currentResult.required && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="exam-score">
                <div className="exam-score-item">
                  <span className="exam-score-label">試行</span>
                  <span className="exam-score-value">{currentResult.attempts}/10</span>
                </div>
                <div className="exam-score-item success">
                  <span className="exam-score-label">成功</span>
                  <span className="exam-score-value">{currentResult.successes}/{currentResult.required}</span>
                </div>
              </div>
            )}

            {!isCurrentComplete ? (
              isMoshikame ? (
                /* もしかめの連続回数入力 */
                <div className="exam-moshikame-input">
                  <label htmlFor="moshikame-count" className="exam-moshikame-label">
                    連続で何回できましたか？
                  </label>
                  <div className="exam-moshikame-input-group">
                    <input
                      id="moshikame-count"
                      type="number"
                      min="0"
                      value={moshikameInput}
                      onChange={(e) => setMoshikameInput(e.target.value)}
                      placeholder="回数を入力"
                      className="exam-moshikame-field"
                    />
                    <button
                      type="button"
                      onClick={handleMoshikameSubmit}
                      className="exam-moshikame-submit"
                    >
                      記録
                    </button>
                  </div>
                </div>
              ) : (
                /* 通常の成功/失敗ボタン */
                <div className="button-section">
                  <button 
                    className="action-button success-button" 
                    onClick={handleSuccess}
                    type="button"
                  >
                    ✓ 成功
                  </button>
                  
                  <button 
                    className="action-button failure-button" 
                    onClick={handleFailure}
                    type="button"
                  >
                    ✗ 失敗
                  </button>
                </div>
              )
            ) : (
              /* 10回終了後 */
              <div className="exam-result">
                {isCurrentCleared ? (
                  <>
                    <div className="exam-result-success">
                      <span className="exam-result-icon">✓</span>
                      <p className="exam-result-text">クリア！</p>
                    </div>
                    {examProgress.currentIndex < examProgress.results.length - 1 && (
                      <button 
                        className="exam-button next-button"
                        onClick={handleNextTrick}
                        type="button"
                      >
                        次の技へ
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="exam-result-fail">
                      <span className="exam-result-icon">✗</span>
                      <p className="exam-result-text">未達成</p>
                      <p className="exam-result-detail">
                        {currentResult.successes}/{currentResult.required}回成功
                      </p>
                    </div>
                    <button 
                      className="exam-button retry-button"
                      onClick={handleRetry}
                      type="button"
                    >
                      再挑戦
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 全体の進捗 */}
            <div className="exam-progress-list">
              <h3 className="exam-progress-title">進捗状況</h3>
              {examProgress.results.map((result, index) => {
                const req = grade.requirements[index];
                const displayName = req.type === 'moshikame' 
                  ? `${result.trick} ${result.required}回`
                  : result.trick;
                
                return (
                  <div 
                    key={index}
                    className={`exam-progress-item ${index === examProgress.currentIndex ? 'current' : ''} ${result.cleared ? 'cleared' : ''}`}
                  >
                    <span className="exam-progress-trick">{displayName}</span>
                    <span className="exam-progress-status">
                      {result.cleared ? '✓' : result.attempts > 0 ? `${result.successes}/${result.required}` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* 全技クリア */
          <div className="exam-complete">
            <div className="exam-complete-icon">🎉</div>
            <h2 className="exam-complete-title">おめでとうございます！</h2>
            <p className="exam-complete-text">
              {grade.name}の全ての技をクリアしました
            </p>
            
            {/* 検定結果 */}
            <div className="exam-results-summary">
              <h3 className="exam-results-title">検定結果</h3>
              {examProgress.results.map((result, index) => {
                const req = grade.requirements[index];
                const isMoshikameResult = req.type === 'moshikame';
                
                return (
                  <div key={index} className="exam-results-item">
                    <div className="exam-results-trick-name">
                      {result.trick}
                      {isMoshikameResult && ` ${result.required}回`}
                    </div>
                    {isMoshikameResult ? (
                      <div className="exam-results-detail">
                        {result.moshikameAttempts?.map((count, idx) => (
                          <div key={idx} className="exam-results-moshikame">
                            試技{idx + 1}: {count}回
                            {count >= result.required && ' ✓'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="exam-results-detail">
                        {result.attempts}回中 {result.successes}回成功
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link to="/grades" className="back-link">
          ← 級・段一覧に戻る
        </Link>
      </div>
      
      <TabBar activeTab="grades" />
    </div>
  );
}
