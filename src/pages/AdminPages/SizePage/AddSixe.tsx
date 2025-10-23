import React, { useState } from "react";
import { sizeApi } from "../../../services/SizeService";

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
      await sizeApi.create({ value: Number(value), type, description });
      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      setError("Thêm size thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Size</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Giá trị size
            </label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Nhập giá trị size (VD: 41.5)"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Loại size
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <label className="block text-sm font-bold text-gray-600">
              Mô tả
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang thêm..." : "Thêm Size"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSize;
