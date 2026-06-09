interface RoomCreateModalProps {
  open: boolean;
  playerMode: string;
  roomTitle: string;
  difficulty: string;
  language: string;
  roomPwd: string;
  maxPlayers: string;
  problemCount: string;
  onClose: () => void;
  onConfirm: () => void;
  onPlayerModeChange: (mode: string) => void;
  onRoomTitleChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onRoomPwdChange: (value: string) => void;
  onMaxPlayersChange: (value: string) => void;
  onProblemCountChange: (value: string) => void;
}

export function RoomCreateModal({
  open,
  playerMode,
  roomTitle,
  difficulty,
  language,
  roomPwd,
  maxPlayers,
  problemCount,
  onClose,
  onConfirm,
  onPlayerModeChange,
  onRoomTitleChange,
  onDifficultyChange,
  onLanguageChange,
  onRoomPwdChange,
  onMaxPlayersChange,
  onProblemCountChange,
}: RoomCreateModalProps) {
  if (!open) return null;

  const resetAndClose = () => {
    onDifficultyChange('');
    onLanguageChange('');
    onMaxPlayersChange('');
    onProblemCountChange('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-center pixel-text-primary" style={{ marginBottom: '16px', fontSize: '22px' }}>
          CREATE ROOM
        </h3>
        <div className="d-flex justify-content-between gap-3 mb-4">
          {['1/1', '1/N'].map((mode) => (
            <div
              key={mode}
              className={`mode-select-btn ${playerMode === mode ? 'active' : ''}`}
              onClick={() => onPlayerModeChange(mode)}
            >
              {mode}
            </div>
          ))}
        </div>
        <div className="input-row mb-3">
          <span className="input-label">방 제목</span>
          <input
            type="text"
            className="modal-input-new"
            value={roomTitle}
            onChange={(e) => onRoomTitleChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-row mb-3">
          <select className="modal-select-new" value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
            <option value="" disabled>
              난이도
            </option>
            <option value="쉬움">쉬움</option>
            <option value="보통">보통</option>
            <option value="어려움">어려움</option>
          </select>
          <select className="modal-select-new" value={language} onChange={(e) => onLanguageChange(e.target.value)}>
            <option value="" disabled>
              언어
            </option>
            <option value="JAVA">JAVA</option>
            <option value="PYTHON">PYTHON</option>
            <option value="C++">C++</option>
            <option value="RANDOM">🎲 랜덤</option>
          </select>
        </div>
        <div className="modal-row mb-3">
          {playerMode === '1/N' && (
            <select className="modal-select-new" value={maxPlayers} onChange={(e) => onMaxPlayersChange(e.target.value)}>
              <option value="" disabled>
                인원 수
              </option>
              <option value="3">최대 3명</option>
              <option value="4">최대 4명</option>
              <option value="5">최대 5명</option>
              <option value="6">최대 6명</option>
              <option value="7">최대 7명</option>
              <option value="8">최대 8명</option>
            </select>
          )}
          <select className="modal-select-new" value={problemCount} onChange={(e) => onProblemCountChange(e.target.value)}>
            <option value="" disabled>
              문제 수
            </option>
            {['3', '4', '5', '6', '7', '8', '9', '10'].map((n) => (
              <option key={n} value={n}>
                문제 {n}개
              </option>
            ))}
          </select>
        </div>
        <div className="input-row mb-4">
          <span className="input-label">비밀번호</span>
          <input
            type="password"
            className="modal-input-new"
            value={roomPwd}
            onChange={(e) => onRoomPwdChange(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-end gap-3">
          <button type="button" className="pixel-btn pixel-btn-primary" style={{ minWidth: '120px' }} onClick={onConfirm}>
            생성
          </button>
          <button type="button" className="pixel-btn pixel-btn-secondary" style={{ minWidth: '120px' }} onClick={resetAndClose}>
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
