import type { DemoBot } from './battle/demoBots';

export interface ResultPlayer {
  id: string;
  name: string;
  avatar: string;
  ingameScore: number;
  ratingScore: number;
  totalSolveTime: number;
  delta: number;
  rank: number;
}

interface RoomUserLike {
  id?: string;
  name?: string;
  avatar?: string;
  solvedProblems?: number[];
  ingameScore?: number;
  score?: string | number;
}

interface BattleSubmissionLike {
  ingameScore?: number;
  myRatingScore?: number;
  solveTimes?: Record<number, number>;
  mode?: string;
  lang?: string;
  codes?: string[];
  answers?: string[];
  problems?: Array<{ title?: string; question?: string; explanation?: string; answer?: Record<string, string[]> }>;
  submittedAt?: string;
  roomId?: string;
  historyId?: string;
  code?: string;
}

interface DemoStateLike {
  mode?: string;
  lang?: string;
  roundSeconds?: number;
  remaining?: number;
  ingameScore?: number;
  solveTimes?: Record<number, number>;
  battleBots?: DemoBot[];
}

function parseScore(scoreStr: string | number | undefined): number {
  const num = parseInt(String(scoreStr).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(num) ? num : 0;
}

function computeIngameScore(solvedProblems: number[]): number {
  const count = solvedProblems.length;
  if (count === 0) return 0;
  return count * 1000 + (100 * (count * (count - 1))) / 2;
}

export function buildResultPlayers(params: {
  roomUsers: RoomUserLike[];
  demoBots: DemoBot[];
  submission: BattleSubmissionLike;
  demoState: DemoStateLike | null;
}): ResultPlayer[] {
  const list: ResultPlayer[] = [];
  const seen = new Set<string>();

  const getSolveTimesForPlayer = (playerId: string): number[] => {
    if (playerId === 'rocky_user' || playerId === 'me') {
      const times = params.submission?.solveTimes || params.demoState?.solveTimes || {};
      return Object.values(times);
    }
    const bot = params.demoBots.find((b) => b.id === playerId);
    if (bot && Array.isArray(bot.solveScheduleByProblem)) {
      const solved = bot.solvedProblems || [];
      return solved.map((idx) => bot.solveScheduleByProblem?.[idx] || 0);
    }
    return [];
  };

  params.roomUsers.forEach((u) => {
    const id = u.id || '';
    if (seen.has(id)) return;
    seen.add(id);
    const isMe = id === 'me' || Boolean(u.name?.includes('rocky_user'));
    const solvedProblems = Array.isArray(u.solvedProblems) ? u.solvedProblems : [];

    let ingameScore = 0;
    let ratingScore = 1000;
    if (isMe) {
      ingameScore = params.submission?.ingameScore ?? params.demoState?.ingameScore ?? 0;
      ratingScore = params.submission?.myRatingScore ?? 1000;
    } else {
      ingameScore = u.ingameScore ?? computeIngameScore(solvedProblems);
      ratingScore = u.score ? parseScore(u.score) : 1000;
    }

    const solveTimesArr = getSolveTimesForPlayer(isMe ? 'rocky_user' : id);
    const totalSolveTime = solveTimesArr.reduce((sum, t) => sum + (t || 0), 0);

    list.push({
      id: isMe ? 'rocky_user' : id,
      name: u.name || (isMe ? 'rocky_user' : id),
      avatar: u.avatar || '👤',
      ingameScore,
      ratingScore,
      totalSolveTime,
      delta: Math.floor(ingameScore / 10),
      rank: 0,
    });
  });

  params.demoBots.forEach((bot) => {
    if (seen.has(bot.id)) return;
    seen.add(bot.id);
    const botSolved = Array.isArray(bot.solvedProblems) ? bot.solvedProblems : [];
    const botScore = computeIngameScore(botSolved);
    const solveTimesArr = Array.isArray(bot.solveScheduleByProblem)
      ? botSolved.map((idx) => bot.solveScheduleByProblem?.[idx] || 0)
      : [];
    const totalSolveTime = solveTimesArr.reduce((sum, t) => sum + (t || 0), 0);
    list.push({
      id: bot.id,
      name: bot.name,
      avatar: bot.avatar || '🤖',
      ingameScore: botScore,
      ratingScore: 1000,
      totalSolveTime,
      delta: Math.floor(botScore / 10),
      rank: 0,
    });
  });

  if (list.length === 0) {
    list.push({
      id: 'rocky_user',
      name: 'rocky_user',
      ingameScore: 0,
      ratingScore: 1000,
      totalSolveTime: 0,
      delta: 0,
      avatar: '😎',
      rank: 1,
    });
    list.push({
      id: 'elder',
      name: '알고리즘깎는노인',
      ingameScore: 2500,
      ratingScore: 1420,
      totalSolveTime: 0,
      delta: 250,
      avatar: '👴',
      rank: 2,
    });
  }

  list.sort((a, b) => {
    if (b.ingameScore !== a.ingameScore) return b.ingameScore - a.ingameScore;
    return a.totalSolveTime - b.totalSolveTime;
  });

  list.forEach((p, i) => {
    p.rank = i + 1;
  });

  return list;
}

export function getPlayerCodeByProblem(
  playerId: string,
  problemIndex: number,
  mySubmissionCodes: string[],
  demoBots: DemoBot[],
): string {
  if (playerId === 'rocky_user' || playerId === 'me') {
    return mySubmissionCodes[problemIndex] || '// 코드를 찾을 수 없습니다.';
  }
  const bot = demoBots.find((b) => b.id === playerId);
  if (bot && Array.isArray(bot.codeByProblem)) {
    return bot.codeByProblem[problemIndex] || '// 코드를 찾을 수 없습니다.';
  }
  return localStorage.getItem('opponentBattleCode') || '// 코드를 찾을 수 없습니다.';
}
