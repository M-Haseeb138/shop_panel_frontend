import React from 'react';

const StepIndicator = ({ currentStep, totalSteps = 6 }) => {
  const steps = [
    "Create Account",
    "Email Verification", 
    "Phone Verification",
    "Business Details",
    "Document Upload",
    "Review & Complete"
  ];

  return (
    <div className="relative mb-8" style={{ fontFamily: "'Metropolis', sans-serif" }}>
      {/* Progress Line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 z-0" style={{ backgroundColor: 'rgba(85, 85, 85, 0.3)' }}></div>
      
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isPending = currentStep < stepNumber;
          
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "text-white"
                    : isActive
                    ? "text-white ring-4"
                    : "text-gray-600"
                }`}
                style={{
                  backgroundColor: isCompleted ? '#27C840' : 
                                  isActive ? '#000000' : 
                                  'rgba(85, 85, 85, 0.3)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                  boxShadow: isActive ? '0 0 0 4px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              
              {/* Step Label */}
              <span
                className="mt-2 text-xs font-medium text-center"
                style={{
                  color: isActive ? '#000000' : 
                         isCompleted ? '#27C840' : 
                         '#555555',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: isActive || isCompleted ? 600 : 500
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;