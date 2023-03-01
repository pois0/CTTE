export const MessageType = {
  TransitionRequest: 0,
  AntialiasingRequest: 1,
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
