'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UploadProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.name || !formData.price || !formData.description || !formData.image) {
        throw new Error('All fields are required');
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('image', formData.image);
      data.append('username', session.user.username); // 🔥 You must return `username` in session

      const res = await fetch('/api/products', {
        method: 'POST',
        body: data
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      const product = await res.json();
      setSuccess(true);
      setFormData({ name: '', price: '', description: '', image: null });

      setTimeout(() => {
        router.push(`/portfolio/${session.user.username}/products/${product.id}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (status !== 'authenticated') return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Upload Product</h2>

      {success && <p className="text-green-600 mb-4 text-center">Product uploaded! Redirecting...</p>}
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} step="0.01" min="0" required className="w-full border p-2 rounded" />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows="4" required className="w-full border p-2 rounded" />
        <input type="file" name="image" onChange={handleChange} accept="image/*" required className="w-full" />
        {formData.image && <p className="text-sm text-gray-500">Selected: {formData.image.name}</p>}

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isLoading ? 'Uploading...' : 'Upload Product'}
        </button>
      </form>
    </div>
  );
}
