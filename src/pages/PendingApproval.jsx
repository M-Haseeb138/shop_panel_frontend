import React from "react";

const PendingApproval = ({ onLogout, userData }) => {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Metropolis', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/images/zed-logo.png"
                alt="ZED Logo"
                className="w-8 h-8 mr-3"
                style={{ objectFit: "contain" }}
              />
              <span
                className="text-xl font-bold"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 700,
                }}
              >
                Marketplace Shop Owner Portal
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 space-x-1 transition-colors rounded-lg hover:opacity-80"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div
          className="p-8 text-center bg-white border shadow-sm rounded-xl"
          style={{ borderColor: "#555555" }}
        >
          <div
            className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
            style={{ backgroundColor: "#e2e2e2ff" }}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#bebebeff" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1
            className="mb-4 text-3xl font-bold"
            style={{
              color: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 700,
            }}
          >
            Application Under Review
          </h1>

          <div
            className="p-6 mb-6 text-left rounded-lg"
            style={{
              backgroundColor: "rgba(85, 85, 85, 0.05)",
              border: "1px solid #555555",
            }}
          >
            <div className="flex items-start">
              <svg
                className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "#000000" }}
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  What's Happening?
                </h3>
                <p
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  Your application is currently being reviewed by our admin
                  team. This process typically takes 1-2 business days. You will
                  receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div
            className="p-6 mb-6 text-left rounded-lg"
            style={{ backgroundColor: "rgba(85, 85, 85, 0.05)" }}
          >
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 600,
              }}
            >
              Application Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Store Name
                </p>
                <p
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {userData?.shop?.name || "Not provided"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Contact Person
                </p>
                <p
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {userData?.name || "Not provided"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Email
                </p>
                <p
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {userData?.email || "Not provided"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Phone
                </p>
                <p
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {userData?.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
         <div
  className="p-6 mb-6 rounded-lg"
  style={{
    backgroundColor: "#e2e2e2",
    border: "1px solid #e2e2e2",
  }}
>
  <h3
    className="mb-3 text-lg font-semibold"
    style={{
      color: "#000000",
      fontFamily: "'Metropolis', sans-serif",
      fontWeight: 600,
    }}
  >
    What Happens Next?
  </h3>

  <div className="space-y-3">
    <div className="flex items-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
        style={{ backgroundColor: "#d4d4d4" }}
      >
        <span
          className="text-sm font-bold"
          style={{
            color: "#000000",
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 700,
          }}
        >
          1
        </span>
      </div>
      <p
        style={{
          color: "#000000",
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400,
        }}
      >
        Our team reviews your business documents and information
      </p>
    </div>

    <div className="flex items-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
        style={{ backgroundColor: "#d4d4d4" }}
      >
        <span
          className="text-sm font-bold"
          style={{
            color: "#000000",
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 700,
          }}
        >
          2
        </span>
      </div>
      <p
        style={{
          color: "#000000",
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400,
        }}
      >
        You'll receive an email notification once approved
      </p>
    </div>

    <div className="flex items-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
        style={{ backgroundColor: "#d4d4d4" }}
      >
        <span
          className="text-sm font-bold"
          style={{
            color: "#000000",
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 700,
          }}
        >
          3
        </span>
      </div>
      <p
        style={{
          color: "#000000",
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 400,
        }}
      >
        Access your full dashboard and start selling immediately
      </p>
    </div>
  </div>
</div>


          <div className="text-center">
            <p
              className="mb-4"
              style={{
                color: "#555555",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
            >
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@zedmarketplace.com"
                className="transition-colors hover:opacity-80"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                }}
              >
                support@zedmarketplace.com
              </a>
            </p>
            <button
              onClick={onLogout}
              className="px-6 py-3 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
              style={{
                backgroundColor: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500,
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Add Metropolis font styles */}
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/metropolis");

        body {
          font-family: "Metropolis", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;
