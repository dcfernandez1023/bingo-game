import React, { ReactElement } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { styles } from "../styles/error-styles";

export function Error({ error }: { error: Error }): ReactElement {
  return (
    <Container style={styles.container}>
      <br />
      <br />
      <br />
      <Row>
        <Col>An error occurred: {error.message}</Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
