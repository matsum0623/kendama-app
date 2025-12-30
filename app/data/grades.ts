import type { Trick } from '../utils/localStorage';

export interface GradeRequirement {
  trick: Trick;
  requiredCount: number;
  type?: 'normal' | 'moshikame'; // もしかめは2回チャレンジ制
}

export interface Grade {
  id: string;
  name: string;
  order: number; // 数字が小さいほど上位
  requirements: GradeRequirement[];
}

// 日本けん玉協会の級・段位審査規程（10回中の成功回数）
export const GRADES: Grade[] = [
  {
    id: '10',
    name: '10級',
    order: 10,
    requirements: [
      { trick: '大皿', requiredCount: 1 },
    ],
  },
  {
    id: '9',
    name: '9級',
    order: 9,
    requirements: [
      { trick: '大皿', requiredCount: 2 },
      { trick: '小皿', requiredCount: 1 },
    ],
  },
  {
    id: '8',
    name: '8級',
    order: 8,
    requirements: [
      { trick: '大皿', requiredCount: 3 },
      { trick: '小皿', requiredCount: 2 },
      { trick: '中皿', requiredCount: 1 },
    ],
  },
  {
    id: '7',
    name: '7級',
    order: 7,
    requirements: [
      { trick: '小皿', requiredCount: 3 },
      { trick: '中皿', requiredCount: 2 },
      { trick: 'ろうそく', requiredCount: 1 },
    ],
  },
  {
    id: '6',
    name: '6級',
    order: 6,
    requirements: [
      { trick: '中皿', requiredCount: 3 },
      { trick: 'ろうそく', requiredCount: 2 },
      { trick: 'とめけん', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 4, type: 'moshikame' },
    ],
  },
  {
    id: '5',
    name: '5級',
    order: 5,
    requirements: [
      { trick: 'ろうそく', requiredCount: 3 },
      { trick: 'とめけん', requiredCount: 2 },
      { trick: '飛行機', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 10, type: 'moshikame' },
    ],
  },
  {
    id: '4',
    name: '4級',
    order: 4,
    requirements: [
      { trick: 'とめけん', requiredCount: 3 },
      { trick: '飛行機', requiredCount: 2 },
      { trick: 'ふりけん', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 20, type: 'moshikame' },
    ],
  },
  {
    id: '3',
    name: '3級',
    order: 3,
    requirements: [
      { trick: '飛行機', requiredCount: 3 },
      { trick: 'ふりけん', requiredCount: 2 },
      { trick: '日本一周', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 30, type: 'moshikame' },
    ],
  },
  {
    id: '2',
    name: '2級',
    order: 2,
    requirements: [
      { trick: 'ふりけん', requiredCount: 3 },
      { trick: '日本一周', requiredCount: 2 },
      { trick: '世界一周', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 40, type: 'moshikame' },
    ],
  },
  {
    id: '1',
    name: '1級',
    order: 1,
    requirements: [
      { trick: '日本一周', requiredCount: 3 },
      { trick: '世界一周', requiredCount: 2 },
      { trick: '灯台', requiredCount: 1 },
      { trick: 'もしかめ', requiredCount: 50, type: 'moshikame' },
    ],
  },
];

// 級を取得
export function getGradeById(id: string): Grade | undefined {
  return GRADES.find(g => g.id === id);
}

// 次の級を取得
export function getNextGrade(currentGradeId: string): Grade | undefined {
  const current = getGradeById(currentGradeId);
  if (!current) return GRADES[GRADES.length - 1]; // デフォルトは10級
  
  return GRADES.find(g => g.order === current.order - 1);
}

// 前の級を取得
export function getPreviousGrade(currentGradeId: string): Grade | undefined {
  const current = getGradeById(currentGradeId);
  if (!current) return undefined;
  
  return GRADES.find(g => g.order === current.order + 1);
}
