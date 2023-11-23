import React from "react";
import { type ReactElement } from "react";
import { Modal, ListGroup } from "react-bootstrap";
import { Player } from "../types/player";

interface Props {
  show: boolean;
  players: Record<string, Player>;
  handleClose: () => void;
}

export function PlayersModal({
  show,
  players,
  handleClose,
}: Props): ReactElement {
  const playersList = ((): Player[] => {
    return Object.keys(players)
      .map((key: string) => {
        return players[key];
      })
      .sort((p1: Player, p2: Player) => p1.joinedAt - p2.joinedAt);
  })();

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>Players</Modal.Header>
      <Modal.Body>
        {playersList.length === 0 ? (
          <p>No players have joined</p>
        ) : (
          <ListGroup variant="flush">
            {playersList.map((player: Player) => {
              return (
                <ListGroup.Item key={player.id}>{player.name}</ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
}
