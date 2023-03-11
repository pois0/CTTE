export const MessageType = {
  TransitionRequest: 0,
  AntialiasingRequest: 1,
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export interface Request {
  messageType: MessageType;
  from: SharedArrayBuffer;
  to: SharedArrayBuffer;
  offsetX: number,
  lengthX: number,
  height: number;
  width: number;
}

export interface TransitionRequest extends Request {
  magic: number
}

export function requestTransition(
  from: SharedArrayBuffer,
  to: SharedArrayBuffer,
  offsetX: number,
  lengthX: number,
  height: number,
  width: number,
  magic: number
): TransitionRequest {
  return {
    messageType: MessageType.TransitionRequest,
    from: from,
    to: to,
    offsetX: offsetX,
    lengthX: lengthX,
    height: height,
    width: width,
    magic: magic
  };
}

export function requestAntialiasing(
  from: SharedArrayBuffer,
  to: SharedArrayBuffer,
  offsetX: number,
  lengthX: number,
  height: number,
  width: number
): Request {
  return {
    messageType: MessageType.AntialiasingRequest,
    from: from,
    to: to,
    offsetX: offsetX,
    lengthX: lengthX,
    height: height,
    width: width
  };
}
