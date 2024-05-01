"use client"

import React from 'react'
import {motion} from 'framer-motion' 
import Link from 'next/link'


const NavbarItem = ({ isToggle }: any) => {

const Navlist = [
    {
        id: 1,
        title: "Work",
        url : "/",
    },
    {
        id: 2,
        title: "About",
        url : "/About",
    },
    {
        id: 3,
        title: "Contact",
        url : "/contact",
    }
    
]
const Navitem = {
    hidden : {
        opacity : 0,
        y : 50,
        transition : {
            y : { stiffness : 1000, velocity : -100 },
        } 
    },
    visible : {
        opacity : 1,
        y : 0,
        transition : {
            y : { stiffness : 1000 },
        }
    }
}

  return (
    <>
    <div>
        <motion.ul className="p-14" variants={Navitem} initial="hidden" animate="visible">
            {Navlist.map((item) => (
                <motion.li className='pointer list-none text-white mt-4 text-3xl' key={item.id}>
                    <Link href={item.url} className={`text-white`}>{item.title}</Link>
                </motion.li>
            ))}
        </motion.ul>
    </div>
    </>
  )
}

export default NavbarItem