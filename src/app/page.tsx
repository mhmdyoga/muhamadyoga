import ScrollPortfolio from "@/components/fragments/ScrollPortfolio";
import WordsPreloaderDemo from "@/components/fragments/WordsPreloader";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <WordsPreloaderDemo/>
      <div className="relative h-screen w-full bg-white">
        <ScrollPortfolio/>
      </div>
    </>
  );
}
