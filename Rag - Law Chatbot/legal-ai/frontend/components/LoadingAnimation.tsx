import { motion } from "framer-motion";
import { Search, BrainCircuit, PenTool } from "lucide-react";
import { useState, useEffect } from "react";

export function LoadingAnimation() {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: Search, text: "Mencari regulasi yang relevan..." },
    { icon: BrainCircuit, text: "Menganalisis dokumen hukum..." },
    { icon: PenTool, text: "Menyusun jawaban..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl w-fit">
      <div className="relative w-6 h-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {(() => {
            const Icon = steps[step].icon;
            return <Icon size={12} className="text-primary" />;
          })()}
        </div>
      </div>
      <motion.span 
        key={step}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-white/70"
      >
        {steps[step].text}
      </motion.span>
    </div>
  );
}
