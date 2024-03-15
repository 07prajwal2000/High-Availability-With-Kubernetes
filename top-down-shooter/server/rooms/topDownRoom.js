const { Room } = require("colyseus");
const { totalClients } = require("./vars");

class TopDownRoom extends Room {
	playerInputBuffer = {};
	connectedPlayers = {};
	// speed = 4;
	speed = 4;
	playerPositions = {};

	/**
	 * @param {import("colyseus").Client} client
	 * @param {any} options
	 * @param {import("http").IncomingMessage} request
	 */
	onAuth(client, options, request) {
		return true;
	}

	onCreate(options) {
		this.onMessage("move-player", this.movePlayer.bind(this));
		this.gameStarted = Date.now();

		this.clock.setTimeout(() => {
			console.log("room closed ater tieout");
			this.broadcast("time-end");
			this.disconnect();
		}, 5 * 60 * 1000);

		this.sendPosInterval = this.clock.setInterval(() => {
			this.broadcast("players-pos", this.playerPositions);
		}, 40);

		this.gameEndTime = this.gameStarted + 5 * 60 * 1000;
		this.setSimulationInterval(this.updateLoop.bind(this), 33.33);
	}

	/**
	 * @param {import("colyseus").Client} client
	 */
	onJoin(client) {
		totalClients[this.roomId] = this.clients.length;
    this.playerInputBuffer[client.id] = {x: 0, y: 0};
		this.connectedPlayers[client.id] = {
			id: client.id,
			active: true,
			pos: {
				x: 100,
				y: 100,
			},
		};
		this.playerPositions[client.id] = this.connectedPlayers[client.id].pos;
		client.send("game-state", {
			endTime: this.gameEndTime,
			id: client.id,
			pos: this.connectedPlayers[client.id].pos,
			connected: Object.values(this.connectedPlayers),
		});
    this.broadcast("player-joined", {
			id: client.id,
			pos: this.connectedPlayers[client.id].pos,
    }, {except: [client.id]});
	}

	updateLoop(dt) {
		for (let key in this.playerInputBuffer) {
      let x = this.playerInputBuffer[key].x;
      let y = this.playerInputBuffer[key].y;
      this.connectedPlayers[key].pos.x += (33.33 / this.speed) * x;
      this.connectedPlayers[key].pos.y += (33.33 / this.speed) * y;
      this.playerPositions[key] = this.connectedPlayers[key].pos;
    }
	}

	movePlayer(client, msg) {
		if (!("x" in msg) || !("y" in msg)) return;
		this.playerInputBuffer[client.id] = msg;
	}

	onLeave(client) {
		totalClients[this.roomId] = this.clients.length;
    this.broadcast("player-leave", client.id);
		this.connectedPlayers[client.id].active = false;
	}

	onDispose() {
		delete totalClients[this.roomId];
		clearInterval(this.sendPosInterval);
		console.log("Room closed");
	}
}

module.exports = TopDownRoom;
