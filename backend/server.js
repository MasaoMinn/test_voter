// backend/server.js
import express from "express"
import cors from "cors"
import { WebSocketServer } from "ws"

const app = express()
app.use(cors())
app.use(express.json())

// In-memory images catalog with stable IDs
const images = [
  { id: "img-1", url: "https://th.bing.com/th/id/OIP.i3-yvja3WP0Vi9Ow1Enb3AHaFC?w=282&h=192&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-2", url: "https://th.bing.com/th/id/OIP.SckDSNwSSWwx160QbbN1qAHaIn?w=166&h=192&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-3", url: "https://th.bing.com/th/id/OIP.oTZZU6sOsyhPiQG2Bo8qKwHaFk?w=241&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-4", url: "https://th.bing.com/th/id/OIP.sosnhEd3ev9906NzngrV7wHaE7?w=272&h=181&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-5", url: "https://tse4-mm.cn.bing.net/th/id/OIP-C.Ev4u2L5CojIw6-rc8ALuQwHaEH?w=323&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-6", url: "https://tse4-mm.cn.bing.net/th/id/OIP-C.eKqNZXU413SHfR2lv-MumwHaFn?w=201&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
  { id: "img-7", url: "https://tse3-mm.cn.bing.net/th/id/OIP-C.Kxr5Zwthmw40VvUGV8QqywHaEk?w=277&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7" },
  { id: "img-8", url: "https://tse1-mm.cn.bing.net/th/id/OIP-C.xqmKzEOzoSI1BaOzkiPEywHaD1?w=294&h=179&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" },
]

// Per-image vote tallies
let votesByImage = images.reduce((acc, img) => {
  acc[img.id] = { agree: 0, disagree: 0 }
  return acc
}, {})

let clients = []

app.post("/vote", (req, res) => {
  const { type, imageId } = req.body
  if (!imageId || !votesByImage[imageId]) {
    return res.status(400).json({ error: "Invalid or missing imageId" })
  }

  if (type === "agree") votesByImage[imageId].agree++
  if (type === "disagree") votesByImage[imageId].disagree++

  broadcast()
  res.json({ imageId, ...votesByImage[imageId] })
})

app.post("/track", (req, res) => {
  const { event, imageId } = req.body
  console.log("📡 User Action:", event, imageId ? `(imageId=${imageId})` : "")

  if (imageId && votesByImage[imageId]) {
    if (event === "swipe-up (agree)") votesByImage[imageId].agree++
    if (event === "swipe-down (disagree)") votesByImage[imageId].disagree++
  }

  broadcast()
  res.sendStatus(200)
})

const server = app.listen(3001, () =>
  console.log("no problem")
)

const wss = new WebSocketServer({ server })
wss.on("connection", (ws) => {
  clients.push(ws)
  ws.send(JSON.stringify({ type: "votes", data: votesByImage })) // 初始数据
})

function broadcast() {
  clients = clients.filter((ws) => ws.readyState === ws.OPEN)
  clients.forEach((ws) => {
    try {
      ws.send(JSON.stringify({ type: "votes", data: votesByImage }))
    } catch (e) {}
  })
}

app.get("/images", (req, res) => {
  const data = images.map((img) => ({
    ...img,
    votes: votesByImage[img.id]
  }))
  res.json(data)
})