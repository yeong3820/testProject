interface RoomActionBarProps {
  isHost: boolean;
  myIsReady: boolean;
  autoReady: boolean;
  onReadyToggle: () => void;
  onAutoReadyChange: (checked: boolean) => void;
  onStart: () => void;
}

export function RoomActionBar({
  isHost,
  myIsReady,
  autoReady,
  onReadyToggle,
  onAutoReadyChange,
  onStart,
}: RoomActionBarProps) {
  return (
    <div className="panel-section">
      {isHost ? (
        <button type="button" className="btn-ready start" onClick={onStart}>
          START
        </button>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button type="button" className={`btn-ready ${myIsReady ? 'is-ready' : ''}`} style={{ flex: 1 }} onClick={onReadyToggle}>
              {myIsReady ? 'CANCEL' : 'READY'}
            </button>
          </div>
          <label className="auto-ready-toggle">
            <input type="checkbox" checked={autoReady} onChange={(e) => onAutoReadyChange(e.target.checked)} />
            자동 준비 (Auto Ready)
          </label>
        </>
      )}
    </div>
  );
}
