"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  href?: string;
  noPadding?: boolean;
  glowColor?: "cyan" | "purple" | "pink" | "none";
}

export function GlassCard({
  children,
  className,
  interactive = false,
  href,
  noPadding = false,
  glowColor = "none",
}: GlassCardProps) {
  const glowClasses = {
    cyan: "hover:glow-cyan",
    purple: "hover:glow-purple",
    pink: "hover:glow-pink",
    none: "",
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "glass-card",
        interactive && "glass-card-interactive",
        glowClasses[glowColor],
        !noPadding && "p-5",
        className
      )}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
