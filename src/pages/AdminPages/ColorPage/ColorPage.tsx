import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { colorApi } from "../../../services/ColorService";
import AddColor from "./AddColor";
import { useAuth } from "../../../hooks/useAuth";

interface Color {
  _id: string;
  name: string;
  code: string | null;
  colors: string[];
  type: "solid" | "half";
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const EditColorModal: React.FC<{
  color: Color;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ color, onClose, onSuccess }) => {
  const [name, setName] = useState(color.name);
  const [type, setType] = useState<"solid" | "half">(color.type);
  const [code, setCode] = useState(color.code || "");
  const [color1, setColor1] = useState(color.colors[0] || "");
  const [color2, setColor2] = useState(color.colors[1] || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === "solid") {
        await colorApi.update(color._id, { name, code, type });
      } else {
        await colorApi.update(color._id, {
          name,
          colors: [color1, color2],
          type,
        });
      }
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật màu thất bại!");
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
        <h2 className="text-xl font-bold mb-6 text-center">Cập nhật Màu</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Tên Màu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên màu"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600">
              Loại màu
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "solid" | "half")}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="solid">Solid</option>
              <option value="half">Half</option>
            </select>
          </div>
          {type === "solid" ? (
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600">
                Mã màu (HEX)
              </label>
              <input
                type="color"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-16 h-10 border border-gray-300 rounded"
                required
              />
              <span className="ml-2">{code}</span>
            </div>
          ) : (
            <div className="mb-4 flex gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600">
                  Màu 1 (HEX)
                </label>
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="mt-2 w-16 h-10 border border-gray-300 rounded"
                  required
                />
                <span className="ml-2">{color1}</span>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600">
                  Màu 2 (HEX)
                </label>
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="mt-2 w-16 h-10 border border-gray-300 rounded"
                  required
                />
                <span className="ml-2">{color2}</span>
              </div>
            </div>
          )}
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

const ColorPage: React.FC = () => {
  const { canDelete, canCreate, canUpdate } = useAuth();
  const [showAddColor, setShowAddColor] = useState(false);
  const [showEditColor, setShowEditColor] = useState<Color | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [colors, setColors] = useState<Color[]>([]);
  const [deletedColors, setDeletedColors] = useState<Color[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchColors = async () => {
    try {
      const res = await colorApi.getAll();
      setColors(res.data.data || []);
    } catch {
      setColors([]);
    }
  };

  const fetchDeletedColors = async () => {
    try {
      const res = await colorApi.getDeleted();
      setDeletedColors(res.data.data || []);
    } catch {
      setDeletedColors([]);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedColors();
    } else {
      fetchColors();
    }
  }, [showDeleted]);

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const filteredColors = (showDeleted ? deletedColors : colors).filter(
    (color) => {
      return color.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleDeleteColor = async (_id: string) => {
    try {
      await colorApi.delete(_id);
      if (showDeleted) {
        fetchDeletedColors();
      } else {
        fetchColors();
      }
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreColor = async (_id: string) => {
    try {
      await colorApi.restore(_id);
      fetchDeletedColors();
      fetchColors();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Màu Sắc
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
              placeholder="Nhập tên màu"
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
          Màu đang hoạt động
        </button>
        <button
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
          onClick={() => setShowDeleted(true)}
        >
          Màu đã xóa
        </button>
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => setShowAddColor(true)}
          >
            Thêm Màu
          </button>
        )}
      </div>
      {/* Add Color Modal */}
      {showAddColor && (
        <AddColor
          handleClose={() => setShowAddColor(false)}
          onSuccess={() => {
            setShowAddColor(false);
            fetchColors();
          }}
        />
      )}
      {/* Edit Color Modal */}
      {showEditColor && (
        <EditColorModal
          color={showEditColor}
          onClose={() => setShowEditColor(null)}
          onSuccess={fetchColors}
        />
      )}
      {/* Colors Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Tên Màu</th>
              <th className="py-3 px-4 text-left border-b">Mã Màu</th>
              <th className="py-3 px-4 text-left border-b">Loại</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredColors.map((color) => (
              <tr key={color._id} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4 border-b text-sm">{color._id}</td>
                <td className="py-2 px-4 border-b text-sm">{color.name}</td>
                <td className="py-2 px-4 border-b text-sm">
                  {color.type === "solid" ? (
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color.code || "#FFFFFF" }}
                    ></div>
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full border relative overflow-hidden flex-shrink-0"
                      style={{ minWidth: 24, minHeight: 24 }}
                    >
                      <div
                        style={{
                          backgroundColor: color.colors[0] || "#fff",
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          left: 0,
                          top: 0,
                          clipPath: "inset(0 50% 0 0)",
                        }}
                      />
                      <div
                        style={{
                          backgroundColor: color.colors[1] || "#fff",
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          right: 0,
                          top: 0,
                          clipPath: "inset(0 0 0 50%)",
                        }}
                      />
                    </div>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {color.type === "solid" ? "Solid" : "Half"}
                </td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  {color.deletedAt ? (
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
                        {canUpdate() && (
                          <button
                            onClick={() => setShowEditColor(color)}
                            className="inline-flex items-center justify-center bg-gray-400 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Sửa
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteColor(color._id)}
                            className="inline-flex items-center justify-center bg-gray-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Xóa
                          </button>
                        )}
                      </>
                    ) : (
                      canUpdate() && (
                        <button
                          onClick={() => handleRestoreColor(color._id)}
                          className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                        >
                          Khôi phục
                        </button>
                      )
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

export default ColorPage;
