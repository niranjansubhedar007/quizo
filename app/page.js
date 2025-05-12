"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import bcrypt from "bcryptjs";

export default function Home() {
  const { data: session, status } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("weak"); // 'weak' | 'strong'

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Watch for session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      checkUserInDatabase(session.user.email);
    }
  }, [status, session]);

  const logoutUser = async () => {
    localStorage.removeItem("userEmail");
    await signOut({ redirect: false });
    if (isClient) {
      router.push("/");
    }
  };
  const checkUserInDatabase = async (email) => {
    try {
      const { data, error } = await supabase
        .from("Authentication_info")
        .select("email")
        .eq("email", email)
        .single();

      if (error || !data) {
        setErrorMessage(
          "Sorry, we don't recognize that username or password. You can try again"
        );
        // Do NOT change isSignUp state here to prevent switching to sign up form
        return;
      }
      if (data) {
        localStorage.setItem("userEmail", data.email);
      }
      router.push("/quizList");
    } catch (err) {
      console.error("Database check error:", err);
      setErrorMessage("Error checking user. Please try again.");
    }
  };

  const handleSignIn = async () => {
    setSubmitAttempted(true);
  
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from("Authentication_info")
        .select("email, password")
        .eq("email", email)
        .single();
  
      if (error || !data) {
        setErrorMessage("Incorrect email or password. Please try again.");
        return;
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, data.password);
      if (!isPasswordCorrect) {
        setErrorMessage("Incorrect email or password. Please try again.");
        return;
      }
  
      localStorage.setItem("userEmail", data.email);
      router.push("/quizList");
  
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        redirect: false,
        authorizationParams: { prompt: "select_account" },
      });

      if (result?.error) {
        console.error("Authentication error:", result.error);
        setErrorMessage(result.error);
        return;
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMessage("Failed to sign in with Google");
    }
  };

  const handleSignUp = async () => {
    setSubmitAttempted(true);

    if (!email || !name || !password) {
      setErrorMessage("Please enter name, email, and password");
      return;
    }

    try {
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from("Authentication_info")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        setErrorMessage("User already exists. Please sign in.");
        setIsSignUp(false); // Switch to sign in form
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: insertError } = await supabase
        .from("Authentication_info")
        .insert([{ email, name, password: hashedPassword }]);

      if (insertError) {
        console.error("Error inserting user:", insertError);
        setErrorMessage("Error creating account. Please try again.");
        return;
      }

      console.log("User successfully signed up!");
      router.push("/quizList");
    } catch (err) {
      console.error("Sign up error:", err);
      setErrorMessage("Failed to sign up");
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setSubmitAttempted(false);
    setErrorMessage("");
    setEmail("");
    setName("");
    setPassword("");
    setShowPassword(false);
    setPasswordStrength("weak");
    setIsClient(false);
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4">
  //     {/* Navigation Bar */}
  //     <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
  //       {session && (
  //         <button
  //           onClick={logoutUser}
  //           className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all duration-300 cursor-pointer"
  //         >
  //           Sign Out
  //         </button>
  //       )}
  //     </div>

  //     {/* Main Content Card */}
  //     <div className="bg-white shadow-xl rounded-2xl overflow-hidden mt-16 max-w-md w-full transition-transform duration-300 hover:scale-102">
  //       <div className="bg-indigo-500 p-6">
  //         <h1 className="text-2xl font-bold text-white text-center">
  //           Welcome back
  //         </h1>
  //       </div>

  //       <div className="p-7">
  //         <div className="space-y-6">
  //           <p className="text-gray-600 text-center mb-6">
  //             Access your personalized courses with secure authentication
  //           </p>

  //           {submitAttempted && errorMessage && (
  //             <p className="text-red-500 text-center">{errorMessage}</p>
  //           )}

  //           {!isSignUp ? (
  //             <>
  //               <div className="relative flex flex-col gap-1">
  //                 <label
  //                   htmlFor="email"
  //                   className="text-sm font-medium text-gray-700"
  //                 >
  //                   Email <span className="text-red-500">*</span>
  //                 </label>
  //                 <input
  //                   id="email"
  //                   type="email"
  //                   value={email}
  //                   onChange={(e) => setEmail(e.target.value)}
  //                   placeholder="example@gmail.com"
  //                   className="w-full p-3 rounded-lg border border-gray-300 text-sm"
  //                 />
  //                 <div className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400">
  //                   <FontAwesomeIcon icon={faEnvelope} />
  //                 </div>
  //               </div>

  //               <div className="relative flex flex-col gap-1">
  //                 <label
  //                   htmlFor="password"
  //                   className="text-sm font-medium text-gray-700"
  //                 >
  //                   Password <span className="text-red-500">*</span>
  //                 </label>
  //                 <input
  //                   id="password"
  //                   type={showPassword ? "text" : "password"}
  //                   value={password}
  //                   onChange={handlePasswordChange}
  //                   placeholder="Enter your password"
  //                   className="w-full p-3 rounded-lg border border-gray-300 pr-12 text-sm"
  //                 />
  //                 <div
  //                   className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400 cursor-pointer"
  //                   onClick={togglePasswordVisibility}
  //                 >
  //                   <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
  //                 </div>
  //               </div>

  //               <button
  //                 onClick={handleSignIn}
  //                 className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
  //               >
  //                 Log in
  //               </button>
  //             </>
  //           ) : (
  //             <>
  //               <div className="relative flex flex-col gap-1">
  //                 <label
  //                   htmlFor="name"
  //                   className="text-sm font-medium text-gray-700"
  //                 >
  //                   Full Name <span className="text-red-500">*</span>
  //                 </label>
  //                 <input
  //                   id="name"
  //                   type="text"
  //                   value={name}
  //                   onChange={(e) => setName(e.target.value)}
  //                   placeholder="Enter your full name"
  //                   className="w-full p-3 rounded-lg border border-gray-300 text-sm"
  //                 />
  //                 <div className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400">
  //                   <FontAwesomeIcon icon={faUser} />
  //                 </div>
  //               </div>
  //               <div className="relative flex flex-col gap-1">
  //                 <label
  //                   htmlFor="email"
  //                   className="text-sm font-medium text-gray-700"
  //                 >
  //                   Email <span className="text-red-500">*</span>
  //                 </label>
  //                 <input
  //                   id="email"
  //                   type="email"
  //                   value={email}
  //                   onChange={(e) => setEmail(e.target.value)}
  //                   placeholder="example@gmail.com"
  //                   className="w-full p-3 rounded-lg border border-gray-300 text-sm"
  //                 />
  //                 <div className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400">
  //                   <FontAwesomeIcon icon={faEnvelope} />
  //                 </div>
  //               </div>

  //               <div className="relative flex flex-col gap-1">
  //                 <label
  //                   htmlFor="password"
  //                   className="text-sm font-medium text-gray-700"
  //                 >
  //                   Password <span className="text-red-500">*</span>
  //                 </label>
  //                 <input
  //                   id="password"
  //                   type={showPassword ? "text" : "password"}
  //                   value={password}
  //                   onChange={handlePasswordChange}
  //                   placeholder="Create password"
  //                   className="w-full p-3 rounded-lg border border-gray-300 pr-12 text-sm"
  //                 />
  //                 <div
  //                   className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400 cursor-pointer"
  //                   onClick={togglePasswordVisibility}
  //                 >
  //                   <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
  //                 </div>
  //               </div>

  //               <div className="flex items-center gap-2  ml-1">
  //                 <div className="flex gap-1">
  //                   <div
  //                     className={`h-2 w-8 rounded-sm ${
  //                       passwordStrength === "weak"
  //                         ? "bg-red-500"
  //                         : "bg-gray-300"
  //                     }`}
  //                   ></div>
  //                   <div
  //                     className={`h-2 w-8 rounded-sm ${
  //                       passwordStrength === "medium"
  //                         ? "bg-yellow-500"
  //                         : "bg-gray-300"
  //                     }`}
  //                   ></div>
  //                   <div
  //                     className={`h-2 w-8 rounded-sm ${
  //                       passwordStrength === "strong"
  //                         ? "bg-green-500"
  //                         : "bg-gray-300"
  //                     }`}
  //                   ></div>
  //                 </div>
  //                 <p className="text-sm text-gray-500">
  //                   {passwordStrength === "weak"
  //                     ? "Weak"
  //                     : passwordStrength === "medium"
  //                     ? "Medium"
  //                     : "Strong"}
  //                 </p>
  //               </div>
  //               <button
  //                 onClick={handleSignUp}
  //                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
  //               >
  //                 Sign Up
  //               </button>
  //             </>
  //           )}

  //           <div className="text-center ">or</div>

  //           <button
  //             onClick={handleGoogleSignIn}
  //             className="w-full bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
  //           >
  //             Continue with Google
  //           </button>

  //           <p className="text-center text-sm text-gray-600">
  //             {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
  //             <button
  //               onClick={toggleSignUp}
  //               className="text-indigo-600 hover:underline"
  //             >
  //               {isSignUp ? "Sign in" : "Sign up"}
  //             </button>
  //           </p>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Footer */}
  //     <footer className="mt-8 text-center text-gray-400 text-sm">
  //       <p>© 2025 S-Tech. All rights reserved.</p>
  //       <p className="mt-1">Trusted by organizations worldwide</p>
  //     </footer>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* {session && (
          <button
            onClick={logoutUser}
            className="bg-[#583D72] hover:bg-[#9F5F80] text-white px-6 py-2 rounded-full transition-all duration-300 cursor-pointer shadow-md"
          >
            Sign Out
          </button>
        )} */}
      </nav>
  
      {/* Main Content Card */}
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden my-8 max-w-md w-full transition-transform duration-300 hover:scale-[1.01]">
        <div className="bg-gradient-to-r from-[#9F5F80] to-[#583D72] p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
        </div>
  
        <div className="p-7">
          <div className="space-y-6">
            <p className="text-gray-600 text-center mb-6">
              {isSignUp 
                ? "Join us to access personalized courses" 
                : "Access your personalized courses with secure authentication"}
            </p>
  
            {submitAttempted && errorMessage && (
              <p className="text-[#FF8474] text-center font-medium">{errorMessage}</p>
            )}
  
            {!isSignUp ? (
              <>
                <div className="relative flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-[#583D72]"
                  >
                    Email <span className="text-[#FF8474]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:border-[#9F5F80] focus:ring-2 focus:ring-[#9F5F80]/50 transition-all"
                  />
                  <div className="absolute right-3 top-10 text-[#9F5F80]">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                </div>
  
                <div className="relative flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#583D72]"
                  >
                    Password <span className="text-[#FF8474]">*</span>
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className="w-full p-3 rounded-lg border border-gray-300 pr-12 text-sm focus:border-[#9F5F80] focus:ring-2 focus:ring-[#9F5F80]/50 transition-all"
                  />
                  <div
                    className="absolute right-3 top-10 text-[#9F5F80] cursor-pointer hover:text-[#583D72] transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </div>
                </div>
  
                <button
                  onClick={handleSignIn}
                  className="w-full mt-5 bg-gradient-to-r from-[#9F5F80] to-[#583D72] hover:from-[#583D72] hover:to-[#9F5F80] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                <div className="relative flex flex-col gap-1">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-[#583D72]"
                  >
                    Full Name <span className="text-[#FF8474]">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:border-[#9F5F80] focus:ring-2 focus:ring-[#9F5F80]/50 transition-all"
                  />
                  <div className="absolute right-3 top-10 text-[#9F5F80]">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                </div>
                <div className="relative flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-[#583D72]"
                  >
                    Email <span className="text-[#FF8474]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:border-[#9F5F80] focus:ring-2 focus:ring-[#9F5F80]/50 transition-all"
                  />
                  <div className="absolute right-3 top-10 text-[#9F5F80]">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                </div>
  
                <div className="relative flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#583D72]"
                  >
                    Password <span className="text-[#FF8474]">*</span>
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Create password"
                    className="w-full p-3 rounded-lg border border-gray-300 pr-12 text-sm focus:border-[#9F5F80] focus:ring-2 focus:ring-[#9F5F80]/50 transition-all"
                  />
                  <div
                    className="absolute right-3 top-10 text-[#9F5F80] cursor-pointer hover:text-[#583D72] transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </div>
                </div>
  
                <div className="flex items-center gap-2 ml-1">
                  <div className="flex gap-1">
                    <div
                      className={`h-2 w-8 rounded-sm ${
                        passwordStrength === "weak"
                          ? "bg-[#FF8474]"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div
                      className={`h-2 w-8 rounded-sm ${
                        passwordStrength === "medium"
                          ? "bg-[#FFC996]"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div
                      className={`h-2 w-8 rounded-sm ${
                        passwordStrength === "strong"
                          ? "bg-[#9F5F80]"
                          : "bg-gray-300"
                      }`}
                    ></div>
                  </div>
                  <p className="text-sm text-[#583D72]">
                    {passwordStrength === "weak"
                      ? "Weak"
                      : passwordStrength === "medium"
                      ? "Medium"
                      : "Strong"}
                  </p>
                </div>
                <button
                  onClick={handleSignUp}
                  className="w-full bg-gradient-to-r from-[#9F5F80] to-[#583D72] hover:from-[#583D72] hover:to-[#9F5F80] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </button>
              </>
            )}
  
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
  
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              Continue with Google
            </button>
  
            <p className="text-center text-sm text-[#583D72]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleSignUp}
                className="text-[#9F5F80] font-medium hover:underline hover:text-[#583D72] transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
  
      {/* Footer */}
      <footer className="mt-8 text-center text-[#583D72]/80 text-sm">
        <p>© 2025 S-Tech. All rights reserved.</p>
        <p className="mt-1">Trusted by organizations worldwide</p>
      </footer>
    </div>
  );
}
