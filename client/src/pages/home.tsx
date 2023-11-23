import React, { useState } from "react";
import { type ReactElement } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { styles } from "../styles/home-styles";
import { CreateGameModal } from "../components/create-game-modal";
import { joinGameREST } from "../api/game";

export function Home(): ReactElement {
  const [show, setShow] = useState(false);

  const onJoinGame = async () => {
    try {
      const gameId = (
        document.getElementById("input-game-id") as HTMLInputElement
      ).value;
      if (!gameId.trim()) {
        alert("Please enter a game ID");
        return;
      }
      await joinGameREST(gameId);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <Container style={styles.container}>
      <Row className="align-items-center vh-100">
        <Col xs={12} className="text-center">
          <h2 style={styles.header}>Ferns Bingo</h2>
          <Form.Control id="input-game-id" placeholder="Game ID" />
          <div>
            <Button
              variant="dark"
              style={styles.enterButton}
              onClick={() => onJoinGame()}
            >
              Enter
            </Button>
          </div>
          <div style={styles.orText}>OR</div>
          <div>
            <Button
              variant="success"
              style={styles.createButton}
              onClick={() => {
                setShow(true);
              }}
            >
              Create Game
            </Button>
          </div>
        </Col>
      </Row>
      <CreateGameModal
        show={show}
        handleClose={() => {
          setShow(false);
        }}
      />
    </Container>
  );
}
