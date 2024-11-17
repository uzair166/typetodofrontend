import { motion } from "framer-motion";

export const LogoLoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-300">
      <div className="relative w-24 h-24">
        {/* Gradient background circle */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Rotating gradient border */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #ec4899, #8b5cf6) border-box",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* TypeTodo text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            T
          </motion.span>
        </div>
      </div>
      
      <motion.p
        className="mt-4 text-sm text-muted-foreground dark:text-zinc-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading your tasks...
      </motion.p>
    </div>
  );
};
