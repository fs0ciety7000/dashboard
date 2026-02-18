"use client";

import { icons, LucideProps, CircleHelp } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = icons[name as keyof typeof icons];
  if (!IconComponent) {
    return <CircleHelp {...props} />;
  }
  return <IconComponent {...props} />;
}
