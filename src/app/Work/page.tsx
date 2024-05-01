"use client";

import React from "react";
import { Lobster } from "next/font/google";
import { MotionDiv, MotionSpan } from "@/components/Motion/page";
import Image from "next/image";
// font
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
// animation
const textVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5, // delay sebelum teks muncul
      staggerChildren: 0.3, // delay antara munculnya setiap karakter
    },
  },
};
const letterVariants = {
  hidden: { opacity: 0, y: 50 }, // awalnya tidak terlihat dan bergeser ke bawah
  visible: {
    opacity: 1,
    y: 0,
  },
};
const IconVisible = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.5,
    },
  },
};

const Work = () => {
  return (
    <>
      <div className=" flex flex-col items-center justify-center h-screen ">
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={IconVisible}
          className="md:ml-[680px] ml-15"
        >
          <Image
            src="https://blogger.googleusercontent.com/img/a/AVvXsEjh9BEkDkCDtXQHbfEHSMpYILT95AvqAYx2XJNmHVixfDCeFMPe5UYT5WrxzEfCpKUpbeNLAKe4LH-9aafg_4qehZ2dKhRC82g4-LVbZWkLfOCJ_vyyxVkcM9303L-THWVwXg8tOinggvxh9CJ7bsfA5rhBad_tiXHxii5wchDbZ81MAP_nRaFwQLQAixTj"
            alt="yoga"
            width={65}
            height={65}
          />
        </MotionDiv>
        <h2
          className={`text-5xl mb-8 text-center bg-transparent md:text-start font-extrabold md:text-8xl bg-gradient-to-r from-yellow-300 via-purple-500 to-sky-300 bg-clip-text text-transparent ${lobster.className}`}
        >
          Hi, I'm Yogá
          <br />
          <MotionSpan variants={textVariant} initial="hidden" animate="visible">
            {Array.from("Front-end Dev").map((char, index) => (
              <MotionSpan key={index} variants={letterVariants}>
                {char}
              </MotionSpan>
            ))}
          </MotionSpan>
        </h2>
        <MotionDiv
          initial="hidden"
          animate="visible"
          variants={IconVisible}
          className="mr-[680px] mt-[-64px]"
        >
          <Image
            src="https://blogger.googleusercontent.com/img/a/AVvXsEjh9BEkDkCDtXQHbfEHSMpYILT95AvqAYx2XJNmHVixfDCeFMPe5UYT5WrxzEfCpKUpbeNLAKe4LH-9aafg_4qehZ2dKhRC82g4-LVbZWkLfOCJ_vyyxVkcM9303L-THWVwXg8tOinggvxh9CJ7bsfA5rhBad_tiXHxii5wchDbZ81MAP_nRaFwQLQAixTj"
            alt="yoga"
            width={65}
            height={65}
          />
        </MotionDiv>
        <span className="text-sm text-gray-300 text-center mt-6">
          I'm passionate about crafting experiences that are engaging, <br />{" "}
          accessible, and user-centric.
        </span>
      </div>
    </>
  );
};

export default Work;
