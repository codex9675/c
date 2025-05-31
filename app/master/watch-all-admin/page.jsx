"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import { MdOutlineCheck } from "react-icons/md";
export default function WatchAllAdmin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "MASTER") {
      fetchUsers();
    }
  }, [session]);

  const handleRemoveAdmin = async (adminId) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/user?id=${adminId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove admin");
      }

      // Optimistically update the UI
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);

      setUsers(users.filter((user) => user.id !== adminId));
      setConfirmDelete(null);

      // Optional: Show success message
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };
  const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  const filteredAdmins = users
    .filter((user) => user.role === "ADMIN")
    .filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
    );

  if (!session || session.user.role !== "MASTER") {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You must be a master admin to view this page.</p>
      </div>
    );
  }

  if (loading)
    return <div className="container mx-auto p-4">Loading admins...</div>;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
      {success && (
        <div className="bg-green-600 flex h-10 rounded-4xl pt-2 pl-4 max-w-70 mb-10">
          <MdOutlineCheck className="text-2xl pr-2 text-white" />
          <h1 className="text-white pr-5">Admin are deleted successfully</h1>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="mb-6 flex justify-between items-center">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link
          href="/master/create-admin"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          + Add New Admin
        </Link>
      </div>

      {/* Admin Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr className="text-black">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">Client ID</th>
              <th className="py-3 px-4 text-left">Client Name</th>
              <th className="py-3 px-4 text-left">Date of Joining</th>
              <th className="py-3 px-4 text-left">Package</th>
              <th className="py-3 px-4 text-left">Expire Date</th>
              <th className="py-3 px-4 text-left">Remaining Days</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-black">
                  No admins found
                </td>
              </tr>
            ) : (
              filteredAdmins.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 text-black"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{user.plan}</td>
                  <td className="py-3 px-4">
                    {new Date(user.passwordExpires).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {calculateRemainingDays(user.passwordExpires)}
                  </td>
                  <td className="py-3 px-4 relative">
                    <div className="flex gap-3 items-center">
                      <Link
                        href={`/master/edit-admin/${user.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setConfirmDelete(user.id)}
                        disabled={isDeleting}
                      >
                        Remove
                      </button>
                      <Link
                        href={`/portfolio/${user.profileLink}`}
                        className="text-gray-700 hover:text-black"
                        title="View Profile"
                      >
                        <FaExternalLinkAlt />
                      </Link>
                    </div>

                    {confirmDelete === user.id && (
                      <div className="absolute bg-white border p-4 shadow-lg rounded z-10 mt-2">
                        <p className="mb-2">
                          Are you sure you want to remove this admin?
                        </p>
                        <div className="flex gap-2">
                          <button
                            className={`bg-red-600 text-white px-4 py-2 rounded ${
                              isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() => handleRemoveAdmin(user.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Yes"}
                          </button>
                          <button
                            className="text-gray-600"
                            onClick={() => setConfirmDelete(null)}
                            disabled={isDeleting}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
