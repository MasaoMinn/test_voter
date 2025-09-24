import ImageSwiper from "@/app/components/ImageSwiper";
import VoteBox from "./components/VoteBox";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="mb-6 text-xl text-yellow-500 font-bold">投票器 Demo</h1>
      <ImageSwiper />
      <VoteBox />
    </div>
  )
}