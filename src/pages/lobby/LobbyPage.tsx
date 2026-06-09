import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryPanel } from '../../components/lobby/InventoryPanel/InventoryPanel';
import { LobbyChatPanel } from '../../components/lobby/LobbyChatPanel/LobbyChatPanel';
import { MatchStoryModal } from '../../components/lobby/MatchStoryModal/MatchStoryModal';
import { ModeFilterModal } from '../../components/lobby/ModeFilterModal/ModeFilterModal';
import { PracticeModal } from '../../components/lobby/PracticeModal/PracticeModal';
import { ProfilePanel } from '../../components/lobby/ProfilePanel/ProfilePanel';
import { RankingBoard } from '../../components/lobby/RankingBoard/RankingBoard';
import { RoomCreateModal } from '../../components/lobby/RoomCreateModal/RoomCreateModal';
import { RoomList } from '../../components/lobby/RoomList/RoomList';
import { RouletteWheel } from '../../components/lobby/RouletteWheel/RouletteWheel';
import { TitleModal } from '../../components/lobby/TitleModal/TitleModal';
import { DEFAULT_ITEM_INVENTORY, ROULETTE_COST, ROULETTE_ITEMS, type ItemInventory } from '../../constants/itemTypes';
import { ROUTES } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { loadTitles, type TitleData } from '../../constants/titleTypes';
import { buildRoomSearchParams, createRoom } from '../../services/roomService';
import type { ChatMessage, CodeHistoryEntry, LobbyUser, Room } from '../../types/lobby';
import { persistCodeHistory, readCodeHistory } from '../../utils/codeHistoryUtils';
import { DEFAULT_ROOMS, loadDynamicRooms, normalizeRoomList } from '../../utils/roomUtils';
import './lobby.css';

const SEG_ANGLE = 360 / ROULETTE_ITEMS.length;

function loadGold(): number {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEYS.ROCKY_GOLD) || '0', 10);
    if (v < 10000) {
      localStorage.setItem(STORAGE_KEYS.ROCKY_GOLD, '10000');
      return 10000;
    }
    return v;
  } catch {
    return 10000;
  }
}

function loadItemInventory(): ItemInventory {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ROCKY_ITEMS);
    return stored ? { ...DEFAULT_ITEM_INVENTORY, ...JSON.parse(stored) } : { ...DEFAULT_ITEM_INVENTORY };
  } catch {
    return { ...DEFAULT_ITEM_INVENTORY };
  }
}

function getEquippedFromStorage(): string | null {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROCKY_TITLES) || 'null');
    return d?.equipped || null;
  } catch {
    return null;
  }
}

function loadInitialUsers(): LobbyUser[] {
  return [
    { name: '알고리즘노인', rank: '플래티넘', title: 'streak3' },
    { name: '코딩초보', rank: '브론즈', title: null },
    { name: 'java_master', rank: '골드', title: 'java_master' },
    { name: 'python_king', rank: '다이아', title: 'python_master' },
    { name: 'rocky_user', rank: '플래티넘', title: getEquippedFromStorage() },
    { name: 'Cpp왕초보', rank: '실버', title: null },
    { name: 'AI코더', rank: '마스터', title: 'streak5' },
    { name: '버그헌터', rank: '골드', title: 'veteran' },
    { name: '초고수', rank: '다이아', title: 'all_rounder' },
    { name: '주니어개발자', rank: '브론즈', title: 'rookie' },
  ];
}

export default function LobbyPage() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showModeFilterModal, setShowModeFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState('일반');
  const [playerMode, setPlayerMode] = useState('1/N');
  const [roomTitle, setRoomTitle] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [language, setLanguage] = useState('');
  const [roomPwd, setRoomPwd] = useState('');
  const [problemCount, setProblemCount] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMode, setChatMode] = useState('ALL');
  const [practiceLang, setPracticeLang] = useState('JAVA');
  const [practiceDiff, setPracticeDiff] = useState('보통');
  const [practiceCount, setPracticeCount] = useState('5');
  const [currentPage, setCurrentPage] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeHistory, setCodeHistory] = useState<CodeHistoryEntry[]>(readCodeHistory);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);
  const [modeFilter, setModeFilter] = useState('ALL');
  const [selectedHistoryProblemIndex, setSelectedHistoryProblemIndex] = useState(0);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [gold, setGold] = useState(loadGold);
  const [itemInventory, setItemInventory] = useState<ItemInventory>(loadItemInventory);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [titleData, setTitleData] = useState<TitleData>(loadTitles);
  const [users] = useState<LobbyUser[]>(loadInitialUsers);
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [rooms, setRooms] = useState<Room[]>(() => [...DEFAULT_ROOMS, ...loadDynamicRooms()]);

  const refreshRooms = useCallback(() => {
    setRooms([...DEFAULT_ROOMS, ...loadDynamicRooms()]);
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DYNAMIC_ROOMS) {
        const updated = e.newValue ? JSON.parse(e.newValue) : [];
        const normalized = normalizeRoomList(updated);
        if (JSON.stringify(normalized) !== JSON.stringify(updated)) {
          localStorage.setItem(STORAGE_KEYS.DYNAMIC_ROOMS, JSON.stringify(normalized));
        }
        setRooms([...DEFAULT_ROOMS, ...normalized]);
        setCurrentPage(0);
      }
      if (e.key === STORAGE_KEYS.CODE_HISTORY) {
        setCodeHistory(readCodeHistory());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pageshow', refreshRooms);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pageshow', refreshRooms);
    };
  }, [refreshRooms]);

  const filteredRooms = rooms.filter((r) => modeFilter === 'ALL' || r.mode === modeFilter);
  const safeHistoryIndex = codeHistory.length === 0 ? 0 : Math.min(selectedHistoryIndex, codeHistory.length - 1);
  const validHistoryIds = new Set(codeHistory.map((entry) => entry.historyId));
  const safeSelectedHistoryIds = selectedHistoryIds.filter((id) => validHistoryIds.has(id));

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const modeLabel = chatMode === 'ALL' ? '[전체]' : '[친구]';
    setChatMessages((prev) => [...prev, { sender: 'rocky_user', text: chatMsg, time: timeStr, mode: modeLabel }]);
    setChatMsg('');
  };

  const handleConfirmCreate = () => {
    if (!roomTitle.trim()) {
      alert('방 제목을 입력해주세요!');
      return;
    }
    if (!difficulty) {
      alert('난이도를 선택해주세요!');
      return;
    }
    if (!language) {
      alert('언어를 선택해주세요!');
      return;
    }

    const newRoom = createRoom({
      roomTitle,
      playerMode,
      difficulty,
      language,
      roomPwd,
      maxPlayers,
      problemCount,
    });

    setRooms([...DEFAULT_ROOMS, ...loadDynamicRooms()]);
    setShowModal(false);

    const params = buildRoomSearchParams(newRoom);
    if (playerMode === '1/1') params.set('maxPlayers', '1');
    navigate(`${ROUTES.ROOM}?${params.toString()}`);
  };

  const handleJoinRoom = (room: Room) => {
    navigate(`${ROUTES.ROOM}?${buildRoomSearchParams(room).toString()}`);
  };

  const spinRoulette = () => {
    if (gold < ROULETTE_COST || rouletteSpinning) return;

    setGold((p) => {
      const v = p - ROULETTE_COST;
      localStorage.setItem(STORAGE_KEYS.ROCKY_GOLD, String(v));
      return v;
    });
    setRouletteSpinning(true);
    setRouletteResult(null);

    const targetIdx = Math.floor(Math.random() * ROULETTE_ITEMS.length);
    const correction = 360 - targetIdx * SEG_ANGLE - SEG_ANGLE / 2;
    const minTarget = wheelDeg + 360 * 8;
    const base = Math.ceil((minTarget - correction) / 360) * 360;
    const targetDeg = base + correction;
    setWheelDeg(targetDeg);

    setTimeout(() => {
      const sel = ROULETTE_ITEMS[targetIdx];
      if (sel.type === 'miss') {
        setRouletteResult('💀 꽝! 아쉽습니다.');
      } else {
        setRouletteResult(`${sel.icon} ${sel.name} 획득!`);
        setItemInventory((p) => {
          const n = { ...p, [sel.type]: (p[sel.type as keyof ItemInventory] || 0) + 1 };
          localStorage.setItem(STORAGE_KEYS.ROCKY_ITEMS, JSON.stringify(n));
          return n;
        });
      }
      setTimeout(() => setRouletteSpinning(false), 1200);
    }, 3200);
  };

  const handleDeleteSelectedHistory = () => {
    if (selectedHistoryIds.length === 0) return;
    const nextHistory = codeHistory.filter((entry) => !selectedHistoryIds.includes(entry.historyId));
    persistCodeHistory(nextHistory);
    setCodeHistory(nextHistory);
    setSelectedHistoryIds([]);
    setSelectedHistoryIndex((prev) => (nextHistory.length === 0 ? 0 : Math.min(prev, nextHistory.length - 1)));
    setSelectedHistoryProblemIndex(0);
  };

  const handleSelectAllHistory = () => {
    if (selectedHistoryIds.length === codeHistory.length) {
      setSelectedHistoryIds([]);
      return;
    }
    setSelectedHistoryIds(codeHistory.map((entry) => entry.historyId));
  };

  const startPractice = () => {
    const params = new URLSearchParams({
      lang: practiceLang,
      diff: practiceDiff,
      count: practiceCount,
    });
    navigate(`${ROUTES.PRACTICE}?${params.toString()}`);
  };

  return (
    <>
      <div className="page-container lobby-page">
        <div className="lobby-row lobby-row-top">
          <div className="lobby-col-main">
            <RoomList
              rooms={filteredRooms}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={() => setShowModal(true)}
              onModeFilter={() => setShowModeFilterModal(true)}
              onPractice={() => setShowPracticeModal(true)}
            />
          </div>
          <div className="lobby-col-side">
            <ProfilePanel
              titleData={titleData}
              onOpenMatchStory={() => {
                setSelectedHistoryIndex(0);
                setSelectedHistoryProblemIndex(0);
                setSelectedHistoryIds([]);
                setShowCodeModal(true);
              }}
              onOpenTitles={() => setShowTitleModal(true)}
            />
            <InventoryPanel gold={gold} items={itemInventory} onOpenRoulette={() => setShowRoulette(true)} />
          </div>
        </div>

        <div className="lobby-row lobby-row-bottom">
          <div className="lobby-col-main">
            <LobbyChatPanel
              messages={chatMessages}
              chatMsg={chatMsg}
              chatMode={chatMode}
              onChatMsgChange={setChatMsg}
              onChatModeChange={setChatMode}
              onSend={handleSendChat}
            />
          </div>
          <div className="lobby-col-side">
            <RankingBoard users={users} activeTab={activeTab} titleData={titleData} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <TitleModal
        open={showTitleModal}
        titleData={titleData}
        onClose={() => setShowTitleModal(false)}
        onTitleDataChange={setTitleData}
      />

      <RoomCreateModal
        open={showModal}
        playerMode={playerMode}
        roomTitle={roomTitle}
        difficulty={difficulty}
        language={language}
        roomPwd={roomPwd}
        maxPlayers={maxPlayers}
        problemCount={problemCount}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmCreate}
        onPlayerModeChange={setPlayerMode}
        onRoomTitleChange={setRoomTitle}
        onDifficultyChange={setDifficulty}
        onLanguageChange={setLanguage}
        onRoomPwdChange={setRoomPwd}
        onMaxPlayersChange={setMaxPlayers}
        onProblemCountChange={setProblemCount}
      />

      <ModeFilterModal
        open={showModeFilterModal}
        modeFilter={modeFilter}
        onClose={() => setShowModeFilterModal(false)}
        onSelect={(mode) => {
          setModeFilter(mode);
          setCurrentPage(0);
        }}
      />

      <PracticeModal
        open={showPracticeModal}
        practiceLang={practiceLang}
        practiceDiff={practiceDiff}
        practiceCount={practiceCount}
        onClose={() => setShowPracticeModal(false)}
        onStart={startPractice}
        onLangChange={setPracticeLang}
        onDiffChange={setPracticeDiff}
        onCountChange={setPracticeCount}
      />

      <RouletteWheel
        open={showRoulette}
        gold={gold}
        spinning={rouletteSpinning}
        result={rouletteResult}
        wheelDeg={wheelDeg}
        onClose={() => {
          setShowRoulette(false);
          setRouletteResult(null);
        }}
        onSpin={spinRoulette}
      />

      <MatchStoryModal
        open={showCodeModal}
        codeHistory={codeHistory}
        selectedIndex={safeHistoryIndex}
        selectedProblemIndex={selectedHistoryProblemIndex}
        selectedIds={safeSelectedHistoryIds}
        onClose={() => setShowCodeModal(false)}
        onSelectEntry={(idx) => {
          setSelectedHistoryIndex(idx);
          setSelectedHistoryProblemIndex(0);
        }}
        onSelectProblem={setSelectedHistoryProblemIndex}
        onToggleSelection={(historyId) =>
          setSelectedHistoryIds((prev) =>
            prev.includes(historyId) ? prev.filter((id) => id !== historyId) : [...prev, historyId],
          )
        }
        onSelectAll={handleSelectAllHistory}
        onDeleteSelected={handleDeleteSelectedHistory}
      />
    </>
  );
}
