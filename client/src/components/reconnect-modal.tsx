import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";

interface Props {
  show: boolean;
}

export function ReconnectModal({ show }: Props) {
  useEffect(() => {
    alert("in here");
    if (show)
      setTimeout(() => {
        window.location.reload();
      }, 3000);
  }, [show]);

  return (
    <Modal show={show}>
      <Modal.Header>Reconnecting...</Modal.Header>
      <Modal.Body>Lost connection... Attempting to reconnect.</Modal.Body>
    </Modal>
  );
}
