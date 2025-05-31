"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Nav from "../Home/Nav/page";
export default function PortfolioReviewPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/portfolios?page=${pagination.page}&limit=${pagination.limit}`
        );
        if (!res.ok) throw new Error("Failed to load portfolios");

        const { data, total, page, totalPages, limit } = await res.json();
        setPortfolios(data);
        setPagination((prev) => ({
          ...prev,
          total,
          page,
          totalPages,
          limit,
        }));
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

   

    fetchPortfolios();
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading portfolios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
       

        <div className="text-xl text-red-500 max-w-md text-center">
          {error.includes("Failed to load")
            ? "We couldn't load the portfolios right now."
            : error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          aria-label="Retry loading portfolios"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Nav />
      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No portfolios found</p>
          <p className="text-sm text-gray-400 mt-2">
            Check back later or create your own!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-15">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                onClick={() => router.push(`/portfolio/${portfolio.username}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
                aria-label={`View ${
                  portfolio.shopName || portfolio.username
                }'s portfolio`}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={portfolio.coverImage}
                    alt={`Cover image for ${
                      portfolio.shopName || portfolio.username
                    }`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    priority={true}
                    loading="eager"
                  />
                </div>
                <div
                  className="p-4 transition-colors duration-300"
                  style={{
                    backgroundColor: portfolio.portfolioColor || "#ffffff",
                  }}
                >
                  <h2 className="text-xl font-semibold truncate">
                    {portfolio.shopName}
                  </h2>
                  <p className="text-sm text-gray-600">@{portfolio.username}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded ${
                      pagination.page === pageNum
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
