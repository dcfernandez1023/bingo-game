/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { type ReactElement } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Modal,
  Dropdown,
} from "react-bootstrap";
import {
  GAME_EVENTS,
  initSocket,
  clearPattern,
  endRound,
  handleCardRequest,
  patternSelect,
  shuffle,
  startRound,
  subscribeToGame,
  sendChatMessage,
  endGame,
} from "../api/game";
import { type Game, GameSchema } from "../types/game";
import { Pattern } from "../components/pattern";
import { styles } from "../styles/host-styles";
import { CallCard } from "../components/call-card";
import { PlayersModal } from "../components/players-modal";
import { PurchaseRequests } from "../components/purchase-requests";
import { Chat } from "../components/chat";
import { RiseLoader } from "react-spinners";

export function Host(): ReactElement {
  const [game, setGame] = useState<Game>();
  const [error, setError] = useState<Error>();
  const [currentCall, setCurrentCall] = useState<string>("N/A");
  const [showPlayers, setShowPlayers] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isEndRound, setIsEndRound] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);

  initSocket((errorMessage: string) => setError(new Error(errorMessage)));

  useEffect(() => {
    subscribeToGame((event: GAME_EVENTS, data: string) => {
      try {
        if (event === GAME_EVENTS.NOTIFY) {
          if (!data) {
            alert("Game has ended");
            window.location.href = "/";
            return;
          }
          const gameSnapshot = GameSchema.parse(JSON.parse(data));
          setGame(gameSnapshot);
          if (gameSnapshot.currentDrawn.length > 0)
            setCurrentCall(
              gameSnapshot.currentDrawn[gameSnapshot.currentDrawn.length - 1],
            );
          else setCurrentCall("N/A");
        }
      } catch (err) {
        console.log(err);
        setError(err as Error);
      }
    });
  }, []);

  if (game == null) return <div>No Game</div>;
  return (
    <Container style={styles.container} fluid>
      <Row>
        <Col lg={6}>
          <Modal show={Boolean(error)} onHide={() => setError(undefined)}>
            <Modal.Header closeButton>Error</Modal.Header>
            <Modal.Body>
              {error ? error.message : "An unexpected error occurred"}
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
      <Row>
        <Col md={3} style={styles.col}>
          <div>
            <Row>
              <Col>
                <h2>{game.name}</h2>
              </Col>
              <Col>
                <Dropdown>
                  <Dropdown.Toggle
                    style={styles.dropdownOptions}
                    variant="dark"
                  >
                    ⚙️
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setIsEndGame(true)}>
                      End Game
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
            <p style={styles.gameIdText}>
              Game ID: <strong>{game.id}</strong>
            </p>
            <hr />
            <Pattern
              pattern={game.currentPattern}
              isRoundActive={game.isRoundActive}
              onSelectCell={(row: number, col: number) => {
                try {
                  if (!game.isRoundActive) patternSelect(row, col);
                } catch (e) {
                  setError(e as Error);
                  console.error(e);
                }
              }}
            />
            <Row style={styles.buttonContainer}>
              <Col xs={6}>
                <Button
                  variant="dark"
                  style={styles.button}
                  disabled={game.isRoundActive}
                  onClick={() => {
                    try {
                      clearPattern();
                    } catch (e) {
                      setError(e as Error);
                      console.error(e);
                    }
                  }}
                >
                  Clear Pattern
                </Button>
              </Col>
              <Col xs={6}>
                <Button
                  variant="dark"
                  style={styles.button}
                  onClick={() => {
                    try {
                      setShowPlayers(true);
                    } catch (e) {
                      setError(e as Error);
                      console.error(e);
                    }
                  }}
                >
                  Players
                </Button>
              </Col>
            </Row>
            <Row style={styles.buttonContainer}>
              <Col xs={6}>
                <Button
                  variant="dark"
                  style={styles.button}
                  disabled={!game.isRoundActive || isShuffling}
                  onClick={() => {
                    try {
                      setIsShuffling(true);
                      const audio = new Audio("bingo-noise.wav");
                      audio.play();
                      setTimeout(() => {
                        shuffle();
                        setIsShuffling(false);
                        audio.pause();
                      }, 3000);
                    } catch (e) {
                      setError(e as Error);
                      console.error(e);
                    }
                  }}
                >
                  Draw
                </Button>
              </Col>
              <Col xs={6}>
                <Button
                  variant="dark"
                  style={styles.button}
                  onClick={() => {
                    try {
                      if (!game.isRoundActive) startRound();
                      else setIsEndRound(true);
                    } catch (e) {
                      setError(e as Error);
                      console.error(e);
                    }
                  }}
                >
                  {!game.isRoundActive ? "Start Round" : "End Round"}
                </Button>
              </Col>
              {isShuffling ? (
                <Col xs={12}>
                  <div style={styles.drawLoader}>
                    <RiseLoader color="#36d7b7" />
                  </div>
                </Col>
              ) : (
                <div style={styles.currentCall}>
                  <p>Current Call</p>
                  <h1>{currentCall}</h1>
                </div>
              )}
            </Row>
          </div>
        </Col>
        <Col md={6} style={styles.col}>
          <CallCard board={game.board} />
        </Col>
        <Col md={3} style={styles.col}>
          {game.isRoundActive ? (
            <div>
              <h3 style={styles.chatHeader}>Chat</h3>
              <Chat
                messages={game.messages}
                myId="HOST"
                onSend={(msg: string) => {
                  try {
                    sendChatMessage(msg);
                  } catch (e) {
                    setError(e as Error);
                  }
                }}
              />
            </div>
          ) : (
            <PurchaseRequests game={game} onHandleRequest={handleCardRequest} />
          )}
        </Col>
      </Row>
      <PlayersModal
        show={showPlayers}
        players={game.players}
        handleClose={() => {
          try {
            setShowPlayers(false);
          } catch (e) {
            setError(e as Error);
            console.error(e);
          }
        }}
      />
      <Modal show={isEndRound} onHide={() => setIsEndRound(false)}>
        <Modal.Header closeButton>End Round</Modal.Header>
        <Modal.Body>Are you sure you want to end this round?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              try {
                endRound();
                setIsEndRound(false);
              } catch (e) {
                setError(e as Error);
              }
            }}
          >
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setIsEndRound(false)}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isEndGame} onHide={() => setIsEndGame(false)}>
        <Modal.Header closeButton>End Game</Modal.Header>
        <Modal.Body>Are you sure you want to end this game?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              try {
                if (!game) throw new Error("No such game");
                endGame(game.id, () => (window.location.href = "/"));
                setIsEndGame(false);
              } catch (e) {
                setError(e as Error);
              }
            }}
          >
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setIsEndGame(false)}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
