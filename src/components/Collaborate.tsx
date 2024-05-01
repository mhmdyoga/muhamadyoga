import React from 'react'
import { MotionDiv } from './Motion/page'
import { Lobster } from 'next/font/google'

// font
const lobster = Lobster({ subsets: ['latin'], weight: ['400'] })
// animation
const Scroll = {
    hidden: { opacity: 0, y: 100 },
WhileInView : {
    opacity: 1,
    y: 0,
    transition: {
        type: 'spring',
        stiffness: 120,
        duration: 0.5
    }
}
}



const Collaborate = () => {
  return (
    <>
    <MotionDiv variants={Scroll} initial="hidden" whileInView="WhileInView" viewport={{ once: true }}  className="p-20 m-12">
        <h2 className={`text-5xl font-extrabold mb-4 text-gray-400 ${lobster.className}`}>Explore the Digital World with My Creativity: <br /> Let's Collaborate and Inspire!</h2>
        <p className='text-gray-500 text-xl'>As a front-end developer, I combine creativity with precision to create engaging and interactive user interfaces. I believe in effective teamwork and clear communication to deliver satisfying results. With a focus on superior user experience and a commitment to quality, I am ready to be a reliable partner in every project.</p>
    </MotionDiv>
    </>
  )
}

export default Collaborate