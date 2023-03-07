export const MessageType = {
  TransitionRequest: 0,
  AntialiasingRequest: 1,
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export interface Request {
  messageType: MessageType;
  array: Float32Array;
  height: number;
  width: number;
}

export function requestTransition(array: Float32Array, height: number, width: number): Request {
  return {
    messageType: MessageType.TransitionRequest,
    array: array,
    height: height,
    width: width
  };
}

export function requestAntialiasing(array: Float32Array, height: number, width: number): Request {
  return {
    messageType: MessageType.AntialiasingRequest,
    array: array,
    height: height,
    width: width
  };
}
