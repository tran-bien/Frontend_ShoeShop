import React, { useState } from "react";
import { adminColorService } from "../../../services/ColorService";

interface AddColorProps {
  handleClose: () => void;
  onSuccess?: () => void;
}

const AddColor: React.FC<AddColorProps> = ({ handleClose, onSuccess }) => {
  const [type, setType] = useState<"solid" | "half">("solid");
  const [name, setName] = useState("");
  const [code, setCode] = useState(""); // for solid
  const [color1, setColor1] = useState(""); // for half
  const [color2, setColor2] = useState(""); // for half
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === "solid") {
        await adminColorService.create({ name, code, type });
      } else {
        await adminColorService.create({
          name,
          colors: [color1, color2],
          type,
        });
      }
      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      setError("Thêm màu thất bại!");
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
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Màu</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Tên Màu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên màu"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-mono-600">
              Loại màu
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "solid" | "half")}
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
            >
              <option value="solid">Solid</option>
              <option value="half">Half</option>
            </select>
          </div>
          {type === "solid" ? (
            <div className="mb-4">
              <label className="block text-sm font-bold text-mono-600">
                Mã màu (HEX)
              </label>
              <input
                type="color"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-16 h-10 border border-mono-300 rounded"
                required
              />
              <span className="ml-2">{code}</span>
            </div>
          ) : (
            <div className="mb-4 flex gap-4">
              <div>
                <label className="block text-sm font-bold text-mono-600">
                  Màu 1 (HEX)
                </label>
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="mt-2 w-16 h-10 border border-mono-300 rounded"
                  required
                />
                <span className="ml-2">{color1}</span>
              </div>
              <div>
                <label className="block text-sm font-bold text-mono-600">
                  Màu 2 (HEX)
                </label>
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="mt-2 w-16 h-10 border border-mono-300 rounded"
                  required
                />
                <span className="ml-2">{color2}</span>
              </div>
            </div>
          )}
          {error && <div className="text-mono-800 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-mono-700 hover:bg-mono-800 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang thêm..." : "Thêm Màu"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-mono-200 hover:bg-mono-300 text-mono-700 px-6 py-2 rounded-md"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColor;
