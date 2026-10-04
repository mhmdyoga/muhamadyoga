"use client"
import ExperienceSection from "@/components/fragments/Experience";
import ProjectsSection from "@/components/fragments/Project";
import ScrollPortfolio from "@/components/fragments/ScrollPortfolio";
import WordsPreloaderDemo from "@/components/fragments/WordsPreloader";
import Image from "next/image";
import dynamic from "next/dynamic";

const RocketJourneyMap = dynamic(() => import("@/components/fragments/Journey"), {
  ssr: false,
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Muhamad Yoga Cahaya Pratama",
  url: "https://muhamadyoga.vercel.app",
  jobTitle: "Software Developer",
  sameAs: ["https://github.com/mhmdyoga", "https://www.linkedin.com/in/muhamad-yoga-cahaya-pratama-5a115a2a1/", "https://gitlab.com/mhmdyoga", "https://www.instagram.com/my0_6_", "https://www.linkedin.com/in/adilla-nurhabibilah/"],
};

export default function Home() {
  return (
    <>
      <WordsPreloaderDemo/>
        <ScrollPortfolio/>
        <ProjectsSection/>
        <ExperienceSection/>
        <RocketJourneyMap scrollLength="1000vh"/>
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
