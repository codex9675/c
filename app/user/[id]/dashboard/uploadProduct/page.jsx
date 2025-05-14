'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload product');
      }

      // Show success message
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        price: '',
        description: '',
        image: null
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Upgrade</h1>
      
      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Product uploaded successfully!
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3  text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isLoading ? 'Uploading...' : 'Upload Product'}
        </button>
      </form>
    </div>
  );
}