"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, animate, color } from "framer-motion";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaShareFromSquare } from "react-icons/fa6";
import style from "../../../../css/style.module.css";
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { username, id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [maxImagesReached, setMaxImagesReached] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentVideo, setCurrentVideo] = useState("");
  const videoRef = useRef(null);
  const [animatedPrice, setAnimatedPrice] = useState(0);

  const getVideoByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "/bg-video/videoplayback.webm";
    if (hour >= 12 && hour < 17) return "/bg-video/videoplayback-1.mp4";
    if (hour >= 17 && hour < 20) return "/bg-video/videoplayback.mp4";
    if (hour >= 20 && hour < 24) return "/bg-video/videoplayback.mp4";
  };
  const hour = new Date().getHours();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check session ownership
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setIsOwner(["ADMIN", "MASTER"].includes(session?.user?.role));

      // Fetch product with cache busting
      const productRes = await fetch(
        `/api/portfolio/${username}/products/${id}?t=${Date.now()}`
      );
      if (!productRes.ok) throw new Error("Product not found");

      const productData = await productRes.json();

      setProduct({
        ...productData,
        image: productData.image.startsWith("/uploads")
          ? productData.image
          : `/uploads/${productData.image}`,
        images: (productData.images || []).map((img) => ({
          ...img,
          path: img.path.startsWith("/uploads")
            ? img.path
            : `/uploads/${img.filename}`,
        })),
      });

      setPosition(productData.position);
      setTotalProducts(productData.totalProducts);
      setMaxImagesReached((productData.images?.length || 0) >= 4);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      router.push(`/portfolio/${username}`);
    } finally {
      setLoading(false);
    }
  };
  const box = {
    width: 120,
    height: 45,
    backgroundColor: "#9911ff",
    borderRadius: 5,
  };
  useEffect(() => {
    if (product?.price) {
      animate(0, product.price, {
        duration: 1.5,
        onUpdate(value) {
          setAnimatedPrice(value);
        },
      });
    }
  }, [product?.price]);

  useEffect(() => {
    fetchProduct();
  }, [id, username]);

  useEffect(() => {
    const videoPath = getVideoByTime();
    setCurrentVideo(videoPath);
  }, []);

  const handleImageUpload = async (e) => {
    if (!isOwner) return;
    if (maxImagesReached) {
      setUploadError("Maximum 4 images allowed");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadError("");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`/api/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      // Force a full refresh to ensure consistency
      await fetchProduct();
    } catch (error) {
      setUploadError(error.message);
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Product not found"}
          <button
            onClick={() => router.push(`/portfolio/${username}`)}
            className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Portfolio
          </button>
        </div>
      </div>
    );
  }
  const mainColor =
    hour >= 5 && hour < 12
      ? { color: "black" }
      : { color: "some-default-color" };

  return (
    <div
      className="min-h-screen p-4 relative"
      style={{ backgroundColor: product.portfolioColor || "#ffffff" }}
    >
      {/* Video background */}
      {currentVideo && (
        <video
          ref={videoRef}
          src={currentVideo}
          className="fixed inset-0 w-full h-full object-cover z-0"
          loop
          muted
          autoPlay
          playsInline
        />
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {isOwner && (
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/portfolio/${username}/upload`)}
                className=" px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add page
              </button>

              <label
                className={`px-4 py-2 rounded cursor-pointer ${
                  maxImagesReached
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={maxImagesReached}
                />
              </label>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {uploadError}
          </div>
        )}

        <div
          className={`bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-lg shadow-lg pt-20 h-150 p-6 relative z-10 ${style.background}`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Slider */}
            <div class="space-y-4 w-full max-w-[600px] sm:max-w-[800px] md:max-w-[760px] lg:max-w-xl xl:max-w-3xl">
              <Swiper
                modules={[Navigation, Pagination]}
                pagination={{ clickable: true }}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]" // responsive heights
              >
                {/* Main product image */}
                <SwiperSlide>
                  <div className="relative w-full h-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-contain rounded-b-2xl ${style.img}`}
                      priority
                      sizes="(max-width: 768px) 140vw, 130vw"
                      onError={(e) => {
                        console.error(
                          "Failed to load main image:",
                          product.image
                        );
                        e.currentTarget.src = "/default-product.png";
                      }}
                    />
                  </div>
                </SwiperSlide>

                {/* Additional images */}
                {product.images?.map((img) => (
                  <SwiperSlide key={img.id}>
                    <div className="relative w-full h-full rounded-b-2xl">
                      <Image
                        src={img.path}
                        alt={`${product.name} - ${img.id}`}
                        fill
                        className={`object-contain rounded-3xl ${style.img}`}
                        sizes="(max-width: 768px) 140vw, 130vw"
                        onError={(e) => {
                          console.error("Failed to load image:", img.path);
                          e.currentTarget.src = "/default-product.png";
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Product Details */}
            <div>
              <div className="items-start mb-4">
                <h4 className="text-2xl w-full font-bold mr-75 sm:mr-50">
                  {product.name}
                </h4>
              </div>

              {product.description && (
                <div className="prose max-w-none" style={mainColor}>
                  <p>{product.description}</p>
                </div>
              )}
              <div className="border-t pt-4 flex">
                <p className="text-sm mr-4.5   text-gray-500">
                  Sold by: {product.shopName || username}
                </p>

                <a
                  className="text-xl  transition ease-in duration-300 hover:bg-blue-950 h-10 w-10 rounded-[50%] pl-3 pt-2 mt-[-10px] "
                  href={product.link}
                >
                  <FaShareFromSquare className="text-teal-500" />
                </a>
              </div>
              <motion.p
                className="text-lg mt-5 sm:mr-44 md:mr-44 lg:mr-44 font-semibold text-pink-700"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                ${animatedPrice.toFixed(2)}
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                style={box}
                className={`flex gap-4 mt-6 ${style.black}`}
              >
                <button
                  onClick={() => router.back()}
                  className={`px-4 py-2 bg-pink-500 text-white rounded transition-all duration-300 ease-in hover:bg-white hover:text-black hover:px-6 `}
                >
                  Back
                </button>
              </motion.div>
              {position < totalProducts && (
                <button
                  onClick={() =>
                    router.push(`/portfolio/${username}/page/${position + 1}`)
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Next Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
