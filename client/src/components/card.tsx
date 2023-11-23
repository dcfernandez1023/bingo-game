import React from "react";
import { Row, Col, ListGroup } from "react-bootstrap";
import { styles } from "../styles/card-styles";
import { CardCell } from "../types/player";
import { selectCell } from "../api/game";

interface Props {
  card: CardCell[];
  cardIndex: number;
  colSpan?: number;
}

export function Card({ card, cardIndex, colSpan }: Props) {
  return (
    <Col md={colSpan ? colSpan : 4}>
      <div style={styles.cardStyle}>
        <Row>
          {["B", "I", "N", "G", "O"].map((letter: string) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <Col style={styles.gridHeaderStyle}>
                <strong>{letter}</strong>
              </Col>
            );
          })}
        </Row>
        <div>
          {Array.from({ length: 5 }, (_, i) => i).map((col: number) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <Row>
                {Array.from({ length: 5 }, (_, i) => i).map((row: number) => {
                  const index = row * 5 + col;
                  const cellVal =
                    card[index].val === -1
                      ? "FREE"
                      : card[index].val.toString();
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <Col
                      action
                      style={styles.gridStyle}
                      as={ListGroup.Item}
                      variant={card[index].isChecked ? "warning" : "light"}
                      onClick={() => selectCell(cardIndex, cellVal)}
                    >
                      <div style={styles.cellSpan}>{cellVal}</div>
                    </Col>
                  );
                })}
              </Row>
            );
          })}
        </div>
      </div>
    </Col>
  );
}
