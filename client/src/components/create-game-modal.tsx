import React, { useState } from "react";
import { type ReactElement } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { createGame } from "../api/game";
import { styles } from "../styles/create-game-modal-styles";

interface Props {
  show: boolean;
  handleClose: () => void;
}

export function CreateGameModal({ show, handleClose }: Props): ReactElement {
  const [error, setError] = useState<Error>();

  const onCreate = async (): Promise<void> => {
    const val = (document.getElementById("input-game-name") as HTMLInputElement)
      .value;
    const name = val.length > 0 ? val : "";
    if (name.trim().length === 0) return;
    const result = await createGame(name);
    if (result === "Success") window.location.href = "/host";
    else setError(new Error(result));
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setError(undefined);
        handleClose();
      }}
    >
      <Modal.Header closeButton>Create Game</Modal.Header>
      <Modal.Body style={styles}>
        <Form.Control id="input-game-name" placeholder="Enter a name" />
        <div>
          {error ? (
            <Alert
              variant="info"
              onClose={() => setError(undefined)}
              dismissible
              style={styles.errorAlert}
            >
              {error.message}
            </Alert>
          ) : (
            <span></span>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={() => {
            void onCreate();
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
