'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { supabase } from './lib/supabase'; // Import your Supabase client

export default function Home() {
  const { data: session } = useSession();

  const logoutUser = async () => {
    localStorage.removeItem('userEmail');
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  const handleSignIn = async () => {
    const result = await signIn("google", { redirect: false, authorizationParams: { prompt: "select_account" } });

    if (result?.error) {
      console.error('Authentication error:', result.error);
      return;
    }

    setTimeout(async () => {
      const email = result.user?.email || session?.user?.email || localStorage.getItem('userEmail');

      if (email) {
        const { data, error } = await supabase
          .from('Authentication_info')
          .select('email')
          .eq('email', email)
          .single();

        if (error || !data) {
          alert('User not found. Please contact admin.');
          await signOut({ redirect: false });
          return;
        }

        localStorage.setItem("userEmail", email);
        window.location.href = "/dashboard";
      } else {
        console.error('No email found after sign in.');
      }
    }, 1500); // Delay slightly to allow session to update
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4">
      {/* Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        {session && (
          <button
            onClick={logoutUser}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all duration-300 cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden mt-16 max-w-md w-full transition-transform duration-300 hover:scale-102">
        <div className="bg-indigo-500 p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            {session ? 'Welcome Back!' : 'Sign In'}
          </h1>
        </div>

        <div className="p-8">
          {session ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-20 h-20 rounded-full border-4 border-indigo-100 shadow-md mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800">{session.user.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={logoutUser}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg 
                         shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 text-center mb-6">
                Access your personalized dashboard with secure Google authentication
              </p>
              <button
                onClick={handleSignIn}
                className="w-full bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 font-medium py-3 px-6 rounded-lg
                       shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 488 512"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path
                    fill="#EA4335"
                    d="M488 261.8c0-17.8-1.6-35-4.6-51.8H249v98h135.7c-5.9 31.7-23.5 58.5-50.3 76.4v63.6h81.3c47.7-43.9 72.3-108.6 72.3-186.2z"
                  />
                  <path
                    fill="#34A853"
                    d="M249 492c67.8 0 124.6-22.5 166.1-60.9l-81.3-63.6c-22.7 15.2-51.6 24.2-84.8 24.2-65.2 0-120.3-44.1-140-103.6H26.6v64.9C68.5 426.4 151.8 492 249 492z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M109 288.1c-4.6-13.7-7.2-28.3-7.2-43.1s2.6-29.4 7.2-43.1V137H26.6C9.3 170.4 0 208.2 0 245s9.3 74.6 26.6 108.1L109 288.1z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M249 97.9c35.9 0 68.3 12.4 93.6 36.8l70.2-70.2C373.5 27.7 316.7 0 249 0 151.8 0 68.5 65.6 26.6 137l82.4 64.9C128.7 142 183.8 97.9 249 97.9z"
                  />
                </svg>
                Continue with Google
              </button>
              <p className="text-sm text-gray-400 text-center mt-6">
                Enterprise-grade security · One-click access
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 S-Tech. All rights reserved.</p>
        <p className="mt-1">Trusted by organizations worldwide</p>
      </footer>
    </div>
  );
}
