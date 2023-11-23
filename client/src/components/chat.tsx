import React, { ReactElement, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { styles } from "../styles/chat-styles";
import { Message } from "../types/game";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";

interface Props {
  messages: Message[];
  myId: string;
  onSend: (message: string) => void;
}

export function Chat({ messages, myId, onSend }: Props): ReactElement {
  const chatScroll = () => {
    const chatContainer = document.getElementById(
      "chat-container",
    ) as HTMLDivElement;
    chatContainer.scroll({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSend = () => {
    const messageInput = document.getElementById(
      "message-input",
    ) as HTMLInputElement;
    const msg = messageInput.value;
    if (msg) {
      onSend(msg);
      messageInput.value = "";
    }
  };

  useEffect(() => {
    // Scrolls to bottom after user sends message
    chatScroll();
  }, [messages]);

  return (
    <div>
      <div id="chat-container" style={styles.chatContainer}>
        {messages.map((message) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <Row>
              <Col>
                <ChatMessage
                  key={message.id}
                  message={message}
                  messageType={
                    myId === message.senderId ? "sender" : "receiver"
                  }
                />
              </Col>
            </Row>
          );
        })}
      </div>
      <InputGroup style={styles.sendInputGroup}>
        <Form.Control
          id="message-input"
          placeholder="Type message"
          style={styles.sendInputAndButton}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.keyCode === 13) {
              handleSend();
            }
          }}
        />
        <Button
          variant="success"
          style={styles.sendInputAndButton}
          onClick={handleSend}
        >
          Send
        </Button>
      </InputGroup>
    </div>
  );
}
