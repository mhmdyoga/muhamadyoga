"use client"

import React from "react";
import { MotionDiv } from "./Motion/page";
import { Variants } from "framer-motion";

const animScrollY: Variants = {
    offScreen: {
        opacity: 0,
        x: -100,
    },
    onScreen: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 1
        }
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 1
        },
    },
    whileInView: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 1
        }
    },
    }


const SkillBar = () => {
  return (
    <>
      <MotionDiv initial="offScreen" whileInView="onScreen" viewport={{once: true, amount: 0.5}} variants={animScrollY} exit="exit"  className="bg-gray-500 md:w-48 md:mx-[1100px] md:h-20 rounded-full w-80 items-center mx-5">
        <div className="p-4 mx-3 text-gray-300">
          <span className="font-bold ">UI/UX</span>
          <p>Design</p>
        </div>
      </MotionDiv>
      <MotionDiv initial="offScreen" whileInView="onScreen" viewport={{once: true, amount: 0.5}} variants={animScrollY} exit="exit" className="bg-gray-500 md:w-[587px] md:h-20 rounded-full md:mx-[670px] mt-6 w-80 items-center mx-5">
        <div className="p-4 mx-3 text-gray-300">
          <span className="font-bold ">NEXT JS</span>
          <p>Developer</p>
        </div>
      </MotionDiv>
      <MotionDiv initial="offScreen" whileInView="onScreen" viewport={{once: true, amount: 0.5}} variants={animScrollY} exit="exit"  className="bg-gray-500 md:w-[780px] md:h-20 rounded-full md:mx-[480px] mt-6 w-80 items-center mx-5">
        <div className="p-4 mx-3 text-gray-300">
          <span className="font-bold ">Front-end</span>
          <p>Developer</p>
        </div>
      </MotionDiv>
      <MotionDiv initial="offScreen" whileInView="onScreen" viewport={{once: true, amount: 0.5}} variants={animScrollY} exit="exit" className="bg-gray-500 md:w-80 md:h-20 rounded-full md:mx-64 mt-6 w-80 items-center  mx-5">
        <div className="p-4 mx-3 text-gray-300">
          <span className="font-bold ">Dotfusion</span>
          <p>Design / Dev</p>
        </div>
      </MotionDiv>
      <MotionDiv initial="offScreen" whileInView="onScreen" viewport={{once: true, amount: 0.5}} variants={animScrollY} exit="exit" className="bg-gray-500 md:w-52 md:h-20 rounded-full md:mx-20 mt-8 w-80 items-center mx-5">
        <div className="p-4 mx-3 text-gray-300">
          <span className="font-bold ">Figma</span>
          <p>Design / Dev</p>
        </div>
      </MotionDiv>
    </>
  );
};

export default SkillBar;
