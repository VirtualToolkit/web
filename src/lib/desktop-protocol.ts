export interface Envelope<T extends string, D extends object> {
  type: T;

  ts: number;

  data: D;
}

export type HelloMessage = Envelope<
  "hello",
  {
    version: string;

    features: string[];
  }
>;

export type HeartbeatMessage = Envelope<"heartbeat", Record<string, never>>;

export type PlayerJoinedMessage = Envelope<
  "player_joined",
  {
    displayName: string;

    userId?: string;
  }
>;

export type PlayerLeftMessage = Envelope<
  "player_left",
  {
    displayName: string;
    userId?: string;
  }
>;

export type InstanceChangedMessage = Envelope<
  "instance_changed",
  {
    worldId: string;
    instanceId: string;

    worldName?: string;

    instanceType?: string;
  }
>;

export type AvatarChangedMessage = Envelope<
  "avatar_changed",
  {
    avatarId: string;
    avatarName?: string;
  }
>;

export type OscParameterMessage = Envelope<
  "osc_parameter",
  {
    parameter: string;

    value: number | boolean | string;
  }
>;

export type ChatboxMessage = Envelope<
  "chatbox",
  {
    text: string;

    typing: boolean;
  }
>;

export type DesktopConnectedMessage = Envelope<
  "desktop_connected",
  {
    version?: string;
    features?: string[];
  }
>;

export type DesktopDisconnectedMessage = Envelope<"desktop_disconnected", Record<string, never>>;

export type IncomingMessage =
  | HelloMessage
  | HeartbeatMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | InstanceChangedMessage
  | AvatarChangedMessage
  | OscParameterMessage
  | ChatboxMessage;

export type OutgoingMessage =
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | InstanceChangedMessage
  | AvatarChangedMessage
  | OscParameterMessage
  | ChatboxMessage
  | DesktopConnectedMessage
  | DesktopDisconnectedMessage;

const KNOWN_TYPES = new Set<string>([
  "hello",
  "heartbeat",
  "player_joined",
  "player_left",
  "instance_changed",
  "avatar_changed",
  "osc_parameter",
  "chatbox",
]);

export function parseIncoming(raw: unknown): IncomingMessage | null {
  let parsed: unknown;

  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).type !== "string" ||
    typeof (parsed as Record<string, unknown>).ts !== "number" ||
    typeof (parsed as Record<string, unknown>).data !== "object"
  ) {
    return null;
  }

  const msg = parsed as IncomingMessage;
  if (!KNOWN_TYPES.has(msg.type)) return null;

  return msg;
}

export function makeMessage<T extends string, D extends object>(type: T, data: D): Envelope<T, D> {
  return { type, ts: Date.now(), data };
}
