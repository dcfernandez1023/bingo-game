"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const auth_1 = require("../util/auth");
const InfoError_1 = __importDefault(require("../errors/InfoError"));
const MAX_PLAYERS = 75;
// Ranges for each column (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
const COLUMN_RANGES = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 },
    { min: 46, max: 60 },
    { min: 61, max: 75 },
];
const LETTERS = ["B", "I", "N", "G", "O"];
class GameManager {
    constructor() {
        this.games = {};
    }
    isGame(gameId) {
        return Boolean(this.games[gameId]);
    }
    isPlayerInGame(gameId, playerId) {
        return (Boolean(this.games[gameId]) &&
            Boolean(this.games[gameId].players[playerId]));
    }
    createGame(name) {
        try {
            const gameId = Math.floor(100000 + Math.random() * 900000).toString();
            const newGame = {
                id: gameId,
                sessionId: (0, auth_1.generateSessionId)(),
                name: name,
                board: this.newBoard(),
                availableNumbers: Array.from({ length: 75 }, (_, i) => i + 1),
                players: {},
                startedAt: new Date().getTime(),
                isRoundActive: false,
                currentPattern: this.emptyPattern(),
                currentDrawn: [],
                purchaseRequests: [],
                messages: [],
                createdOn: new Date().getTime(),
            };
            this.games[gameId] = newGame;
            return newGame;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    editPattern(gameId, sessionId, row, col) {
        try {
            if (!this.isAuthorized(gameId, sessionId))
                return null;
            if (this.games[gameId].isRoundActive)
                return null;
            const state = this.games[gameId].currentPattern[row][col];
            this.games[gameId].currentPattern[row][col] = state === 1 ? 0 : 1;
            return this.games[gameId];
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    clearPattern(gameId, sessionId) {
        try {
            if (!this.isAuthorized(gameId, sessionId))
                return null;
            this.games[gameId].currentPattern = this.emptyPattern();
            return this.games[gameId];
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    startRound(gameId, sessionId) {
        if (!this.isAuthorized(gameId, sessionId))
            return null;
        if (this.isPatternEmpty(gameId) ||
            !this.haveCardRequestsBeenFulfilled(gameId))
            throw new InfoError_1.default("Please select a pattern and attend to all card requests before starting the round");
        this.games[gameId].isRoundActive = true;
        this.games[gameId].purchaseRequests = [];
        this.games[gameId].messages = [];
        return this.games[gameId];
    }
    endRound(gameId, sessionId) {
        if (!this.isAuthorized(gameId, sessionId))
            return null;
        this.games[gameId].currentPattern = this.emptyPattern();
        this.games[gameId].currentDrawn = [];
        this.games[gameId].availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
        this.games[gameId].board = this.newBoard();
        this.games[gameId].isRoundActive = false;
        this.games[gameId].currentDrawn = [];
        this.games[gameId].messages = [];
        for (const playerId of Object.keys(this.games[gameId].players)) {
            this.games[gameId].players[playerId].currentPurchaseRequestId = "";
            this.games[gameId].players[playerId].cards = [];
        }
        return this.games[gameId];
    }
    generatePlayerId(gameId) {
        if (!this.games[gameId])
            return null;
        return (0, uuid_1.v4)();
    }
    join(name, gameId, playerId) {
        try {
            if (!playerId ||
                !this.games[gameId] ||
                this.games[gameId].players[playerId] ||
                Object.keys(this.games[gameId].players).length >= MAX_PLAYERS)
                return false;
            const newPlayer = {
                id: playerId,
                name: name,
                joinedAt: new Date().getTime(),
                cards: [],
                currentPurchaseRequestId: "",
            };
            this.games[gameId].players[playerId] = newPlayer;
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    delete(gameId, sessionId) {
        if (!this.isAuthorized(gameId, sessionId))
            return false;
        delete this.games[gameId];
        return true;
    }
    leave(gameId, playerId) {
        try {
            if (!this.games[gameId] || !this.games[gameId].players[playerId])
                return false;
            delete this.games[gameId].players[playerId];
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    shuffle(gameId, sessionId) {
        try {
            if (!this.isAuthorized(gameId, sessionId) ||
                !this.games[gameId].availableNumbers.length ||
                !this.games[gameId].isRoundActive) {
                console.log("in here");
                return null;
            }
            const min = 0;
            const max = this.games[gameId].availableNumbers.length - 1;
            const chosenIndex = Math.floor(Math.random() * (max - min + 1) + min);
            const chosen = this.games[gameId].availableNumbers[chosenIndex];
            const letterIndex = this.getLetterIndex(chosen);
            if (letterIndex === -1)
                return null;
            this.games[gameId].availableNumbers.splice(chosenIndex, 1);
            this.games[gameId].currentDrawn.push(`${LETTERS[letterIndex]}${chosen}`);
            this.games[gameId].board[letterIndex][chosen - 15 * letterIndex - 1] = 1;
            return this.games[gameId];
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    newBoard() {
        const board = [];
        for (let col = 0; col < COLUMN_RANGES.length; col++) {
            let start = COLUMN_RANGES[col].min;
            const end = COLUMN_RANGES[col].max;
            const nums = [];
            while (start <= end) {
                nums.push(0);
                start++;
            }
            board.push(nums);
        }
        return board;
    }
    newCard() {
        const bingoCard = [];
        // Generate random numbers for each column without duplicates
        for (let col = 0; col < 5; col++) {
            const column = [];
            const { min, max } = COLUMN_RANGES[col];
            while (column.length < 5) {
                // FREE cell
                if (col === 2 && column.length === 2) {
                    column.push(-1);
                }
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!column.includes(randomNum)) {
                    column.push(randomNum);
                }
            }
            Array.prototype.push.apply(bingoCard, column.map((c) => ({ val: c, isChecked: false })));
        }
        return bingoCard;
    }
    emptyPattern() {
        const pattern = [];
        for (let i = 0; i < 5; i++)
            pattern.push([0, 0, 0, 0, 0]);
        return pattern;
    }
    requestCards(gameId, playerId, numCardsToPurchase) {
        try {
            if (this.games[gameId] &&
                this.games[gameId].players[playerId] &&
                !this.games[gameId].players[playerId].currentPurchaseRequestId) {
                const purchaseRequestId = (0, uuid_1.v4)();
                this.games[gameId].purchaseRequests.push({
                    id: purchaseRequestId,
                    playerId: playerId,
                    numCardsToPurchase: numCardsToPurchase,
                    timestamp: new Date().getTime(),
                    isFulfilled: false,
                });
                this.games[gameId].players[playerId].currentPurchaseRequestId =
                    purchaseRequestId;
                return this.games[gameId];
            }
            return null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    grantCards(gameId, sessionId, cardRequestId) {
        if (!this.isAuthorized(gameId, sessionId))
            return null;
        const cardRequestIndex = this.games[gameId].purchaseRequests.findIndex((pr) => {
            return pr.id === cardRequestId;
        });
        if (cardRequestIndex === -1)
            return null;
        const cardRequest = this.games[gameId].purchaseRequests[cardRequestIndex];
        const playerId = cardRequest.playerId;
        if (this.games[gameId].players[playerId]) {
            for (let i = 0; i < cardRequest.numCardsToPurchase; i++) {
                this.games[gameId].players[playerId].cards.push(this.newCard());
            }
            this.games[gameId].purchaseRequests[cardRequestIndex].isFulfilled = true;
            return this.games[gameId];
        }
        return null;
    }
    declineCards(gameId, sessionId, cardRequestId) {
        if (!this.isAuthorized(gameId, sessionId))
            return null;
        const cardRequestIndex = this.games[gameId].purchaseRequests.findIndex((pr) => {
            return pr.id === cardRequestId;
        });
        if (cardRequestIndex === -1)
            return null;
        const cardRequest = this.games[gameId].purchaseRequests[cardRequestIndex];
        const playerId = cardRequest.playerId;
        if (this.games[gameId].players[playerId]) {
            this.games[gameId].purchaseRequests.splice(cardRequestIndex, 1);
            this.games[gameId].players[playerId].currentPurchaseRequestId = "";
            return this.games[gameId];
        }
        return null;
    }
    // TODO: improve performance
    autofill_cards(gameId, playerId) {
        if (!this.games[gameId] || !this.games[gameId].players[playerId])
            return { updatedGame: null, autofillResults: "" };
        if (this.games[gameId].currentDrawn.length === 0)
            return { updatedGame: this.games[gameId], autofillResults: "" };
        const currentCall = this.games[gameId].currentDrawn[this.games[gameId].currentDrawn.length - 1];
        const currentCallNum = parseInt(currentCall.substring(1));
        const selectedPatternIndexes = this.getSelectedPatternIndexes(gameId);
        const autofillResults = [];
        for (let i = 0; i < this.games[gameId].players[playerId].cards.length; i++) {
            const card = this.games[gameId].players[playerId].cards[i];
            for (let j = 0; j < card.length; j++) {
                if (card[j].val === currentCallNum &&
                    selectedPatternIndexes.includes(j)) {
                    card[j].isChecked = true;
                    autofillResults.push((i + 1).toString());
                }
            }
        }
        return {
            updatedGame: this.games[gameId],
            autofillResults: autofillResults.join(","),
        };
    }
    selectCell(gameId, playerId, cardIndex, val) {
        if (!this.games[gameId] || !this.games[gameId].players[playerId])
            return null;
        const currentCallNum = val === "FREE" ? -1 : parseInt(val);
        const card = this.games[gameId].players[playerId].cards[cardIndex];
        if (!card)
            return null;
        for (let j = 0; j < card.length; j++) {
            if (card[j].val === currentCallNum) {
                card[j].isChecked = !card[j].isChecked;
                break;
            }
        }
        return this.games[gameId];
    }
    sendChatMessage(gameId, senderId, message) {
        if (!this.games[gameId])
            return null;
        if (senderId === "HOST" || this.games[gameId].players[senderId]) {
            const newMessage = {
                id: (0, uuid_1.v4)(),
                senderId: senderId,
                message: message,
                timestamp: new Date().getTime(),
            };
            this.games[gameId].messages.push(newMessage);
            this.games[gameId].messages.sort((m1, m2) => m1.timestamp - m2.timestamp);
            return this.games[gameId];
        }
        return null;
    }
    isAuthorized(gameId, sessionId) {
        return this.games[gameId] && this.games[gameId].sessionId === sessionId;
    }
    getLetterIndex(chosen) {
        for (let i = 0; i < COLUMN_RANGES.length; i++) {
            const range = COLUMN_RANGES[i];
            if (range.min <= chosen && chosen <= range.max)
                return i;
        }
        return -1;
    }
    isPatternEmpty(gameId) {
        for (const row of this.games[gameId].currentPattern) {
            for (const val of row) {
                if (val !== 0)
                    return false;
            }
        }
        return true;
    }
    haveCardRequestsBeenFulfilled(gameId) {
        for (const cardRequest of this.games[gameId].purchaseRequests) {
            if (!cardRequest.isFulfilled)
                return false;
        }
        return true;
    }
    getSelectedPatternIndexes(gameId) {
        const selectedIndexes = [];
        const pattern = this.games[gameId].currentPattern;
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const flattenedIndex = 5 * row + col;
                    selectedIndexes.push(flattenedIndex);
                }
            }
        }
        return selectedIndexes;
    }
}
const GAME_MANAGER = new GameManager();
exports.default = GAME_MANAGER;
