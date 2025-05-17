"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faCog,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserDetails = () => {
      const loginMethod = localStorage.getItem("loginMethod");
      const email = localStorage.getItem("userEmail");
      const name = localStorage.getItem("userName");

      if (email) {
        setUserDetails({
          email,
          name: name || "User",
        });
      }
      setLoading(false);
    };

    loadUserDetails();
  }, [status, session]);
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const { data, error } = await supabase
            .from("Authentication_info")
            .select("name, email")
            .eq("email", session.user.email)
            .single();

          if (data) {
            setUserDetails(data);
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [status, session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#583D72] text-white shadow-lg py-3 px-6 border-b border-[#FF8474] fixed top-0 w-full z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p className="text-2xl font-bold font-sans">
          {" "}
          <span className="text-[#FF8474]">Q</span>uizo
        </p>

        <div className="flex items-center space-x-6">
          {userDetails ? (
            <>
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#fff]/10 ">
                <Link
                  href="/quizList"
                >
                  <FontAwesomeIcon icon={faHome} className="text-[#FF8474]" />
                </Link>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {userDetails.name ? (
                      <span className="font-medium">
                        {userDetails.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </div>
                  <span className="hidden md:inline-block">
                    {userDetails.name || "User"}
                  </span>
                </button>

                <div className="absolute -right-5 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{userDetails.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {userDetails.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Mobile menu - you can implement this if needed */}
    </nav>
  );
}
