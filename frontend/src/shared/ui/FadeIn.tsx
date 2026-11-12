import type { ReactNode } from "react";
import Box from "@mui/material/Box";

interface FadeInProps {
  children: ReactNode;
}

export default function FadeIn({ children }: FadeInProps) {
  return <Box sx={{ animation: "fadeIn 0.3s ease-out" }}>{children}</Box>;
}
