import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, BarChart3, Brain } from "lucide-react";
import TeamCard from "../components/TeamCard";
import ShreeImg from "../assets/team/shree.jpg";
import SumitImg from "../assets/team/sumit.jpg";
import JaiImg from "../assets/team/jai.png";

function Home() {
  const features = [
    {
      icon: <BookOpen className="w-10 h-10 text-blue-600" />,
      title: "Dynamic Question Bank",
      desc: "Teachers can easily create, organize, and update a question bank tailored to subjects and levels.",
    },
    {
      icon: <Brain className="w-10 h-10 text-green-600" />,
      title: "Adaptive Quizzes",
      desc: "Next questions adapt based on student answers, ensuring personalized learning paths and targeted skill improvement.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-purple-600" />,
      title: "Learning Insights",
      desc: "Get detailed reports on student strengths and weaknesses with analysis broken down into learning, retention, grasping, and application.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-pink-600" />,
      title: "Detailed Leaderboard",
      desc: "View ranked performance of students with individual scores and progress tracking over time.",
    },
    {
      icon: <Brain className="w-10 h-10 text-indigo-600" />,
      title: "Skill Profile Analysis",
      desc: "Breakdown of student performance across skills and difficulty levels (easy, medium, hard).",
    },
    {
      icon: <Users className="w-10 h-10 text-yellow-600" />,
      title: "Performance Over Time",
      desc: "Track student growth across multiple exams and quizzes with clear progress visualizations.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-emerald-600" />,
      title: "Parent Progress Dashboard",
      desc: "Parents can track their child’s academic progress, monitor detailed reports, and stay connected with teachers.",
    },
  ];


  const team = [
    {
      name: "Shreevastha Bhat",
      role: "GenAI Engineer",
      profile: ShreeImg,
      lead: true,
      linkedIn: "https://www.linkedin.com/in/shreevathsa-bhat-228157235/",
    },
    {
      name: "Jai Anjaria",
      role: "GenAI Engineer",
      profile: JaiImg,
      linkedIn: "http://www.linkedin.com/in/sumit-sonkamble-61b9502b0",
    },
    {
      name: "Sumit Sonkamble",
      role: "Full Stack Developer",
      profile: SumitImg,
      linkedIn: "http://www.linkedin.com/in/sumit-sonkamble-61b9502b0",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-5xl mx-auto text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-extrabold mb-6"
          >
            Welcome to EduAI
          </motion.h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            An AI-powered learning platform that helps teachers create dynamic
            question banks, adaptive quizzes, and unlock deeper insights into
            student learning.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 w-full bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          {/* First row - 4 features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {features.slice(0, 4).map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 shadow-md hover:shadow-lg transition rounded-2xl p-8 text-center flex flex-col items-center"
              >
                {f.icon}
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Second row - 3 features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.slice(4).map((f, idx) => (
              <motion.div
                key={idx + 4}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 shadow-md hover:shadow-lg transition rounded-2xl p-8 text-center flex flex-col items-center"
              >
                {f.icon}
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="py-20 px-6 w-full bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <TeamCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
