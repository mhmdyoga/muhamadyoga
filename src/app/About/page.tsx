import Image from "next/image";
import React from "react";
import { Roboto, Archivo, Lobster } from "next/font/google";
import { MotionDiv } from "@/components/Motion/page";
import SkillBar from "@/components/SkillBar";
import Collaborate from "@/components/Collaborate";

// font
const roboto = Roboto({ subsets: ["latin"], weight: "500" });
const archivo = Archivo({subsets: ["latin"], weight: "600"});
const lobster = Lobster({subsets: ["latin"], weight: "400"})

// animation
const variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    }, 
    exit: {
        opacity: 0,
        y: -20,
    }
}
const fromLeft: Variants = {
    initial: {
        y: -100,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: -100,
        opacity: 0,
    },
    transition: {
        duration: 0.5,
    },

} 

const Home = () => {
  return (
    <>
      <div className="flex p-10 md:p-20 flex-col gap-10 md:gap-20 justify-center items-center md:flex-row ">
        <MotionDiv variants={variants} initial="initial" animate="animate" className="flex flex-col gap-5">
            <h2
          className={`text-xl text-center md:text-start font-extrabold md:text-5xl bg-gradient-to-r from-yellow-300 via-purple-500 to-sky-300 bg-clip-text text-transparent ${lobster.className}`}
        >
          Hi, I'm Yogá<br /> a Front-end developer working <br />at everywhere from 31°C<br /> Rangkasbitung, Indonesia.
        </h2> 
         <span className="text-slate-300 text-center md:text-start text-sm md:text-lg">I'm also a UI/UX Designer and general doodler  with a<br /> keen eye for creating enganging UI, bringing product to life.</span>
        </MotionDiv>
        
        <MotionDiv initial="initial" animate="animate" exit="exit" variants={fromLeft}>
          <Image
            src="https://blogger.googleusercontent.com/img/a/AVvXsEiMGoYCYSq00P6WOYvlZUVCNm00RQ0j_uaNuSO4tdhic-xQt-shQA2xnwTrkVx0lWqzsKHLor2zNQvwCW0_96uwdfZIVMZ2cLyoT6iwWLjLSYF1EKUJgBiclZE89BsMw6-tIJ-JyO_Gl4RWGVKCb3XyNUM3IgxrhVkpoeEPtp6p-QuNypZ6agX9WrJWhaI"
            alt="me"
            width={375}
            height={300}
          />
        </MotionDiv>
      </div>
      <div>
      </div>
      <div className="p-7">
          <SkillBar />
          <div>
            <Collaborate />
          </div>
        </div>
    </>
  );
};

export default Home;
