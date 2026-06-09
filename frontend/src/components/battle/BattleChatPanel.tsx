import { useEffect, useRef } from 'react';

export interface ChatMessage {
  sender: string;
  text: string;
  mode: string;
  time: string;
}

interface BattleChatPanelProps {
  messages: ChatMessage[];
  chatMsg: string;
  chatMode: string;
  chatExpanded: boolean;
  demoSpectating: boolean;
  onMsgChange: (v: string) => void;
  onModeChange: (v: string) => void;
  onSend: () => void;
  onExpand: (v: boolean) => void;
}

export default function BattleChatPanel({
  messages,
  chatMsg,
  chatMode,
  chatExpanded,
  demoSpectating,
  onMsgChange,
  onModeChange,
  onSend,
  onExpand,
}: BattleChatPanelProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!chatExpanded) return;
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        onExpand(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [chatExpanded, onExpand]);

  return (
    <div className={`chat-overlay ${chatExpanded ? 'visible' : ''}`}>
      <div className="chat-slot">
        <div ref={chatRef} className={`chat-wrapper ${chatExpanded ? 'chat-expanded' : ''}`}>
          <div className="chat-messages" ref={messagesRef}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>
                {msg.sender === 'SYSTEM' ? (
                  <span style={{ color: 'var(--px-warning)' }}>{msg.text}</span>
                ) : (
                  <span>
                    <span style={{ color: 'var(--px-warning)', fontSize: '14px' }}>{msg.mode}</span>{' '}
                    <span style={{ color: 'var(--px-primary)' }}>{msg.sender}</span>{' '}
                    <span style={{ color: '#ccc' }}>{msg.text}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <select className="chat-mode-select" value={chatMode} onChange={(e) => onModeChange(e.target.value)}>
              <option value="ALL">모두에게</option>
              <option value="FRIEND">친구에게</option>
            </select>
            <input
              type="text"
              className="chat-input"
              placeholder={demoSpectating ? '메시지...' : '관전 모드에서만 채팅 가능'}
              value={chatMsg}
              onFocus={() => {
                if (demoSpectating) onExpand(true);
              }}
              onChange={(e) => onMsgChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              disabled={!demoSpectating}
              style={!demoSpectating ? { opacity: '0.4', cursor: 'not-allowed' } : {}}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={onSend}
              disabled={!demoSpectating}
              style={!demoSpectating ? { opacity: '0.4', cursor: 'not-allowed' } : {}}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
