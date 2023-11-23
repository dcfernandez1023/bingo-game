import express from "express";
import path from "path";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve("..", "client/build", "index.html"));
});
router.get("/host", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve("..", "client/build", "index.html"));
});
router.get("/player", (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve("..", "client/build", "index.html"));
});

export default router;
