import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BattleSettingsPanel } from '../../components/room/BattleSettingsPanel/BattleSettingsPanel';
import { CharacterSelect } from '../../components/room/CharacterSelect/CharacterSelect';
import { KickModal } from '../../components/room/KickModal/KickModal';
import { OnlineUserList } from '../../components/room/OnlineUserList/OnlineUserList';
import { PlayerGrid } from '../../components/room/PlayerGrid/PlayerGrid';
import { RoomActionBar } from '../../components/room/RoomActionBar/RoomActionBar';
import { RoomChatPanel } from '../../components/room/RoomChatPanel/RoomChatPanel';
import { RoomHeader } from '../../components/room/RoomHeader/RoomHeader';
import { RoomProfileModal } from '../../components/room/RoomProfileModal/RoomProfileModal';
import { StartGameOverlay } from '../../components/room/StartGameOverlay/StartGameOverlay';
import {
  buildInitialMessages,
  buildInitialPlayers,
  DIFF_MAP,
  LANG_MAP,
} from '../../constants/roomConstants';
import { ROUTES } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import {
  clearRoomSession,
  prepareBattleStart,
  removeRoomFromLobby,
  updateRoomPlayerCount,
} from '../../services/battlePrepService';
import type { RoomChatMessage, RoomPlayer, RoomSettings } from '../../types/room';
import './room.css';

export default function RoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get('id') || '';
  const roomTitleFromUrl = searchParams.get('title') || '싱글 데스매치';
  const roomPwd = searchParams.get('pwd') || '';
  const isPrivate = roomPwd.length > 0;
  const roomMode = searchParams.get('mode') || '1/1';

  const urlLang = searchParams.get('lang') || 'JAVA';
  const urlDiff = searchParams.get('diff') || '보통';
  const urlTimeRaw = searchParams.get('time') || '45분';
  const urlCount = searchParams.get('count') || '5';
  const urlMaxPlayers = searchParams.get('maxPlayers') || '8';
  const parsedMaxPlayers = Math.max(2, Math.min(8, parseInt(urlMaxPlayers, 10) || 8));

  const initialLang = LANG_MAP[urlLang] || 'java';
  const initialDiff = DIFF_MAP[urlDiff] || 'NORMAL';
  const initialCount = parseInt(urlCount, 10) >= 3 && parseInt(urlCount, 10) <= 10 ? urlCount : '5';

  const initialPlayers = useMemo(
    () => buildInitialPlayers(roomId, roomMode, parsedMaxPlayers),
    [roomId, roomMode, parsedMaxPlayers],
  );

  const [myLanguage] = useState(initialLang);
  const [myCharacter, setMyCharacter] = useState('char1');
  const [isReady, setIsReady] = useState(false);
  const [autoReady, setAutoReady] = useState(false);
  const [settings] = useState<RoomSettings>({
    time: urlTimeRaw,
    diff: initialDiff,
    theme: 'ALGORITHM: DP',
    count: initialCount,
    maxPlayers: parsedMaxPlayers,
  });
  const [showProblemModal] = useState(false);
  const [selectedProblem] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePlayer, setProfilePlayer] = useState<RoomPlayer | null>(null);
  const [profilePlayerIndex, setProfilePlayerIndex] = useState<number | null>(null);
  const [showKickModal, setShowKickModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<{ index: number; name: string } | null>(null);
  const [kickedCount, setKickedCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(`${STORAGE_KEYS.ROOM_KICKED_PREFIX}${roomId}`) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [players, setPlayers] = useState<(RoomPlayer | null)[]>(initialPlayers);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMode, setChatMode] = useState('ALL');
  const [messages, setMessages] = useState<RoomChatMessage[]>(() =>
    buildInitialMessages(roomMode, parsedMaxPlayers, initialPlayers),
  );

  const host = players[0];
  const myIsReady = host?.isHost ? host.isReady : isReady;
  const occupiedCount = players.filter((p) => p !== null).length;

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    setMessages((prev) => [...prev, { type: 'user', name: 'rocky_user', text: chatMsg }]);
    setChatMsg('');
  };

  const handleMyReadyToggle = () => {
    if (host?.isHost) {
      setPlayers((prev) => {
        const next = [...prev];
        const me = next[0];
        if (!me) return prev;
        const updated = { ...me, isReady: !me.isReady, status: !me.isReady ? 'READY' : 'WAITING' };
        next[0] = updated;
        return next;
      });
    } else {
      setIsReady((r) => !r);
    }
  };

  const handleStartGame = () => {
    if (!host?.isHost) return;

    prepareBattleStart({
      roomId,
      settingsDiff: settings.diff,
      settingsCount: settings.count,
      settingsMaxPlayers: settings.maxPlayers,
      myLanguage,
      roomMode,
    });

    const battleParams = new URLSearchParams({
      fresh: '1',
      roomId: roomId || '',
      lang: myLanguage || 'java',
      mode: roomMode || '1/1',
      count: settings.count || '5',
      maxPlayers: String(settings.maxPlayers || parsedMaxPlayers),
    });

    navigate(`${ROUTES.BATTLE}?${battleParams.toString()}`);
  };

  const handleLeaveToLobby = () => {
    removeRoomFromLobby(roomId);
    clearRoomSession(roomId);
    navigate(ROUTES.LOBBY);
  };

  const handleKickPlayer = () => {
    if (!kickTarget) return;

    const kickedName = kickTarget.name;
    setPlayers((prev) => {
      const next = [...prev];
      next[kickTarget.index] = null;
      return next;
    });

    const newKicked = kickedCount + 1;
    setKickedCount(newKicked);
    localStorage.setItem(`${STORAGE_KEYS.ROOM_KICKED_PREFIX}${roomId}`, String(newKicked));
    setMessages((prev) => [...prev, { type: 'sys', text: `>> [${kickedName}] 님이 강퇴되었습니다.` }]);
    updateRoomPlayerCount(roomId);
    setShowKickModal(false);
    setKickTarget(null);
  };

  const openProfile = (player: RoomPlayer, index: number) => {
    setProfilePlayer(player);
    setProfilePlayerIndex(index);
    setShowProfileModal(true);
  };

  return (
    <>
      <div className="room-page-container">
        <div className="room-layout">
          <div className="room-main-col">
            <div className="pixel-card room-main-card">
              <RoomHeader
                roomTitle={roomTitleFromUrl}
                isPrivate={isPrivate}
                roomMode={roomMode}
                playerCount={occupiedCount}
                maxPlayers={parsedMaxPlayers}
              />
              <PlayerGrid
                players={players}
                myCharacter={myCharacter}
                myLanguage={myLanguage}
                onPlayerClick={openProfile}
              />
              <RoomChatPanel
                messages={messages}
                chatMsg={chatMsg}
                chatMode={chatMode}
                onChatMsgChange={setChatMsg}
                onChatModeChange={setChatMode}
                onSend={handleSendChat}
              />
              <div className="bottom-nav">
                <button type="button" className="nav-btn exit" onClick={handleLeaveToLobby}>
                  ◀ 로비로
                </button>
              </div>
            </div>
          </div>

          <div className="room-side-col">
            <div className="pixel-card room-side-card">
              <CharacterSelect myCharacter={myCharacter} onSelect={setMyCharacter} />
              <BattleSettingsPanel myLanguage={myLanguage} settings={settings} />
              <OnlineUserList players={players} myCharacter={myCharacter} onPlayerClick={openProfile} />
              <RoomActionBar
                isHost={Boolean(host?.isHost)}
                myIsReady={myIsReady}
                autoReady={autoReady}
                onReadyToggle={handleMyReadyToggle}
                onAutoReadyChange={setAutoReady}
                onStart={handleStartGame}
              />
            </div>
          </div>
        </div>
      </div>

      <StartGameOverlay open={showProblemModal} message={selectedProblem} />

      <KickModal
        open={showKickModal}
        targetName={kickTarget?.name || ''}
        onConfirm={handleKickPlayer}
        onCancel={() => {
          setShowKickModal(false);
          setKickTarget(null);
        }}
      />

      <RoomProfileModal
        open={showProfileModal}
        player={profilePlayer}
        playerIndex={profilePlayerIndex}
        myCharacter={myCharacter}
        isHost={Boolean(host?.isHost)}
        roomMode={roomMode}
        onClose={() => setShowProfileModal(false)}
        onKick={(index, name) => {
          setKickTarget({ index, name });
          setShowKickModal(true);
        }}
      />
    </>
  );
}
