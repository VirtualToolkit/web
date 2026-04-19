export interface VRChatPlayer {
  displayName: string;
  userId?: string;
  joinedAt: number;
}

export interface VRChatInstanceInfo {
  worldId: string;
  instanceId: string;
  worldName?: string;
  instanceType?: string;
  changedAt: number;
}

export interface VRChatAvatarInfo {
  avatarId: string;
  avatarName?: string;
  changedAt: number;
}

export interface VRChatState {
  players: VRChatPlayer[];
  instance: VRChatInstanceInfo | null;
  avatar: VRChatAvatarInfo | null;
}

const g = globalThis as unknown as { _vrchatState?: Map<string, VRChatState> };
const stateMap: Map<string, VRChatState> = g._vrchatState ?? new Map();
if (process.env.NODE_ENV !== "production") g._vrchatState = stateMap;

function getOrCreate(userId: string): VRChatState {
  if (!stateMap.has(userId)) {
    stateMap.set(userId, { players: [], instance: null, avatar: null });
  }
  return stateMap.get(userId)!;
}

export function getState(userId: string): VRChatState {
  return getOrCreate(userId);
}

export function addPlayer(userId: string, displayName: string, playerId?: string) {
  const state = getOrCreate(userId);
  if (state.players.some((p) => p.displayName === displayName)) return;
  state.players.push({ displayName, userId: playerId, joinedAt: Date.now() });
}

export function removePlayer(userId: string, displayName: string) {
  const state = getOrCreate(userId);
  state.players = state.players.filter((p) => p.displayName !== displayName);
}

export function setInstance(userId: string, info: Omit<VRChatInstanceInfo, "changedAt">) {
  const state = getOrCreate(userId);
  state.players = [];
  state.instance = { ...info, changedAt: Date.now() };
}

export function setAvatar(userId: string, avatarId: string, avatarName?: string) {
  const state = getOrCreate(userId);
  state.avatar = { avatarId, avatarName, changedAt: Date.now() };
}

export function clearState(userId: string) {
  stateMap.delete(userId);
}
