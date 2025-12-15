// components/onboarding/PhoneVerification.jsx - UPDATED WITH COLORS & FONT
import React, { useState } from "react";
import 'typeface-metropolis';

const countryCodes = [
  { code: "+1", name: "US", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
];

const PhoneVerification = ({
  onVerify,
  onVerifyOTP,
  onBack,
  loading,
  onResendOTP,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[2]); // Default: India
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

//   const handleSendCode = async () => {
//   if (!phoneNumber) {
//     setPhoneError("Please enter your phone number");
//     return;
//   }

//   // Format phone number with country code
//   const formattedPhone = `${selectedCountry.code}${phoneNumber.replace(/\D/g, "")}`;
  
//   console.log("📱 Sending verification code to:", formattedPhone);
  
//   try {
//     setSendingCode(true);
//     setPhoneError("");
    
//     // Log for debugging
//     console.log("🔍 Calling onVerify with phone:", formattedPhone);
//     const result = await onVerify(formattedPhone);
    
//     console.log("✅ Verification request successful:", result);
//     console.log("📞 Phone number sent for verification:", formattedPhone);
    
//     setStep(2);
//   } catch (error) {
//     console.error("❌ Failed to send verification code:", error);
//     setPhoneError(error.message || "Failed to send verification code");
//   } finally {
//     setSendingCode(false);
//   }
// };

const handleSendCode = async () => {
  if (!phoneNumber) {
    setPhoneError("Please enter your phone number");
    return;
  }

  // Format phone number with country code
  // Remove any non-digit characters from the phone number part
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const formattedPhone = `${selectedCountry.code}${phoneDigits}`;
  
  console.log("📱 Sending verification code to:", formattedPhone);
  console.log("🔍 Phone breakdown:", {
    countryCode: selectedCountry.code,
    phoneNumber: phoneNumber,
    phoneDigits: phoneDigits,
    formattedPhone: formattedPhone
  });
  
  try {
    setSendingCode(true);
    setPhoneError("");
    
    // Log for debugging
    console.log("🔍 Calling onVerify with phone:", formattedPhone);
    const result = await onVerify(formattedPhone);
    
    console.log("✅ Verification request successful:", result);
    console.log("📞 Phone number sent for verification:", formattedPhone);
    
    setStep(2);
  } catch (error) {
    console.error("❌ Failed to send verification code:", error);
    setPhoneError(error.message || "Failed to send verification code. Please check the number format.");
  } finally {
    setSendingCode(false);
  }
};
  const handleVerificationInput = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

const handleVerify = () => {
  const code = verificationCode.join("");
  
  console.log("🔢 Verifying code:", code);
  console.log("📱 Full verification data:", {
    code: code,
    step: step
  });
  
  if (code.length !== 4) {
    alert("Please enter complete 4-digit verification code");
    return;
  }
  
  console.log("✅ Calling onVerifyOTP with code:", code);
  onVerifyOTP(code);
};


const handleResendCode = async () => {
  console.log('🔄 Resending verification code...');
  console.log('📱 Phone number:', `${selectedCountry.code}${phoneNumber}`);
  
  try {
    // Show loading
    const verifyButton = document.querySelector('button[onClick*="handleResendCode"]');
    if (verifyButton) {
      verifyButton.disabled = true;
      verifyButton.innerHTML = 'Sending...';
    }
    
    // Call the resend OTP function
    if (onResendOTP) {
      await onResendOTP();
      alert('New verification code sent! Please check your phone.');
    } else {
      // Fallback - simulate resend
      console.log('ℹ️ Manual resend triggered');
      alert('Verification code sent! Please check your phone.');
    }
  } catch (error) {
    console.error('❌ Failed to resend code:', error);
    alert('Failed to resend verification code. Please try again.');
  } finally {
    // Reset button
    const verifyButton = document.querySelector('button[onClick*="handleResendCode"]');
    if (verifyButton) {
      verifyButton.disabled = false;
      verifyButton.innerHTML = 'Didn\'t receive the code? Resend';
    }
  }
};

  return (
    <div className="space-y-6" style={{ fontFamily: "'Metropolis', sans-serif" }}>
      <div>
        <h2 className="mb-2 text-2xl font-bold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 700
        }}>
          Phone Verification
        </h2>
        <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
          Verify your phone number for security purposes.
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="p-6 text-center border rounded-lg" style={{ 
            borderColor: '#555555',
            backgroundColor: '#bebebeff'
          }}>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: '#555555' }}>
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#000000' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold" style={{ 
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 600
            }}>
              Enter Your Phone Number
            </h3>
            <p style={{ 
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              We'll send a verification code to your phone number for security
              purposes.
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ 
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500
            }}>
              Phone Number *
            </label>
            <div className="flex space-x-2">
              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center px-3 py-3 space-x-2 bg-white border rounded-lg hover:opacity-80 focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: '#555555',
                    color: '#000000',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500
                  }}
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: '#555555' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCountryDropdown && (
                  <div className="absolute left-0 z-10 w-48 mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg top-full max-h-60" style={{ borderColor: '#555555' }}>
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                        }}
                        className="flex items-center w-full px-3 py-2 space-x-3 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg focus:outline-none"
                        style={{ 
                          color: '#000000',
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 400
                        }}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="flex-1">{country.name}</span>
                        <span style={{ color: '#555555' }}>{country.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  console.log("📝 Phone number input:", e.target.value);
                  setPhoneNumber(e.target.value);
                }}
                className="flex-1 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}
                placeholder="1234567890"
                required
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-sm" style={{ 
                color: '#dc2626',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}>
                {phoneError}
              </p>
            )}
            <p className="mt-1 text-sm" style={{ 
              color: '#555555',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              We'll send a 4-digit verification code via SMS
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg hover:opacity-80 focus:outline-none"
              style={{ 
                color: '#000000',
                borderColor: '#555555',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
            
              <span>Back</span>
            </button>
            <button
              onClick={handleSendCode}
              disabled={sendingCode}
              className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              {sendingCode ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Code</span>
                 
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Verify Code */
        <div className="space-y-6">
          <div className="p-6 text-center border rounded-lg" style={{ 
            borderColor: '#bebebeff',
            backgroundColor: '#e2e2e2ff'
          }}>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: '#bebebeff' }}>
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#000' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold" style={{ 
              color: '#000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 600
            }}>
              Enter Verification Code
            </h3>
            <p style={{ 
              color: '#000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              We've sent a verification code to <strong>{phoneNumber}</strong>
            </p>
            <p className="mt-2 text-sm" style={{ 
              color: '#555555',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              Check your browser console for debugging information
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6 space-x-3">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => {
                    console.log(`Digit ${index} input:`, e.target.value);
                    handleVerificationInput(index, e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-xl font-bold text-center border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: '#555555',
                    color: '#000000',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            <p className="mb-4 text-sm" style={{ 
              color: '#555555',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              Enter the 4-digit code sent to your phone
            </p>

            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm transition-colors hover:opacity-80 disabled:opacity-50 focus:outline-none"
              style={{ 
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={() => {
                console.log("🔙 Going back to phone entry step");
                setStep(1);
              }}
              disabled={loading}
              className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg hover:opacity-80 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: '#000000',
                borderColor: '#555555',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
            
              <span>Back</span>
            </button>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Phone</span>
                
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add focus styles */}
      <style jsx>{`
        input:focus, button:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default PhoneVerification;