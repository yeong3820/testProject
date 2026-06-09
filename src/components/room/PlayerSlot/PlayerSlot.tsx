import { CHARACTERS, LANGUAGES } from '../../../constants/roomConstants';
import type { RoomPlayer } from '../../../types/room';

interface PlayerSlotProps {
  player: RoomPlayer | null;
  index: number;
  myCharacter: string;
  myLanguage: string;
  onClick?: () => void;
}

export function PlayerSlot({ player, index, myCharacter, myLanguage, onClick }: PlayerSlotProps) {
  const myCharIcon = CHARACTERS.find((c) => c.id === myCharacter)?.icon;
  const myLangIcon = LANGUAGES.find((l) => l.id === myLanguage)?.icon;

  return (
    <div
      className={`player-slot ${player ? 'occupied' : 'empty'} ${player?.isHost ? 'host' : ''}`}
      onClick={player ? onClick : undefined}
      style={player ? { cursor: 'pointer' } : undefined}
    >
      <div className="slot-avatar" style={{ color: player?.isHost ? 'var(--px-warning)' : 'var(--px-primary)' }}>
        {player ? (index === 0 ? myCharIcon : player.character) : <span className="status-empty">X</span>}
      </div>
      <div className={`slot-host-badge ${player?.isHost ? '' : 'hidden'}`}>HOST</div>
      <div className="slot-name" style={{ color: player ? '#ddd' : '#555' }}>
        {player ? (
          <>
            <span style={{ marginRight: '4px' }}>{index === 0 ? myLangIcon : player.language}</span>
            {player.name}
          </>
        ) : (
          'Empty'
        )}
      </div>
      <div
        className={`slot-status ${player && !player.isHost ? (player.isReady ? 'status-ready' : 'status-waiting') : ''}`}
        style={!player || player.isHost ? { visibility: 'hidden' } : undefined}
      >
        {player && !player.isHost ? (player.isReady ? 'READY' : 'WAITING') : ''}
      </div>
      <div className="slot-button-area">
        <div style={{ width: '1px' }} />
      </div>
    </div>
  );
}
