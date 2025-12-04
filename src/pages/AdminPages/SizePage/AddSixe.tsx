import React, { useState } from "react";
import { adminSizeService } from "../../../services/SizeService";

interface AddSizeProps {
  handleClose: () => void;
  onSuccess?: () => void;
}

const AddSize: React.FC<AddSizeProps> = ({ handleClose, onSuccess }) => {
  const [value, setValue] = useState<number | "">("");
  const [type, setType] = useState<string>("EU");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminSizeService.create({ value: String(value), region: type });
      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      setError("Thêm size th?t b?i!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-mono-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 text-mono-500 hover:text-mono-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Size</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Giá tr? size
            </label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Nh?p giá tr? size (VD: 41.5)"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Lo?i size
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mono-600"
              required
            >
              <option value="EU">EU (European)</option>
              <option value="US">US (United States)</option>
              <option value="UK">UK (United Kingdom)</option>
              <option value="VN">VN (Vietnam)</option>
              <option value="CM">CM (Centimeters)</option>
              <option value="INCHES">INCHES</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Mô t?
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nh?p mô t?"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          {error && <div className="text-mono-800 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-700 hover:bg-mono-800 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Ðang thêm..." : "Thêm Size"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-mono-200 hover:bg-mono-300 text-mono-700 px-6 py-2 rounded-md"
            >
              H?y
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSize;
