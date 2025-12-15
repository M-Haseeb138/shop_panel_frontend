import React from 'react';

const ProfileSetup = ({ formData, updateFormData, onSave, onBack, loading }) => {
  return (
    <div className="space-y-6" style={{ fontFamily: "'Metropolis', sans-serif" }}>
      <div>
        <h2 className="mb-2 text-2xl font-bold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 700
        }}>
          Profile Setup
        </h2>
        <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
          Complete your store profile to get started.
        </p>
      </div>

      {/* Success Status */}
      <div className="p-6 text-center border rounded-lg" style={{ 
        borderColor: 'rgba(39, 200, 64, 0.2)',
        backgroundColor: 'rgba(39, 200, 64, 0.05)'
      }}>
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ backgroundColor: 'rgba(39, 200, 64, 0.1)' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#27C840' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold" style={{ 
          color: '#27C840',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 600
        }}>
          Application Approved!
        </h3>
        <p style={{ 
          color: '#27C840',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400
        }}>
          Congratulations! Your application has been approved. Let's set up your store profile.
        </p>
      </div>

      {/* Store Profile Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold" style={{ 
          color: '#000000',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 600
        }}>
          Store Profile
        </h3>
        
        {/* Store Description */}
        <div>
          <label className="block mb-2 text-sm font-medium" style={{ 
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}>
            Store Description *
          </label>
          <textarea
            value={formData.storeDescription}
            onChange={(e) => updateFormData({ storeDescription: e.target.value })}
            rows="4"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              borderColor: '#555555',
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400
            }}
            placeholder="Tell customers about your store, your products, and what makes your business unique..."
            required
          ></textarea>
          <p className="mt-1 text-sm" style={{ 
            color: '#555555',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 400
          }}>
            Minimum 100 characters, maximum 500 characters. {formData.storeDescription?.length || 0}/500
          </p>
        </div>

        {/* Website and Year Established */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ 
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500
            }}>
              Website (optional)
            </label>
            <input
              type="url"
              value={formData.storeWebsite}
              onChange={(e) => updateFormData({ storeWebsite: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#555555',
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}
              placeholder="https://www.yourwebsite.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ 
              color: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500
            }}>
              Year Established
            </label>
            <input
              type="number"
              value={formData.storeOpeningYear}
              onChange={(e) => updateFormData({ storeOpeningYear: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#555555',
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}
              placeholder="e.g., 2010"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Store Policies */}
        <div className="space-y-4">
          <h4 className="font-semibold text-md" style={{ 
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 600
          }}>
            Store Policies
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 border rounded focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000'
                }}
              />
              <div>
                <span className="text-sm font-medium" style={{ 
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}>
                  Return Policy
                </span>
                <p className="text-sm" style={{ 
                  color: '#555555',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}>
                  30-day return policy for all products
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 border rounded focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000'
                }}
              />
              <div>
                <span className="text-sm font-medium" style={{ 
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}>
                  Shipping Policy
                </span>
                <p className="text-sm" style={{ 
                  color: '#555555',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}>
                  Free shipping on orders over $50
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 border rounded focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000'
                }}
              />
              <div>
                <span className="text-sm font-medium" style={{ 
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}>
                  Privacy Policy
                </span>
                <p className="text-sm" style={{ 
                  color: '#555555',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}>
                  We protect your personal information
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-4">
          <h4 className="font-semibold text-md" style={{ 
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 600
          }}>
            Business Hours
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ 
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}>
                Opening Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}
                defaultValue="09:00"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ 
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}>
                Closing Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#555555',
                  color: '#000000',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400
                }}
                defaultValue="18:00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none hover:opacity-80"
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
          onClick={onSave}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none hover:opacity-90"
          style={{ 
            backgroundColor: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Complete Setup</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Add focus styles */}
      <style jsx>{`
        input:focus, textarea:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        input[type="checkbox"]:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileSetup;