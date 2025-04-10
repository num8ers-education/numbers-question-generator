// src/app/ClientMathJaxWrapper.tsx
"use client";

import { MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  loader: { load: ["[tex]/ams"] },
  tex: {
    // Define your inline and display math delimiters
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["$$", "$$"]],
  },
};

export default function ClientMathJaxWrapper({ children }: { children: React.ReactNode }) {
  return <MathJaxContext config={mathJaxConfig}>{children}</MathJaxContext>;
}
