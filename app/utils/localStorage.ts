// けん玉の技
export const TRICKS = ['大皿', '小皿', '中皿', 'ろうそく', 'とめけん', '飛行機', 'ふりけん', '日本一周', '世界一周', '灯台', 'もしかめ'] as const;
export type Trick = typeof TRICKS[number];

// 技ごとの記録
export interface TrickRecord {
  streak: number;
  totalSuccess: number;
}

// 日別の記録
export interface DailyRecord {
  tricks: Record<Trick, TrickRecord>;
  challengeCompleted?: boolean; // 今日のチャレンジ達成フラグ
}

// けん玉練習データの型定義
export interface PracticeData {
  currentTrick: Trick;
  currentGrade: string | null; // 現在の級のID（'10', '9', etc.）
  clearedGrades: Record<string, string>; // 合格した級とその日時（gradeId -> ISO日時文字列）
  dailyRecords: Record<string, DailyRecord>; // 日付をキーにした記録
  updatedAt: number;
}

const STORAGE_KEY = 'kendama-practice-data';

// 午前3時を境界として日付を取得
export function getKendamaDate(date: Date = new Date()): string {
  const offsetDate = new Date(date);
  // 3時未満の場合は前日扱い
  if (offsetDate.getHours() < 3) {
    offsetDate.setDate(offsetDate.getDate() - 1);
  }
  return offsetDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
}

// 空の技記録を生成
function createEmptyTrickRecords(): Record<Trick, TrickRecord> {
  return {
    '大皿': { streak: 0, totalSuccess: 0 },
    '小皿': { streak: 0, totalSuccess: 0 },
    '中皿': { streak: 0, totalSuccess: 0 },
    'ろうそく': { streak: 0, totalSuccess: 0 },
    'とめけん': { streak: 0, totalSuccess: 0 },
    '飛行機': { streak: 0, totalSuccess: 0 },
    'ふりけん': { streak: 0, totalSuccess: 0 },
    '日本一周': { streak: 0, totalSuccess: 0 },
    '世界一周': { streak: 0, totalSuccess: 0 },
    '灯台': { streak: 0, totalSuccess: 0 },
    'もしかめ': { streak: 0, totalSuccess: 0 },
  };
}

// 初期データを生成する関数
function createInitialData(): PracticeData {
  const today = getKendamaDate();
  const initialTricks = createEmptyTrickRecords();
  
  return {
    currentTrick: '大皿',
    currentGrade: null,
    clearedGrades: {},
    dailyRecords: {
      [today]: {
        tricks: initialTricks,
      },
    },
    updatedAt: Date.now(),
  };
}

// データの取得
export function getPracticeData(): PracticeData {
  if (typeof window === 'undefined') {
    return createInitialData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // 古いデータ構造（tricks直下）の場合は新しい構造に移行
      if (parsed.tricks && !parsed.dailyRecords) {
        const today = getKendamaDate();
        return {
          currentTrick: parsed.currentTrick || '大皿',
          currentGrade: parsed.currentGrade || null,
          clearedGrades: parsed.clearedGrades || {},
          dailyRecords: {
            [today]: {
              tricks: parsed.tricks,
            },
          },
          updatedAt: Date.now(),
        };
      }
      
      // currentGradeがない場合、または存在してもundefinedの場合はnullに設定
      if (parsed.currentGrade === undefined) {
        parsed.currentGrade = null;
      }
      
      // clearedGradesがない場合は初期化
      if (!parsed.clearedGrades) {
        parsed.clearedGrades = {};
      }
      
      // 新しい技が追加された場合は補完
      if (parsed.dailyRecords) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load practice data:', error);
  }
  
  return createInitialData();
}

// 今日の記録を取得
export function getTodayRecord(data: PracticeData): DailyRecord {
  const today = getKendamaDate();
  
  if (!data.dailyRecords[today]) {
    return {
      tricks: createEmptyTrickRecords(),
    };
  }
  
  return data.dailyRecords[today];
}

// データの保存
export function savePracticeData(data: PracticeData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save practice data:', error);
  }
}

// 技を変更
export function changeTrick(trick: Trick): PracticeData {
  const data = getPracticeData();
  const newData: PracticeData = {
    ...data,
    currentTrick: trick,
    updatedAt: Date.now(),
  };
  savePracticeData(newData);
  return newData;
}

// 級をクリアする
export function clearGrade(gradeId: string): PracticeData {
  const data = getPracticeData();
  const newData: PracticeData = {
    ...data,
    currentGrade: gradeId,
    clearedGrades: {
      ...data.clearedGrades,
      [gradeId]: new Date().toISOString(),
    },
    updatedAt: Date.now(),
  };
  savePracticeData(newData);
  return newData;
}

// 今日のチャレンジを達成する
export function markChallengeCompleted(): PracticeData {
  const data = getPracticeData();
  const today = getKendamaDate();
  
  const newData: PracticeData = {
    ...data,
    dailyRecords: {
      ...data.dailyRecords,
      [today]: {
        ...data.dailyRecords[today],
        challengeCompleted: true,
      },
    },
    updatedAt: Date.now(),
  };
  savePracticeData(newData);
  return newData;
}

// 成功を記録
export function recordSuccess(): PracticeData {
  const data = getPracticeData();
  const today = getKendamaDate();
  const currentTrick = data.currentTrick;
  
  // 今日の記録を取得または作成
  const todayRecord = data.dailyRecords[today] || { tricks: createEmptyTrickRecords() };
  
  const newData: PracticeData = {
    ...data,
    dailyRecords: {
      ...data.dailyRecords,
      [today]: {
        tricks: {
          ...todayRecord.tricks,
          [currentTrick]: {
            streak: todayRecord.tricks[currentTrick].streak + 1,
            totalSuccess: todayRecord.tricks[currentTrick].totalSuccess + 1,
          },
        },
      },
    },
    updatedAt: Date.now(),
  };
  savePracticeData(newData);
  return newData;
}

// 失敗を記録
export function recordFailure(): PracticeData {
  const data = getPracticeData();
  const today = getKendamaDate();
  const currentTrick = data.currentTrick;
  
  // 今日の記録を取得または作成
  const todayRecord = data.dailyRecords[today] || { tricks: createEmptyTrickRecords() };
  
  const newData: PracticeData = {
    ...data,
    dailyRecords: {
      ...data.dailyRecords,
      [today]: {
        tricks: {
          ...todayRecord.tricks,
          [currentTrick]: {
            streak: 0,
            totalSuccess: todayRecord.tricks[currentTrick].totalSuccess,
          },
        },
      },
    },
    updatedAt: Date.now(),
  };
  savePracticeData(newData);
  return newData;
}
