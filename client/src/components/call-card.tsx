/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement } from "react";
import { styles } from "../styles/call-card-styles";
import { Row, Col } from "react-bootstrap";

interface Props {
  board: number[][];
}

const LETTERS = ["B", "I", "N", "G", "O"];

export function CallCard({ board }: Props): ReactElement {
  return (
    <div style={styles.container}>
      <Row style={styles.letterRow}>
        {LETTERS.map((letter: string) => {
          return <Col style={styles.letter}>{letter}</Col>;
        })}
      </Row>
      <div>
        {Array.from({ length: 15 }, (_, i) => i).map((col: number) => {
          return (
            <Row>
              {Array.from({ length: 5 }, (_, i) => i).map((row: number) => {
                const num = row * 15 + col + 1;
                return board[row][col] === 1 ? (
                  <Col style={styles.calledCell}>
                    <div style={styles.cellSpan}>{num}</div>
                  </Col>
                ) : (
                  <Col style={styles.cell}>
                    <div style={styles.cellSpan}>{num}</div>
                  </Col>
                );
              })}
            </Row>
          );
        })}
      </div>
    </div>
  );
  /*
  return (
    <div style={styles.container}>
      <h5 style={styles.header}>Call Card</h5>
      {LETTERS.map((letter: string, index: number) => {
        return (
          <Row key={`${letter}${index}`}>
            <Col>{LETTERS[index]}</Col>
            {board[index].map((num: number, numIndex: number) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <Col style={styles.cell}>{index * 15 + numIndex + 1}</Col>
              );
            })}
          </Row>
        );
      })}
    </div>
  );
  */
}
