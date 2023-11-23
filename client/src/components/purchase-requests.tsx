import React, { ReactElement, useEffect, useState } from "react";
import { Game, PurchaseRequest } from "../types/game";
import { Button, Col, Row, Toast } from "react-bootstrap";
import { timeAgo } from "../util/timeAgo";
import { styles } from "../styles/purchase-requests-styles";

interface Props {
  game: Game;
  onHandleRequest: (cardRequestId: string, action: "grant" | "decline") => void;
}

const MINUTE_MS = 60000;

export function PurchaseRequests({
  game,
  onHandleRequest,
}: Props): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timestamp, setTimestamp] = useState<number>();

  const formatMessage = (playerId: string, numCards: number) => {
    return `${game.players[playerId].name} wants to purchase ${numCards} card${
      numCards === 1 ? "" : "s"
    }`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Refreshing state");
      setTimestamp(new Date().getTime());
    }, MINUTE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div>
        {game.purchaseRequests.map((purchaseRequest: PurchaseRequest) => {
          if (purchaseRequest.isFulfilled) return <div></div>;
          return (
            <div
              key={purchaseRequest.id}
              className="d-flex justify-content-center"
            >
              <Toast style={styles.toast}>
                <Toast.Header closeButton={false}>
                  <strong className="me-auto">Card Request</strong>
                  <small>{timeAgo(purchaseRequest.timestamp)}</small>
                </Toast.Header>
                <Toast.Body>
                  <Row>
                    <Col>
                      {formatMessage(
                        purchaseRequest.playerId,
                        purchaseRequest.numCardsToPurchase,
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6} style={styles.col}>
                      <Button
                        variant="success"
                        size="sm"
                        style={styles.button}
                        onClick={() =>
                          onHandleRequest(purchaseRequest.id, "grant")
                        }
                      >
                        Grant
                      </Button>
                    </Col>
                    <Col xs={6} style={styles.col}>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={styles.button}
                        onClick={() =>
                          onHandleRequest(purchaseRequest.id, "decline")
                        }
                      >
                        Decline
                      </Button>
                    </Col>
                  </Row>
                </Toast.Body>
              </Toast>
            </div>
          );
        })}
      </div>
    </div>
  );
}
