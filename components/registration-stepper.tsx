"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Profil" },
  { id: 2, name: "KTP" },
  { id: 3, name: "NPWP" },
  { id: 4, name: "Bank" },
];

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="relative flex justify-between">
        {/* Connecting Lines Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2 rounded-full" />
        
        {/* Active Connecting Line */}
        <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-background px-2 z-10">
                    <div 
                        className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                            isCurrent ? "border-primary text-primary bg-background scale-110" : 
                            "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 bg-background"
                        )}
                    >
                        {isCompleted ? <Check className="w-4 h-4 sm:w-6 sm:h-6" /> : <span className="text-sm font-bold">{step.id}</span>}
                    </div>
                    <span className={cn(
                        "text-xs font-medium transition-colors duration-300 hidden sm:block",
                        isCurrent ? "text-primary font-bold" : 
                        isCompleted ? "text-primary" : "text-muted-foreground"
                    )}>
                        {step.name}
                    </span>
                </div>
            );
        })}
      </div>
      {/* Mobile Labels */}
      <div className="flex justify-between sm:hidden mt-2">
         {steps.map((step) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
                <span key={step.id} className={cn(
                    "text-[10px] font-medium text-center w-10",
                     isCurrent ? "text-primary font-bold" : 
                     isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                    {step.name}
                </span>
            )
         })}
      </div>
    </div>
  );
}
