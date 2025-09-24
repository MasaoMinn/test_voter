// store/voteStore.ts
import { create } from "zustand"

export type ImageItem = { id: string; url: string }
export type Votes = { agree: number; disagree: number }
export type VotesByImage = Record<string, Votes>

type VoteState = {
    images: ImageItem[]
    currentIndex: number
    votesByImage: VotesByImage
    setImages: (images: ImageItem[]) => void
    setCurrentIndex: (index: number) => void
    setVotesByImage: (votes: VotesByImage) => void
}

export const useVoteStore = create<VoteState>((set) => ({
    images: [],
    currentIndex: 0,
    votesByImage: {},
    setImages: (images) => set(() => ({ images })),
    setCurrentIndex: (index) => set(() => ({ currentIndex: index })),
    setVotesByImage: (votes) => set(() => ({ votesByImage: votes })),
}))
