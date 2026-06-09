import type { ItemInventory } from '../../../constants/itemTypes';

interface InventoryPanelProps {
  gold: number;
  items: ItemInventory;
  onOpenRoulette: () => void;
}

const ITEM_ROWS: Array<{ key: keyof ItemInventory; icon: string; name: string; rare?: boolean }> = [
  { key: 'paint', icon: '🎨', name: '페인트' },
  { key: 'lightning', icon: '⚡', name: '번개' },
  { key: 'timeReduce', icon: '⏱️', name: '시간감소' },
  { key: 'revealLength', icon: '📏', name: '글자수' },
  { key: 'revealPrev', icon: '🔍', name: '앞글자' },
  { key: 'scribble', icon: '✏️', name: '낙서', rare: true },
  { key: 'blankBreak', icon: '🔨', name: '빈칸깨기', rare: true },
];

export function InventoryPanel({ gold, items, onOpenRoulette }: InventoryPanelProps) {
  return (
    <div className="inventory-panel">
      <div style={{ flexShrink: 0 }}>
        <div className="inventory-title">💰 아이템 &amp; 골드</div>
        <div className="gold-row">
          <span className="gold-label">보유 골드</span>
          <span className="gold-val">{gold.toLocaleString()} G</span>
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {ITEM_ROWS.map((row) => (
          <div className="item-row" key={row.key}>
            <span className="item-name">
              {row.rare ? '⭐ ' : ''}
              {row.icon} {row.name}
            </span>
            <span className="item-count">{items[row.key]}개</span>
          </div>
        ))}
        <div className="item-hint">1회 300G / ⭐레어 낮은 확률</div>
        <button
          type="button"
          className="pixel-btn"
          style={{
            width: '100%',
            fontSize: '13px',
            padding: '3px',
            marginTop: '2px',
            background: '#E67E22',
            color: '#000',
            textShadow: 'none',
            borderColor: '#D35400',
          }}
          onClick={onOpenRoulette}
        >
          🎰 룰렛 (300G)
        </button>
      </div>
    </div>
  );
}
