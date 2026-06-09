interface ModeFilterModalProps {
  open: boolean;
  modeFilter: string;
  onClose: () => void;
  onSelect: (mode: string) => void;
}

export function ModeFilterModal({ open, modeFilter, onClose, onSelect }: ModeFilterModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '300px' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-center pixel-text-primary" style={{ marginBottom: '16px', fontSize: '22px' }}>
          MODE SELECT
        </h3>
        <div className="d-flex flex-column gap-3 mb-4">
          {['ALL', '1/1', '1/N'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                onSelect(mode);
                onClose();
              }}
              className={`pixel-btn ${modeFilter === mode ? 'pixel-btn-primary' : 'pixel-btn-secondary'}`}
            >
              {mode === 'ALL' ? '모두보기' : mode}
            </button>
          ))}
        </div>
        <div className="text-center mt-3">
          <button type="button" className="pixel-btn pixel-btn-secondary w-100" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
