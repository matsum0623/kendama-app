import type { Trick } from '../utils/localStorage';

export interface ClassExam {
  id: string;
  name: string;
  order: number; // F=7, E=6, D=5, C=4, B=3, A=2, S=1
  tricks: Trick[];
}

// クラス検定（各技を3回ずつ実施、成功回数を記録）
export const CLASS_EXAMS: ClassExam[] = [
  {
    id: 'F',
    name: 'Fクラス',
    order: 7,
    tricks: [
      '大皿',
      '小皿',
      '中皿',
      'ろうそく',
      'とめけん',
      '飛行機',
      'ふりけん',
      '世界一周',
      '灯台',
      'うぐいす',
    ],
  },
  {
    id: 'E',
    name: 'Eクラス',
    order: 6,
    tricks: [
      '日本一周',
      '地球まわし',
      '月面着陸',
      '一回転飛行機',
      'つるしとめけん',
      'はねけん',
      'すべりけん',
      '竹馬',
      'さか落とし',
      'うら地球まわし',
    ],
  },
  {
    id: 'D',
    name: 'Dクラス',
    order: 5,
    tricks: [
      'もしかめ',
      'とんぼ返り',
      'つるしはねけん',
      'うぐいす地球まわし',
      'うぐいすの谷渡り',
      'ダウンスパイク',
      'ジャンプ宇宙一周',
      '県一周',
      'タップ灯台',
      'インワードけん玉ちゃん',
    ],
  },
  {
    id: 'C',
    name: 'Cクラス',
    order: 4,
    tricks: [
      'つるしもしかめ',
      'ろうそく返し',
      'はやて中皿',
      '野球けん',
      '裏野球けん',
      '二回転灯台',
      '手のせうぐいす',
      'すくいけん',
      'まわし灯台',
      'スワップ灯台',
    ],
  },
  {
    id: 'B',
    name: 'Bクラス',
    order: 3,
    tricks: [
      '一回転飛行機 中皿',
      'すべり止め極意',
      '円月殺法',
      'うらふりけん',
      '金魚すくい',
      'うぐいすろうそく',
      'つむじ風',
      'はねけん一回転',
      'つるしとめけん一回転',
      '灯立直し',
    ],
  },
  {
    id: 'A',
    name: 'Aクラス',
    order: 2,
    tricks: [
      'うぐいす一回転飛行機',
      'はやて中皿 逆',
      '二回転飛行機',
      'すくいけん一回転',
      'タイムふりけん',
      'アンダーバード',
      'ジャグル灯台',
      'まわし灯台 逆',
      '一回転飛行機 中皿 逆',
      'スワップ宇宙遊泳',
    ],
  },  {
    id: 'S',
    name: 'Sクラス',
    order: 1,
    tricks: [
      '一回転飛行機 さか落とし',
      '一回転飛行機 さか落とし 逆',
      'うぐいす飛び移り',
      '宇宙遊泳～灯台',
      '地獄ぐるま',
      'つるし二回転灯台',
      '縦一回転灯台',
      'うぐいすの谷渡り～さか落とし',
      'ドラゴン灯台',
      'うぐいす一回転飛行機～さか落とし',
    ],
  },];

export function getClassExamById(id: string): ClassExam | undefined {
  return CLASS_EXAMS.find(exam => exam.id === id);
}

export function getNextClass(currentClassId: string): ClassExam | null {
  const currentExam = getClassExamById(currentClassId);
  if (!currentExam) return null;
  
  const nextExam = CLASS_EXAMS.find(exam => exam.order === currentExam.order - 1);
  return nextExam || null;
}

export function getPreviousClass(currentClassId: string): ClassExam | null {
  const currentExam = getClassExamById(currentClassId);
  if (!currentExam) return null;
  
  const previousExam = CLASS_EXAMS.find(exam => exam.order === currentExam.order + 1);
  return previousExam || null;
}
