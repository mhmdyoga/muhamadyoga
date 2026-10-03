import ExperienceSection from "@/components/fragments/Experience";
import RocketJourneyMap from "@/components/fragments/Journey";
import ProjectsSection from "@/components/fragments/Project";
import ScrollPortfolio from "@/components/fragments/ScrollPortfolio";
import WordsPreloaderDemo from "@/components/fragments/WordsPreloader";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <WordsPreloaderDemo/>
        <ScrollPortfolio/>
        <ProjectsSection/>
        <ExperienceSection/>
        <RocketJourneyMap scrollLength="1000vh"/>
    </>
  );
}
