import React, { useState } from 'react';

const EmailVerification = ({ email, onVerify, loading, onBackToLogin, onResendOTP }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

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
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = () => {
    const code = verificationCode.join('');
    console.log('🔢 Verifying OTP:', code);
    console.log('📧 For email:', email);
    
    if (code.length !== 4) {
      alert('Please enter complete 4-digit verification code');
      return;
    }
    
    onVerify(code);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendSuccess('');
    
    try {
      await onResendOTP();
      setResendSuccess('OTP has been resent to your email!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResendSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
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
          Email Verification
        </h2>
        <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
          Verify your email address to continue.
        </p>
      </div>

      {/* Status Box */}
      <div className="p-6 text-center border rounded-lg" style={{ 
        borderColor: 'rgba(85, 85, 85, 0.2)',
        backgroundColor: 'rgba(85, 85, 85, 0.05)'
      }}>
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 600
        }}>
          Verification Email Sent
        </h3>
        <p style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400
        }}>
          We've sent a verification email to <strong>{email}</strong>. Please check your inbox and enter the code below.
        </p>
      </div>

      {/* Resend OTP Section - Updated */}
      <div className="text-center">
        <p className="mb-4" style={{ 
          color: '#555555',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400
        }}>
          Didn't receive the email? Resend OTP
        </p>
        
        {resendSuccess && (
          <div className="p-3 mb-4 border rounded-lg" style={{ 
            borderColor: 'rgba(39, 200, 64, 0.2)',
            backgroundColor: 'rgba(39, 200, 64, 0.05)'
          }}>
            <p className="text-sm" style={{ 
              color: '#27C840',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              {resendSuccess}
            </p>
          </div>
        )}
        
        <button
          onClick={handleResendOTP}
          disabled={resendLoading || loading}
          className="flex items-center px-6 py-2 mx-auto space-x-2 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          {resendLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Resend OTP</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Code Input */}
      <div className="text-center">
        <h4 className="mb-3 text-lg font-semibold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 600
        }}>
          Enter Verification Code
        </h4>
        <p className="mb-6 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
          Enter the 4-digit code sent to your email
        </p>

        <div className="flex justify-center mb-8 space-x-3">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleVerificationInput(index, e.target.value)}
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
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <div className="flex space-x-3">
          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              disabled={loading}
              className="px-4 py-2 transition-colors border rounded-lg hover:opacity-80 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: '#000000',
                borderColor: '#555555',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              Back to Login
            </button>
          )}
        </div>
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
              <span>Next</span>
              
            </>
          )}
        </button>
      </div>

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

export default EmailVerification;