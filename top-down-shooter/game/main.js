// import kaboom from "kaboom";
import "./style.css";
import { Client, Room } from "colyseus.js";

// const speed = 150;
const speed = 4;
const canvas = document.querySelector("#phy-canvas");
let roomId = "";
/**
 * @type {Room} client
 */
let room;
/**
 * @type {Client} client
 */
let client;
let connected = false;
let myId = "";

(async function() {
  const ctx = kaboom({
    canvas,
    width: 900,
    height: 600,
    background: "#43bf62",
    // maxFPS: 60
  });

  ctx.loadSprite("player", "char.png");
  ctx.loadSprite("crate1", "crate.png");
  const dest = ctx.vec2(80);
  const player = ctx.add([
    ctx.sprite("player"),
    ctx.pos(dest),
    ctx.area(),
    ctx.body(),
  ]);
  /**
   * @type { {[key: string]: {
   * serverPosition: Vec2,
   * localPosition: Vec2,
   * entity: any
   * }} }
   */
  const otherPlayers = {};

  document.getElementById("connectRoomBtn").onclick = async () => {
    client = new Client("ws://3.109.186.77:3000");
    roomId = document.querySelector("#roomid").value;
    room = await client.joinById(roomId);
    connected = true;
  
    room.onMessage("time-end", () => {
      alert("room closed by timeout");
      connected = false;
    });
    
    room.onLeave(() => {
      connected = false;
    });
  
    room.onMessage("game-state", (initialState) => {
      myId = initialState.id;
      console.log("time remaining: ", initialState.endTime);
      player.pos.x = initialState.pos.x;
      player.pos.y = initialState.pos.y;

      initialState.connected.forEach(x => {
        if (x.id == myId) return;
        otherPlayers[x.id] = {
          entity: ctx.add([
            ctx.sprite("player"),
            ctx.pos(x.pos.x, x.pos.y),
            ctx.area(),
            ctx.body(),
            ctx.color(255, 100, 100)
          ]),
          localPosition: ctx.vec2(x.pos.x, x.pos.y),
          serverPosition: ctx.vec2(x.pos.x, x.pos.y),
        };
      });
    });

    room.onMessage("player-joined", (playerInfo) => {
      if (playerInfo.id == myId) return;
      const entity = ctx.add([
        ctx.sprite("player"),
        ctx.pos(playerInfo.pos.x, playerInfo.pos.y),
        ctx.area(),
        ctx.body(),
        ctx.color(255, 100, 100)
      ]);
      otherPlayers[playerInfo.id] = {
        entity,
        localPosition: ctx.vec2(playerInfo.pos.x, playerInfo.pos.y),
        serverPosition: ctx.vec2(playerInfo.pos.x, playerInfo.pos.y)
      };
      console.log("New player joined: ", playerInfo.id);
    });

    room.onMessage("player-leave", (id) => {
      ctx.destroy(otherPlayers[id].entity);
      delete otherPlayers[id];
      console.log("Player left: ", id);
    });

    room.onMessage("players-pos", (pos) => {
      // console.log("Server position: ", pos[myId].x.toFixed(3), pos[myId].y.toFixed(3), "\nLocal position: ", player.pos.x, player.pos.y);
      for (let key in pos) {
        if (key == myId) {
          dest.x = pos[key].x;
          dest.y = pos[key].y;
          continue;
        }
        key in otherPlayers && (otherPlayers[key].serverPosition.x = pos[key].x);
        key in otherPlayers && (otherPlayers[key].serverPosition.y = pos[key].y);
      }
    });
  };
  
  let directions = {x: 0, y: 0};
  
  ctx.onKeyDown("down", (k) => {
    directions.y = 1;
  });
  ctx.onKeyDown("up", (k) => {
    directions.y = -1;
  });
  ctx.onKeyDown("left", (k) => {
    directions.x = -1;
  });
  ctx.onKeyDown("right", (k) => {
    directions.x = 1;
  });

  ctx.onKeyRelease((k) => {
    if (k == "down" || k == "up") {
      directions.y = 0
    }
    if (k == "left" || k == "right") {
      directions.x = 0;
    }
  });

  let fpsCounter = 0;

  ctx.onUpdate(() => {
    dest.x += directions.x * speed;
    dest.y += directions.y * speed;
    // player.pos = dest;
    player.pos = player.pos.lerp(dest, .3);
    updateOtherPlayers();
    // player.pos = player.pos.lerp(dest, 3 * dt);
    fpsCounter++;
    if (connected && fpsCounter % 2 == 0) {
      room.send("move-player", directions);
      fpsCounter = 0;
    }
  });

  function updateOtherPlayers() {
    for (let key in otherPlayers) {
      let localPos = otherPlayers[key].localPosition;
      let serverPos = otherPlayers[key].serverPosition;
      localPos = ctx.lerp(localPos, serverPos, .35);
      otherPlayers[key].localPosition = localPos;
      otherPlayers[key].entity.pos = localPos;
      // otherPlayers[key].localPosition = otherPlayers[key].entity.pos.lerp(localPos, serverPos, .5);
      // otherPlayers[key].entity.pos = otherPlayers[key].localPosition;
    }
  }
})();

let fps = 0;
let posX = 0;
// 40fps
// const ii = setInterval(() => {
//   if (fps == 40) {
//     console.log(posX);
//     clearInterval(ii);
//   }
//   fps++;
//   posX += speed * 1.5;
// }, 25);

function addObstacles(ctx) {
  for (let i = 0; i < 10; i++) {
    const x = Math.round(Math.random() * 600);
    const y = Math.round(Math.random() * 600);
    
    ctx.add([
      ctx.sprite("crate1"),
      ctx.pos(x, y),
      ctx.area(),
      ctx.body({isStatic: true}),
    ]);
  }
}