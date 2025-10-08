import React from "react";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import PipelineImg from "../assets/workflow.png"; // adjust path if needed

function Features() {
  return (
    <section className="py-20 px-6 w-full bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-6"
        >
          PDF Resource Processing Pipeline
        </motion.h2>

        <p className="text-gray-600 max-w-3xl mx-auto mb-12 text-lg">
          This diagram illustrates how uploaded PDFs are processed — from parsing
          and chunking to AI-based question generation and backend cleanup.
        </p>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <img
            src={PipelineImg}
            alt="PDF Resource Processing Pipeline"
            className="rounded-xl shadow-xl w-full max-w-4xl border border-gray-200"
          />
        </motion.div>

        {/* GitHub Buttons */}
        <div className="flex justify-center gap-6">
          <motion.a
            href="https://github.com/Shreevathsa05/HackAThon"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            <Github className="w-5 h-5" /> E-Vidya Repo
          </motion.a>

          <motion.a
            href="https://github.com/Shreevathsa05/HackAThon"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            <Github className="w-5 h-5" /> Toolkit repo
          </motion.a>
        </div>
      </div>
    </section>
  );
}

export default Features;
