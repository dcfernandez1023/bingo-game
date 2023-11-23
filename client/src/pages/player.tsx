/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from "react";
import { Game, GameSchema } from "../types/game";
import {
  GAME_EVENTS,
  autofillCards,
  initSocket,
  joinGameSocket,
  makeJoinGameRequest,
  requestCards,
  sendChatMessage,
  subscribeToGame,
} from "../api/game";
import {
  Alert,
  Button,
  Carousel,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { styles } from "../styles/player-styles";
import { Card } from "../components/card";
import { CardCell } from "../types/player";
import { Chat } from "../components/chat";

export function Player(): ReactElement {
  const [game, setGame] = useState<Game>();
  const [playerId, setPlayerId] = useState<string>();
  const [error, setError] = useState<Error>();
  const [currentCall, setCurrentCall] = useState<string>("N/A");
  const [isNewPlayer, setIsNewPlayer] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [autofillDisabled, setAutofillDisabled] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<number>(1);
  const [cardsAutofilled, setCardsAutofilled] = useState<string[]>();
  const [isAnimate, setIsAnimate] = useState<boolean>(true);

  initSocket((errorMessage: string) => setError(new Error(errorMessage)));

  const subscribe = () => {
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
          if (gameSnapshot.currentDrawn.length > 0) {
            const newCall =
              gameSnapshot.currentDrawn[gameSnapshot.currentDrawn.length - 1];
            setCurrentCall(newCall);
            setIsAnimate(!isAnimate);
            setTimeout(() => {
              setIsAnimate(false);
            }, 1000);
          } else setCurrentCall("N/A");
        }
      } catch (err) {
        console.log(err);
        setError(err as Error);
      }
    });
  };

  const displayNumCardsRequested = (): string => {
    try {
      if (game && playerId) {
        const requestId = game.players[playerId].currentPurchaseRequestId;
        for (let i = 0; i < game.purchaseRequests.length; i++) {
          const request = game.purchaseRequests[i];
          if (request.id === requestId) {
            if (request.isFulfilled)
              return `You have been granted ${request.numCardsToPurchase} card${
                request.numCardsToPurchase === 1 ? "" : "s"
              }.`;
            else
              return `You have requested ${request.numCardsToPurchase} card${
                request.numCardsToPurchase === 1 ? "" : "s"
              }.`;
          }
        }
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  const joinGame = () => {
    try {
      const name = (document.getElementById("player-name") as HTMLInputElement)
        .value;
      if (!name.trim()) {
        alert("Please enter a name");
        return;
      }
      joinGameSocket(name, (result: string) => {
        if (result === "success") {
          subscribe();
          setIsNewPlayer(false);
        } else {
          setError(new Error(result));
        }
      });
    } catch (e) {
      setError(e as Error);
    }
  };

  const isMobile = () => {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];
    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  };

  const renderError = () => {
    return (
      <Row>
        <Col lg={isMobile() ? 12 : 4}>
          {error ? (
            <Alert
              variant="info"
              onClose={() => setError(undefined)}
              dismissible
            >
              {error.message}
            </Alert>
          ) : (
            <div></div>
          )}
        </Col>
      </Row>
    );
  };

  const handleAutofill = () => {
    setAutofillDisabled(true);
    autofillCards((results: string[]) => {
      setCardsAutofilled(results);
    });
  };

  const displayCardsAutofilled = () => {
    if (!cardsAutofilled) return <div></div>;
    if (cardsAutofilled.length === 0)
      return <div style={styles.autofillInfo}>ℹ️ No cards were autofilled</div>;
    return (
      <div style={styles.autofillInfo}>
        ℹ️{" "}
        {cardsAutofilled.length === 1
          ? `Card ${cardsAutofilled.toString()} was autofilled`
          : `Cards ${cardsAutofilled.toString()} were autofilled`}
      </div>
    );
  };

  useEffect(() => {
    setIsAnimate(true);
    setAutofillDisabled(false);
    setCardsAutofilled(undefined);
    makeJoinGameRequest((result: { status: string; playerId: string }) => {
      try {
        if (result.status === "existing") subscribe();
        else if (result.status === "new") setIsNewPlayer(true);
        else setError(new Error(result.status));
        setPlayerId(result.playerId);
      } catch (e) {
        setError(e as Error);
      }
    });
  }, [currentCall]);

  if (isNewPlayer) {
    return (
      <div style={styles.centeredContainer}>
        {renderError()}
        <div style={styles.input}>
          <Form.Control id="player-name" placeholder="Enter a name" />
          <Button style={styles.button} variant="success" onClick={joinGame}>
            Continue
          </Button>
        </div>
      </div>
    );
  }
  if (game == null) return <div>No such game</div>;
  if (!playerId) return <div>No such player</div>;
  if (!game.isRoundActive) {
    return (
      <div style={styles.waitingContainer}>
        {renderError()}
        <div style={styles.break}></div>
        <div>
          <h3>{game.name}</h3>
          <p>
            Joined as: <strong>{game.players[playerId].name}</strong>
          </p>
        </div>
        <div style={styles.break}>
          {!game.players[playerId].currentPurchaseRequestId ? (
            <div>
              <div className="d-flex justify-content-center">
                <InputGroup style={styles.input}>
                  <InputGroup.Text id="number-cards-addon">
                    Number of Cards
                  </InputGroup.Text>
                  <Form.Select
                    id="num-cards-request"
                    aria-describedby="number-cards-addon"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num: number) => {
                      return (
                        <option
                          key={`card-request-option${num}`}
                          value={num.toString()}
                        >
                          {num}
                        </option>
                      );
                    })}
                  </Form.Select>
                </InputGroup>
              </div>
              <Button
                style={styles.button}
                variant="success"
                onClick={() => {
                  try {
                    const numCardsToPurchase = (
                      document.getElementById(
                        "num-cards-request",
                      ) as HTMLSelectElement
                    ).value;
                    requestCards(parseInt(numCardsToPurchase));
                  } catch (e) {
                    setError(e as Error);
                  }
                }}
              >
                Request
              </Button>
            </div>
          ) : (
            <div>{displayNumCardsRequested()}</div>
          )}
        </div>
        <div style={styles.break}></div>
        <div>
          <div>Waiting for the host to start the round...</div>
          <div>
            <Spinner style={styles.spinner} size="sm" />
          </div>
        </div>
      </div>
    );
  }

  if (isMobile()) {
    return (
      <Container fluid>
        <br />
        {renderError()}
        <Row style={styles.currentCallContainer}>
          <Col>
            <p>
              Current Call:{" "}
              <span
                className={isAnimate ? "bingo-number-animate" : "bingo-number"}
                style={styles.currentCall}
              >
                {currentCall}
              </span>
            </p>
            {displayCardsAutofilled()}
            <Button
              style={styles.optionButton}
              variant="success"
              size="sm"
              onClick={handleAutofill}
              disabled={autofillDisabled}
            >
              Auto Fill
            </Button>
            <Button
              size="sm"
              variant="secondary"
              style={styles.optionButton}
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? "Hide Chat" : "Show Chat"}
            </Button>
          </Col>
        </Row>
        <br />
        <div style={styles.swipePrompt}>
          {game.players[playerId].cards.length > 1 ? (
            `Swipe left or right to view your cards`
          ) : (
            <span></span>
          )}
        </div>
        <div style={styles.mobileCurrentCard}>
          Card {game.players[playerId].cards.length ? currentCard : 0} of{" "}
          {game.players[playerId].cards.length}
        </div>
        <Carousel
          indicators={false}
          interval={null}
          onSelect={(eventKey: number) => setCurrentCard(eventKey + 1)}
        >
          {game.players[playerId].cards.map(
            (card: CardCell[], cardIndex: number) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <Carousel.Item key={`card-${cardIndex}`}>
                  <Card card={card} cardIndex={cardIndex} colSpan={12} />
                </Carousel.Item>
              );
            },
          )}
        </Carousel>
        {showChat ? (
          <Row style={styles.mobileChatContainer}>
            <Col>
              <h3 style={styles.chatHeader}>Chat</h3>
              <Chat
                messages={game.messages}
                myId={playerId}
                onSend={(msg: string) => {
                  try {
                    sendChatMessage(msg);
                  } catch (e) {
                    setError(e as Error);
                  }
                }}
              />
            </Col>
          </Row>
        ) : (
          <div></div>
        )}
      </Container>
    );
  }
  return (
    <Container fluid style={styles.desktopContainer}>
      <br />
      {renderError()}
      <Row>
        <Col lg={showChat ? 9 : 12}>
          <Row style={styles.currentCallContainer}>
            <Col>
              <p>
                Current Call:{" "}
                <span
                  className={
                    isAnimate ? "bingo-number-animate" : "bingo-number"
                  }
                  style={styles.currentCall}
                >
                  {currentCall}
                </span>
              </p>
              {displayCardsAutofilled()}
              <Button
                style={styles.optionButton}
                variant="success"
                size="sm"
                onClick={handleAutofill}
                disabled={autofillDisabled}
              >
                Auto Fill
              </Button>
              <Button
                size="sm"
                variant="secondary"
                style={styles.optionButton}
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? "Hide Chat" : "Show Chat"}
              </Button>
            </Col>
          </Row>
          <Row>
            {game.players[playerId].cards.map(
              (card: CardCell[], cardIndex: number) => {
                // eslint-disable-next-line react/jsx-key
                return <Card card={card} cardIndex={cardIndex} />;
              },
            )}
          </Row>
        </Col>
        {showChat ? (
          <Col lg={3}>
            <h3 style={styles.chatHeader}>Chat</h3>
            <Chat
              messages={game.messages}
              myId={playerId}
              onSend={(msg: string) => {
                try {
                  sendChatMessage(msg);
                } catch (e) {
                  setError(e as Error);
                }
              }}
            />
          </Col>
        ) : (
          <Col></Col>
        )}
      </Row>
    </Container>
  );
}
