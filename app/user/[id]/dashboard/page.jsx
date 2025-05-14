"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function ProductForm() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const pathname = usePathname();
  const isActive = pathname === `/user/${id}/dashboard/uploadProduct`;

  const [formData, setFormData] = useState({
    shopName: "",
    shopImage: null,
    description: "",
    bgColor: "#ffffff",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [profileLink, setProfileLink] = useState("");
  const [userPlan, setUserPlan] = useState("BASIC");

  // Fetch user data on load
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated" && id) {
        try {
          const res = await fetch(`/api/user/${id}`);
          const data = await res.json();

          if (data.error) throw new Error(data.error);

          setProfileLink(data.profileLink || "");
          setUserPlan(data.plan || "BASIC");

          setFormData({
            shopName: data.shopName || "",
            shopImage: null,
            description: data.description || "",
            bgColor: data.portfolioColor || "#ffffff",
          });

          if (data.storeImage) {
            setImagePreview(`/uploads/${data.storeImage}`);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setMessage({ text: err.message, type: "error" });
        }
      }
    };

    fetchUserData();
  }, [status, id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "shopImage" && files?.[0]) {
      setFormData((prev) => ({ ...prev, shopImage: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setMessage({ text: "User ID not found", type: "error" });
      return;
    }

    if (!formData.shopName) {
      setMessage({ text: "Shop name is required", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", id);
      formDataToSend.append("shopName", formData.shopName);
      formDataToSend.append("description", formData.description);

      if (formData.shopImage) {
        formDataToSend.append("shopImage", formData.shopImage);
      } else if (imagePreview) {
        formDataToSend.append("keepExistingImage", "true");
      }

      if (userPlan === "PROFESSIONAL") {
        formDataToSend.append("portfolioColor", formData.bgColor);
      }

      const res = await fetch("/api/shop", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save shop data");
      }

      setMessage({ text: "Shop settings saved successfully!", type: "success" });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppShareLink = () => {
    if (typeof window !== "undefined" && profileLink) {
      return `https://wa.me/?text=${encodeURIComponent(
        `Check out my shop: ${window.location.origin}/portfolio/${profileLink}`
      )}`;
    }
    return "#";
  };

  return (
    <div className="mt-6 mr-6 ml-8">
      <nav>
        <div className="flex justify-end">
          <Link
            href={`/user/${id}/dashboard/uploadProduct`}
            className={`mr-10 bg-[rgb(5,52,59)] w-50 h-10 rounded-lg text-white hover:bg-[rgb(10,151,240)] pl-4.5 pt-2 font-bold transition-all duration-300 ${
              isActive ? "bg-[rgb(10,151,240)]" : ""
            }`}
          >
            Upload Your Products
          </Link>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <h1 className="text-xl font-bold">Cover Page</h1>

        {profileLink && (
          <div className="flex items-center gap-4 p-3 rounded-lg mb-4 bg-gray-50 border">
            <p className="font-medium">Your shop URL:</p>
            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:underline"
            >
              <FaWhatsapp size={20} />
              Share on WhatsApp
            </a>
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Enter your cover page name</label>
          <input
            name="shopName"
            type="text"
            placeholder="My Awesome Shop"
            className="border p-2 w-full rounded-lg"
            value={formData.shopName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Enter your jargon</label>
          <input
            type="text"
            name="description"
            placeholder="Add your jargon"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 w-full rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Shop Logo/Image {imagePreview ? "" : <span className="text-red-500">*</span>}
          </label>
          <input
            name="shopImage"
            type="file"
            className="border p-2 w-full rounded-lg"
            onChange={handleChange}
            accept="image/*"
            required={!imagePreview}
          />

          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img
                src={imagePreview}
                alt="Shop preview"
                className="h-32 object-contain border rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview("");
                  setFormData((prev) => ({ ...prev, shopImage: null }));
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {userPlan === "PROFESSIONAL" && (
          <>
            <div>
              <label className="block font-medium mb-1">Shop Description</label>
              <textarea
                name="description"
                placeholder="Tell customers about your shop..."
                className="border p-2 w-full rounded-lg"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Shop Background Color</label>
              <div className="flex items-center gap-4">
                <input
                  name="bgColor"
                  type="color"
                  className="h-10 w-10 cursor-pointer"
                  value={formData.bgColor}
                  onChange={handleChange}
                />
                <span>{formData.bgColor}</span>
              </div>
            </div>
          </>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {loading ? "Saving..." : "Save Shop Settings"}
          </button>
        </div>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}