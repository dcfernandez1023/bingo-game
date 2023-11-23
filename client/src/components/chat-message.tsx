import React, { ReactElement } from "react";
import { styles } from "../styles/chat-styles";
import { Message } from "../types/game";

interface Props {
  message: Message;
  messageType: "sender" | "receiver";
}

export function ChatMessage({ message, messageType }: Props): ReactElement {
  switch (messageType) {
    case "sender":
      return <p style={styles.senderMessage}>{message.message}</p>;
    case "receiver":
      return <p style={styles.message}>{message.message}</p>;
    default:
      return <p style={styles.senderMessage}>{message.message}</p>;
  }
}
