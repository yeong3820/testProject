import type { ResultPlayer } from '../../../utils/resultUtils';
import { ResultPlayerRow } from '../ResultPlayerRow/ResultPlayerRow';

interface ResultRankingPanelProps {
  players: ResultPlayer[];
  rankBorderColor: string;
  rankGlow: string;
}

export function ResultRankingPanel({ players, rankBorderColor, rankGlow }: ResultRankingPanelProps) {
  return (
    <div className="ranking-panel" style={{ borderColor: rankBorderColor, boxShadow: rankGlow }}>
      <div className="rank-title">RANKING</div>
      <div className="player-list">
        {players.map((p) => (
          <ResultPlayerRow key={p.id} player={p} showRank panelClass={`rank-${p.rank <= 3 ? p.rank : ''}`} />
        ))}
      </div>
      <div className="ranking-footer">총 {players.length}명 참가</div>
    </div>
  );
}
