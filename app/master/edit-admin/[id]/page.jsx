'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    passwordExpires: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    if (!session || session.user.role !== "MASTER") {
      router.push('/auth/login');
      return;
    }

    // Fetch admin data
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`/api/admins/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch admin');
        
        setAdminData(data);
        setFormData({
          password: '',
          passwordExpires: data.passwordExpires.split('T')[0] || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, [session, router, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formData.password || undefined,
          passwordExpires: formData.passwordExpires
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update admin');
      
      setSuccess('Admin updated successfully!');
      setTimeout(() => router.push('/master'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (!adminData) return <div className="container mx-auto p-4">Admin not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit Admin: {adminData.username}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Expiration Date
          </label>
          <input
            type="date"
            name="passwordExpires"
            value={formData.passwordExpires}
            onChange={(e) => setFormData({...formData, passwordExpires: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            disabled={!formData.passwordExpires}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push('/master')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}