import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [primary, setPrimary] = useState<string>(
    localStorage.getItem('tt_primary') || '#eab308'
  );

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setPrimary(hex);
    localStorage.setItem('tt_primary', hex);
    document.documentElement.style.setProperty('--tt-primary', hex);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <section className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Restaurant Info</h2>
        <p><strong>Name (TH):</strong> {user?.restaurant?.name_th}</p>
        <p><strong>Name (EN):</strong> {user?.restaurant?.name_en}</p>
        <p><strong>Your Role:</strong> {user?.role}</p>
      </section>

      <section className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Brand Settings</h2>
        <div className="flex items-center space-x-6">
          <div>
            <p className="mb-2 font-medium">Primary Colour</p>
            <input
              type="color"
              value={primary}
              onChange={handleColorChange}
              className="w-20 h-10 border cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <p className="mb-2 font-medium">Preview</p>
            <div
              className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: primary }}
            >
              ThaiTable
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
