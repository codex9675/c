"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import style from "../../css/style.module.css";

export default function CoverPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const username = params?.username || "defaultuser";
  const id = params?.id || "1";

  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const videoRef = useRef(null);

  const getVideoByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "/bg-video/videoplayback-1.mp4";
    if (hour >= 12 && hour < 17) return "/bg-video/videoplayback.webm";
    if (hour >= 17 && hour < 20) return "/bg-video/videoplayback-1.mp4";
    if (hour >= 20 || hour < 5) return "/bg-video/videoplayback.mp4";
    return "/bg-video/videoplayback.mp4";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await fetch(`/api/user/profile/${username}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");

        const data = await userRes.json();
        if (!data) throw new Error("No user data received");

        setUserData(data);
        const videoEnabled = data.videoEnabled === true || data.videoEnabled === "true";
        setVideoEnabled(videoEnabled);

        if (videoEnabled) {
          setCurrentVideo(getVideoByTime());
        }

        if (status === "authenticated" && session?.user) {
          const isAdminUser = session.user.role === "ADMIN";
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchData();
    }
  }, [username, session, status]);

  useEffect(() => {
    if (videoRef.current && currentVideo) {
      const playVideo = async () => {
        try {
          await videoRef.current.load();
          await videoRef.current.play();
        } catch (e) {
          console.log("Video play error:", e);
          setCurrentVideo(null);
        }
      };
      playVideo();
    }
  }, [currentVideo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ backgroundColor: userData.portfolioColor || "#ffffff" }}
    >
      {/* Admin Controls */}
      {isAdmin && status === "authenticated" && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            className="bg-green-500 px-3 py-1 sm:px-4 sm:py-2 rounded-2xl text-white hover:bg-green-600 transition-all duration-300 text-sm sm:text-base"
            onClick={() => router.push(`/portfolio/${username}/upload`)}
          >
            Upload Page
          </button>
        </div>
      )}

      {/* Background Video */}
      {videoEnabled && currentVideo && (
        <video
          ref={videoRef}
          src={currentVideo}
          className="fixed inset-0 w-full h-full object-cover z-0"
          loop
          muted
          autoPlay
          playsInline
          onError={() => setCurrentVideo(null)}
        />
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-center relative z-10 pt-20 sm:pt-10">
        {/* Store Logo */}
        {userData.storeImage && (
          <motion.img
            src={`${userData.storeImage}`}
            alt="Store Logo"
            className="mx-auto h-24 w-24 sm:h-40 sm:w-40 object-cover mb-4 sm:mb-8 border-4 border-white shadow-lg rounded-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Shop Image */}
        {userData?.shop?.image && (
          <motion.img
            src={
              userData.shop.image.startsWith("http") ? 
                userData.shop.image : 
                `${userData.shop.image}`
            }
            alt="Shop Image"
            className="mx-auto max-h-48 sm:max-h-96 w-auto max-w-full rounded-xl sm:rounded-2xl mt-6 sm:mt-10 object-cover mb-4 sm:mb-8 border-4 border-white shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Shop Description */}
        {userData.shop?.description && (
          <motion.p
            className="text-base sm:text-xl text-gray-600 max-w-2xl mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {userData.shop.description}
          </motion.p>
        )}

        {/* Title */}
        <div className="w-full px-4 sm:px-8">
          <div className={style.coverTitle}>
            <h1 className="text-xl sm:text-xl md:text-4xl font-bold break-words">
              {userData.shop?.name || userData.shopName || userData.username}
            </h1>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-gray-500 text-xs sm:text-sm relative z-10">
        {new Date().getFullYear()} © {userData.shopName || userData.username}
      </div>
      
      {/* Navigation Arrow */}
      <motion.div
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push(`/portfolio/${username}/page/${id}`)}
        className="cursor-pointer p-3 sm:p-4 md:p-5 flex justify-end"
      >
        <div className="text-2xl sm:text-3xl md:text-4xl text-gray-600 hover:text-black transition-colors">
          →
        </div>
      </motion.div>
    </motion.div>
  );
}