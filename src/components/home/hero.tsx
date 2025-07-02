"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import ParticlesBackground from "./particles-background";

export default function Hero() {
  return (
    <section className="relative w-full h-screen bg-gray-950 text-white flex items-center justify-center px-6 overflow-hidden">
      <ParticlesBackground />
      <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
        >
          未来对话，从这里开始。
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-lg md:text-xl text-gray-300 mt-3 pt-3"
        >
          基于 AI 的聊天平台，提供极速、智能的对话体验。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/chat">
            <Button className="px-6 py-3 text-lg font-medium rounded-2xl shadow-lg">
              开始聊天
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
