"use client"

import { useEffect } from "react"
import axios from "axios"
import { useVoteStore, type ImageItem } from "../store/voteStore"
import { ThumbsDown, ThumbsUp } from "lucide-react"

type BackendImage = { id: string; url: string; votes: { agree: number; disagree: number } }

export default function ImageSwiper() {
    const { images, currentIndex, setImages, setCurrentIndex, setVotesByImage, votesByImage } = useVoteStore()

    useEffect(() => {
        axios
            .get<BackendImage[]>("http://localhost:3001/images")
            .then((res) => {
                const list: ImageItem[] = res.data.map((i) => ({ id: i.id, url: i.url }))
                setImages(list)
                const votes = res.data.reduce((acc, item) => {
                    acc[item.id] = { agree: item.votes.agree, disagree: item.votes.disagree }
                    return acc
                }, {} as Record<string, { agree: number; disagree: number }>)
                setVotesByImage(votes)
            })
            .catch((err) => console.error("Failed to fetch images:", err))
    }, [setImages, setVotesByImage])

    const prev = () => {
        if (images.length === 0) return
        const nextIndex = (currentIndex - 1 + images.length) % images.length
        setCurrentIndex(nextIndex)
        axios.post("http://localhost:3001/track", { event: "swipe-left (prev)", imageId: images[currentIndex]?.id }).catch(() => { })
    }
    const next = () => {
        if (images.length === 0) return
        const nextIndex = (currentIndex + 1) % images.length
        setCurrentIndex(nextIndex)
        axios.post("http://localhost:3001/track", { event: "swipe-right (next)", imageId: images[currentIndex]?.id }).catch(() => { })
    }
    if (images.length === 0) return <div>加载图片...</div>

    const current = images[currentIndex]
    const agree = votesByImage[current.id]?.agree ?? 0
    const disagree = votesByImage[current.id]?.disagree ?? 0

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-4 mb-2 text-sm">
                <ThumbsUp /><span className="text-blue-600">支持 {agree}</span>
                <ThumbsDown /><span className="text-red-600">反对 {disagree}</span>
            </div>
            <div
                className="overflow-hidden relative select-none"
                style={{ height: "300px" }}
            >
                <img
                    src={current.url}
                    alt={current.id}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded"
                >
                    ⬅
                </button>
                <button
                    onClick={next}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded"
                >
                    ➡
                </button>
                {/* <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white bg-opacity-60 px-2 py-1 rounded">
                    支持 {votesByImage[current.id]?.agree ?? 0} · 反对 {votesByImage[current.id]?.disagree ?? 0}
                </div> */}
            </div>
        </div>
    )
}
