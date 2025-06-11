import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-sky-400 to-blue-500 flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl">
          🗞️ NewsDunia
        </h1>
        <p className="text-lg md:text-2xl text-yellow-100 max-w-2xl mb-10 font-semibold italic">
          Dive into <span className="text-white underline">real-time news</span> and <span className="text-white underline">insightful blogs</span>. Analyze author performance, manage content, and export reports effortlessly from your dynamic dashboard.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/login">
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-xl hover:bg-blue-100 transition-all duration-200 flex items-center gap-2">
              Go to Dashboard <ArrowRight size={18} />
            </button>
          </Link>

          <a
            href="https://github.com/Rohit1608"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-6 py-3 rounded-full shadow-xl hover:bg-gray-900 transition-all duration-200"
          >
            View GitHub Repo
          </a>
        </div>

        <div className="mt-20 text-white font-bold text-sm">
          © 2025 NewsDunia. Built with ❤️  By Rohit Gupta
        </div>
      </motion.div>

      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-10 bg-no-repeat bg-cover pointer-events-none" />
    </div>
  );
}
