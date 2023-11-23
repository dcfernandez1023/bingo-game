export const styles: Record<string, React.CSSProperties> = {
  chatContainer: {
    border: "1px solid lightGray",
    overflowY: "auto",
    height: "565px",
    position: "relative",
    overflowX: "hidden",
  },
  message: {
    borderRadius: "8px",
    margin: "6px",
    padding: "8px",
    wordWrap: "break-word",
    backgroundColor: "#f1f1f1",
    maxWidth: "90%",
    width: "fit-content",
    fontSize: "15px",
    float: "left",
  },
  senderMessage: {
    borderRadius: "8px",
    margin: "6px",
    padding: "8px",
    wordWrap: "break-word",
    backgroundColor: "#85C1E9",
    maxWidth: "90%",
    width: "fit-content",
    fontSize: "15px",
    float: "right",
  },
  sendInputGroup: {
    borderTop: "none",
    position: "sticky",
    bottom: "0",
  },
  sendInputAndButton: {
    borderRadius: "0px",
  },
};
