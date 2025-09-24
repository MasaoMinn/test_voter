"use client"
import { useVoteStore } from "../store/voteStore"
import { useEffect, useRef } from "react"
import axios from "axios"
import { ThumbsDown, ThumbsUp } from "lucide-react"

export default function VoteBox() {
    const { images, currentIndex, votesByImage, setVotesByImage, setCurrentIndex } = useVoteStore()
    const startX = useRef(0)
    const startY = useRef(0)
    const isDragging = useRef(false)
    const hasSwiped = useRef(false)

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3001")
        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data)
            if (data?.type === "votes" && data?.data) {
                setVotesByImage(data.data)
            }
        }
        return () => ws.close()
    }, [setVotesByImage])

    const prev = () => {
        if (images.length === 0) return
        const nextIndex = (currentIndex - 1 + images.length) % images.length
        setCurrentIndex(nextIndex)
        const current = images[currentIndex]
        if (current) axios.post("http://localhost:3001/track", { event: "swipe-left (prev)", imageId: current.id }).catch(() => { })
    }
    const next = () => {
        if (images.length === 0) return
        const nextIndex = (currentIndex + 1) % images.length
        setCurrentIndex(nextIndex)
        const current = images[currentIndex]
        if (current) axios.post("http://localhost:3001/track", { event: "swipe-right (next)", imageId: current.id }).catch(() => { })
    }
    const vote = (type: "agree" | "disagree") => {
        const current = images[currentIndex]
        if (!current) return
        axios.post("http://localhost:3001/vote", { type, imageId: current.id }).catch(() => { })
    }

    const handleStart = (x: number, y: number) => {
        isDragging.current = true
        hasSwiped.current = false
        startX.current = x
        startY.current = y
    }
    const handleEnd = (x: number, y: number) => {
        if (!isDragging.current || hasSwiped.current) return
        isDragging.current = false
        const dx = x - startX.current
        const dy = y - startY.current
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) prev()
            else if (dx < -50) next()
        } else {
            if (dy > 50) vote("disagree")
            else if (dy < -50) vote("agree")
        }
        hasSwiped.current = true
    }

    const lastX = useRef(0)

    const lastY = useRef(0)

    const detachDocListeners = () => {
        document.removeEventListener("mousemove", docMouseMove)
        document.removeEventListener("mouseup", docMouseUp)
    }

    const docMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        lastX.current = e.clientX
        lastY.current = e.clientY
    }

    const docMouseUp = (e: MouseEvent) => {
        if (!isDragging.current) return
        detachDocListeners()
        handleEnd(e.clientX || lastX.current, e.clientY || lastY.current)
    }

    const onMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY)
        lastX.current = e.clientX
        lastY.current = e.clientY
        document.addEventListener("mousemove", docMouseMove)
        document.addEventListener("mouseup", docMouseUp)
    }
    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0]
        handleStart(t.clientX, t.clientY)
    }
    const onTouchEnd = (e: React.TouchEvent) => {
        const t = e.changedTouches[0]
        handleEnd(t.clientX, t.clientY)
    }

    const current = images[currentIndex]
    const currentVotes = current ? votesByImage[current.id] ?? { agree: 0, disagree: 0 } : { agree: 0, disagree: 0 }
    const totalVotes = currentVotes.agree + currentVotes.disagree
    const agreePct = totalVotes > 0 ? (currentVotes.agree / totalVotes) * 100 : 0
    const disagreePct = totalVotes > 0 ? 100 - agreePct : 0

    return (
        <div
            className="p-6 border rounded-lg w-100 select-none"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div className="mb-4">此处为content交互面板</div>
            <div className="mb-4"><p className="text-red-500">上滑赞同，下滑反对，左/右滑切换图片</p></div>
            {/* <div className="text-center mb-2">
                {images.length > 0 ? (
                    <>
                        👍 同意: <span className="font-bold">{votesByImage[images[currentIndex]?.id]?.agree ?? 0}</span>

                        👎 反对: <span className="font-bold">{votesByImage[images[currentIndex]?.id]?.disagree ?? 0}</span>
                    </>
                ) : (
                    <span>Loading...</span>
                )}
            </div> */}
            <div className="mt-2">
                <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="flex h-full">
                        <div className="h-full bg-blue-500" style={{ width: `${agreePct}%` }} />
                        <div className="h-full bg-red-500" style={{ width: `${disagreePct}%` }} />
                    </div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-center">
                    <span className="text-blue-600"><ThumbsUp /> {currentVotes.agree}</span>
                    <span className="text-red-600"><ThumbsDown /> {currentVotes.disagree}</span>
                </div>
            </div>
        </div>
    )
}
