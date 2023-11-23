/* eslint-disable react/jsx-key */
import React, { ReactElement } from "react";
import { styles } from "../styles/pattern-styles";
import { Row, Col } from "react-bootstrap";
import "../styles/global.css";

interface Props {
  pattern: number[][];
  isRoundActive: boolean;
  onSelectCell: (row: number, col: number) => void;
}

export function Pattern({
  pattern,
  isRoundActive,
  onSelectCell,
}: Props): ReactElement {
  return (
    <div style={styles.patternBody}>
      <p>Pattern</p>
      {pattern.map((arr: number[], row: number) => {
        return (
          <Row>
            {arr.map((val: number, col: number) => {
              const style = {
                ...styles.patternCell,
                ...(val === 1 && styles.patternCellActive),
              };
              return (
                <Col
                  className={val !== 1 && !isRoundActive ? "pattern-cell" : ""}
                  style={style}
                  onClick={() => onSelectCell(row, col)}
                ></Col>
              );
            })}
          </Row>
        );
      })}
    </div>
  );
}
