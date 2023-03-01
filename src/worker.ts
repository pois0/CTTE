import { MessageType } from "./protocol.js";

export {};

self.onmessage = function (e: MessageEvent) {
  switch (e.data[0] as MessageType) {
  case MessageType.TransitionRequest:

  }
};

