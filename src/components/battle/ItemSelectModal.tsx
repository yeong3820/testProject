import type { ItemInventory } from '../../types/battle';

interface ItemDef {
  type: keyof ItemInventory;
  icon: string;
  name: string;
  desc: string;
  rare?: boolean;
}

const ITEMS: ItemDef[] = [
  { type: 'paint', icon: '🎨', name: '페인트', desc: '상대 코드 화면에 페인트 스플래시' },
  { type: 'lightning', icon: '⚡', name: '번개 공격', desc: '번개로 상대 화면 방해' },
  { type: 'timeReduce', icon: '⏱️', name: '시간 감소', desc: '상대 제한시간 15초 감소' },
  { type: 'scribble', icon: '✏️', name: '낙서하기', desc: '상대 코드에 직접 낙서', rare: true },
];

interface ItemSelectModalProps {
  inventory: ItemInventory;
  onSelect: (type: keyof ItemInventory) => void;
  onClose: () => void;
}

export default function ItemSelectModal({ inventory, onSelect, onClose }: ItemSelectModalProps) {
  return (
    <div className="item-modal-overlay" onClick={onClose}>
      <div className="item-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="item-modal-title">⚡ 아이템 선택</div>
        {ITEMS.map((item) => (
          <div
            key={item.type}
            className="item-option"
            onClick={() => {
              if (inventory[item.type] > 0) onSelect(item.type);
            }}
            style={{
              opacity: inventory[item.type] <= 0 ? 0.4 : 1,
              cursor: inventory[item.type] <= 0 ? 'not-allowed' : 'pointer',
              background: item.rare ? 'linear-gradient(135deg, rgba(247,213,29,0.12), rgba(231,110,85,0.08))' : '',
              borderColor: item.rare ? 'var(--px-warning)' : '',
            }}
          >
            <div className="item-icon">{item.icon}</div>
            <div className="item-info">
              <div className="item-name">{item.rare ? '⭐ ' : ''}{item.name}</div>
              <div className="item-desc">{item.desc}</div>
            </div>
            <div className="item-count-badge" style={{ background: item.rare ? 'rgba(247,213,29,0.2)' : '' }}>
              {inventory[item.type]}회
            </div>
          </div>
        ))}
        <div className="item-modal-close">
          <button type="button" className="pixel-btn pixel-btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
