import React from 'react';

const OnboardingComplete = ({ onComplete, onBack, loading }) => {
  return (
    <div className="space-y-6" style={{ fontFamily: "'Metropolis', sans-serif" }}>
      <div>
        <h2 className="mb-2 text-2xl font-bold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 700
        }}>
          Onboarding Complete
        </h2>
        <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
          Congratulations! Your store is ready to go live.
        </p>
      </div>

      {/* Success Alert */}
      <div className="p-6 border rounded-lg" style={{ 
        borderColor: 'rgba(39, 200, 64, 0.2)',
        backgroundColor: 'rgba(39, 200, 64, 0.05)'
      }}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#27C840' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold" style={{ 
              color: '#27C840',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 600
            }}>
              Your Store is Live!
            </h3>
            <p style={{ 
              color: '#27C840',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}>
              Congratulations! Your store has been created successfully and is now ready to accept customers.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Guide */}
     {/* Quick Start Guide */}
<div className="overflow-hidden border rounded-lg" style={{ borderColor: '#555555' }}>
  <div className="px-6 py-4" style={{ backgroundColor: '#000000' }}>
    <h4 className="flex items-center space-x-2 text-lg font-semibold text-white">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span>Quick Start Guide</span>
    </h4>
  </div>

  <div className="p-6">
    <ol className="space-y-3">
      {[1, 2, 3, 4, 5].map((num) => (
        <li key={num} className="flex items-start space-x-3">
          <span
            className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-medium rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 600
            }}
          >
            {num}
          </span>

          <span
            style={{
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}
          >
            {num === 1 && (
              <>
                <strong>Access your Store Admin Console</strong> - Manage your store settings and preferences
              </>
            )}
            {num === 2 && (
              <>
                <strong>Upload your initial product catalog</strong> - Add products with images and descriptions
              </>
            )}
            {num === 3 && (
              <>
                <strong>Set your inventory levels</strong> - Manage stock quantities and variants
              </>
            )}
            {num === 4 && (
              <>
                <strong>Configure shipping options</strong> - Set up delivery methods and rates
              </>
            )}
            {num === 5 && (
              <>
                <strong>Review payment methods</strong> - Set up payment gateways and billing
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  </div>
</div>
      {/* Next Steps */}
      <div className="p-6 border rounded-lg" style={{ 
        borderColor: '#555555',
        backgroundColor: 'rgba(85, 85, 85, 0.05)'
      }}>
        <h4 className="mb-3 text-lg font-semibold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 600
        }}>
          What's Next?
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center p-3 space-x-3 border rounded-lg" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#555555'
          }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ 
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}>
                Add Products
              </p>
              <p className="text-sm" style={{ 
                color: '#555555',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}>
                Start listing your products
              </p>
            </div>
          </div>
          <div className="flex items-center p-3 space-x-3 border rounded-lg" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#555555'
          }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'rgba(39, 200, 64, 0.1)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#27C840' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="font-medium" style={{ 
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}>
                Set Up Payments
              </p>
              <p className="text-sm" style={{ 
                color: '#555555',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}>
                Configure payment methods
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 focus:outline-none"
          style={{ 
            color: '#000000',
            borderColor: '#555555',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={onComplete}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 focus:outline-none"
          style={{ 
            backgroundColor: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              <span>Completing...</span>
            </>
          ) : (
            <>
              <span>Go to Store Admin</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Add focus styles */}
      <style jsx>{`
        button:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default OnboardingComplete;