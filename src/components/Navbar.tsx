"use client"

import React, { useState } from "react";
import NavbarItem from "./NavbarItem";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const [setToggle, setisToggle] = useState(false);
  const navAnimation = {
    hidden: {
      opacity: 0,
      transition: {
        x: { velocity: -100 },
        duration: 0.3,
      },
    },
    visibel: {
      opacity: 1,
      transition: {
        x: { velocity: 100 },
        duration: 0.3,
      },
    },
  };

  return (
      <div>
        <button
          className="border-gray-600 fixed ml-80 md:ml-[1204px] p-2 mt-5 bg-gray-700 rounded-full float-left font-bold mx-6"
          onClick={() => setisToggle(!setToggle)}
        >
          <MenuIcon />
        </button>
        <div>
          <AnimatePresence>
            {setToggle && (
              <motion.div
                variants={navAnimation}
                initial="hidden"
                animate={setToggle ? "visibel" : "hidden"}
                exit="hidden"
                className="border-gray-600 fixed rounded-2xl w-64 h-[700px] bg-gradient-to-t from-black to-gray-600"
              >
                <NavbarItem isToggle={setToggle}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default Navbar;
