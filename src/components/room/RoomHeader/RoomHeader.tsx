interface RoomHeaderProps {
  roomTitle: string;
  isPrivate: boolean;
  roomMode: string;
  playerCount: number;
  maxPlayers: number;
}

export function RoomHeader({ roomTitle, isPrivate, roomMode, playerCount, maxPlayers }: RoomHeaderProps) {
  return (
    <div className="room-header">
      <h3 className="room-title">#001 - {roomTitle}</h3>
      <div className="room-info-badge">
        {isPrivate ? 'PRIVATE 🔒 | ' : 'PUBLIC | '}
        {roomMode} | {playerCount}/{maxPlayers} 명
      </div>
    </div>
  );
}
