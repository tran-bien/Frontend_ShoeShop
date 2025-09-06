import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { sizeApi } from "../../../services/Size";
import AddSize from "./AddSixe";

interface Size {
  _id: string;
  value: number;
  description: string;
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const EditSizeModal: React.FC<{
  size: Size;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ size, onClose, onSuccess }) => {
  const [value, setValue] = useState<number>(size.value);
  const [description, setDescription] = useState(size.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sizeApi.update(size._id, { value, description });
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật size thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative text-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Cập nhật Size</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Giá trị size
            </label>
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              placeholder="Nhập giá trị size (VD: 41.5)"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <button
              type="button"
              onClick={onClose}
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

const SizePage: React.FC = () => {
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sizes, setSizes] = useState<Size[]>([]);
  const [deletedSizes, setDeletedSizes] = useState<Size[]>([]);
  const [showAddSize, setShowAddSize] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);

  const fetchSizes = async () => {
    try {
      const res = await sizeApi.getAll();
      setSizes(res.data.data || []);
    } catch {
      setSizes([]);
    }
  };

  const fetchDeletedSizes = async () => {
    try {
      const res = await sizeApi.getDeleted();
      setDeletedSizes(res.data.data || []);
    } catch {
      setDeletedSizes([]);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedSizes();
    } else {
      fetchSizes();
    }
  }, [showDeleted]);

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const filteredSizes = (showDeleted ? deletedSizes : sizes).filter((size) => {
    return (
      size.value.toString().includes(searchQuery) ||
      size.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleDeleteSize = async (_id: string) => {
    try {
      await sizeApi.delete(_id);
      if (showDeleted) {
        fetchDeletedSizes();
      } else {
        fetchSizes();
      }
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreSize = async (_id: string) => {
    try {
      await sizeApi.restore(_id);
      fetchDeletedSizes();
      fetchSizes();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Kích Thước
        </h2>
        {!isSearchVisible ? (
          <button
            onClick={toggleSearchVisibility}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-3xl shadow transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-gray-200"
          >
            <IoIosSearch className="text-xl text-gray-500" />
            <span className="font-medium">Tìm kiếm</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 w-full max-w-md">
            <IoIosSearch
              onClick={handleBack}
              className="text-gray-400 cursor-pointer text-xl"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Nhập kích thước hoặc mô tả"
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
      {/* Tab chuyển đổi */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            !showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
          onClick={() => setShowDeleted(false)}
        >
          Size đang hoạt động
        </button>
        <button
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
          onClick={() => setShowDeleted(true)}
        >
          Size đã xóa
        </button>
        {!showDeleted && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => setShowAddSize(true)}
          >
            Thêm Kích Thước
          </button>
        )}
      </div>
      {/* Hiển thị modal thêm size */}
      {showAddSize && (
        <AddSize
          handleClose={() => setShowAddSize(false)}
          onSuccess={fetchSizes}
        />
      )}
      {/* Hiển thị modal sửa size */}
      {editingSize && (
        <EditSizeModal
          size={editingSize}
          onClose={() => setEditingSize(null)}
          onSuccess={fetchSizes}
        />
      )}
      {/* Sizes Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Giá Trị</th>
              <th className="py-3 px-4 text-left border-b">Mô Tả</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSizes.map((size) => (
              <tr key={size._id} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4 border-b text-sm">{size._id}</td>
                <td className="py-2 px-4 border-b text-sm">{size.value}</td>
                <td className="py-2 px-4 border-b text-sm">
                  {size.description}
                </td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  {size.deletedAt ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Đã xóa
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Hoạt động
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {!showDeleted ? (
                      <>
                        <button
                          onClick={() => setEditingSize(size)}
                          className="inline-flex items-center justify-center bg-gray-400 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSize(size._id)}
                          className="inline-flex items-center justify-center bg-gray-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-sm transition-all"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestoreSize(size._id)}
                        className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-sm transition-all"
                      >
                        Khôi phục
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SizePage;
