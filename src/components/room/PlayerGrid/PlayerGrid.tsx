import type { RoomPlayer } from '../../../types/room';
import { PlayerSlot } from '../PlayerSlot/PlayerSlot';

interface PlayerGridProps {
  players: (RoomPlayer | null)[];
  myCharacter: string;
  myLanguage: string;
  onPlayerClick: (player: RoomPlayer, index: number) => void;
}

export function PlayerGrid({ players, myCharacter, myLanguage, onPlayerClick }: PlayerGridProps) {
  return (
    <div className="player-grid">
      {players.map((p, idx) => (
        <PlayerSlot
          key={idx}
          player={p}
          index={idx}
          myCharacter={myCharacter}
          myLanguage={myLanguage}
          onClick={p ? () => onPlayerClick(p, idx) : undefined}
        />
      ))}
    </div>
  );
}
