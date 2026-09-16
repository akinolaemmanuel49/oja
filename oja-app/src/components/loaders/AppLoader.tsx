import { motion } from "motion/react";

type AppLoaderProps = {
  path?: string;
  text?: string;
};

export function AppLoader({ path, text }: AppLoaderProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="h-16 w-16 rounded-full border border-foreground/20" />
          <motion.div
            className="absolute h-10 w-10 rounded-full border border-foreground"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute -bottom-2 h-1.5 w-1.5 rounded-full bg-foreground" />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 25, stiffness: 300 }}
        >
          <span className="text-2xl font-semibold tracking-wide text-foreground">ọjà</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">marketplace console</span>
        </motion.div>

        <motion.span
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {path ? `Loading ${path}…` : "Preparing dashboard…"}
        </motion.span>
        {text && (
          <motion.span
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {text}
          </motion.span>
        )}
      </div>
    </div>
  );
}
