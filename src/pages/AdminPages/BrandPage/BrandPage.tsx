import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { brandApi } from "../../../services/BrandService";
import AddBrand from "./AddBrand";
import BrandLogoManager from "./BrandLogoManager";
import { useAuth } from "../../../hooks/useAuth";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: {
    url: string;
    public_id: string;
  };
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const EditBrand: React.FC<{
  brand: Brand;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ brand, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: brand.name,
    description: brand.description,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await brandApi.update(brand._id, formData);
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật thương hiệu thất bại!");
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
        <h2 className="text-xl font-bold mb-6 text-center">
          Cập nhật Thương Hiệu
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black">
              Tên Thương Hiệu
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Mô Tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ListBrandsPage: React.FC = () => {
  const { canDelete, canCreate, canUpdate, canToggleStatus } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deletedBrands, setDeletedBrands] = useState<Brand[]>([]);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showLogoManager, setShowLogoManager] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    try {
      const res = await brandApi.getAll();
      setBrands(res.data.data || []);
    } catch {
      setBrands([]);
    }
  };

  const fetchDeletedBrands = async () => {
    try {
      const res = await brandApi.getDeleted();
      setDeletedBrands(res.data.data || []);
    } catch {
      setDeletedBrands([]);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedBrands();
    } else {
      fetchBrands();
    }
  }, [showDeleted]);

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const filteredBrands = (showDeleted ? deletedBrands : brands).filter(
    (brand) => {
      return (
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleDeleteBrand = async (_id: string) => {
    try {
      await brandApi.delete(_id);
      if (showDeleted) {
        fetchDeletedBrands();
      } else {
        fetchBrands();
      }
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreBrand = async (_id: string) => {
    try {
      await brandApi.restore(_id);
      fetchDeletedBrands();
      fetchBrands();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleUpdateStatus = async (_id: string, isActive: boolean) => {
    try {
      await brandApi.updateStatus(_id, { isActive });
      fetchBrands();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Thương Hiệu
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
              placeholder="Tìm theo tên hoặc slug..."
              className="w-full px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Tab chuyển đổi */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setShowDeleted(false)}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            !showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Thương hiệu đang hoạt động
        </button>
        <button
          onClick={() => setShowDeleted(true)}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Thương hiệu đã xóa
        </button>
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => setShowAddBrand(true)}
          >
            Thêm Thương Hiệu
          </button>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddBrand && (
        <AddBrand
          handleClose={() => setShowAddBrand(false)}
          onSuccess={fetchBrands}
        />
      )}
      {/* Edit Brand Modal */}
      {editingBrand && (
        <EditBrand
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onSuccess={fetchBrands}
        />
      )}
      {/* Brands Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Tên Thương Hiệu</th>
              <th className="py-3 px-4 text-left border-b">Slug</th>
              <th className="py-3 px-4 text-left border-b">Mô Tả</th>
              <th className="py-3 px-4 text-center border-b">Logo</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.map((brand) => (
              <tr key={brand._id} className="hover:bg-gray-50 border-t">
                <td className="px-4 py-3 text-sm">{brand._id}</td>
                <td className="px-4 py-3 text-sm">{brand.name}</td>
                <td className="px-4 py-3 text-sm">{brand.slug}</td>
                <td className="px-4 py-3 text-sm">{brand.description}</td>
                <td className="px-4 py-3 text-center">
                  {brand.logo?.url ? (
                    <img
                      src={brand.logo.url}
                      alt={brand.name}
                      className="h-10 w-10 object-contain mx-auto"
                    />
                  ) : (
                    <span className="text-gray-400">Không có</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {brand.deletedAt ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Đã xóa
                    </span>
                  ) : brand.isActive ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Không hoạt động
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {!showDeleted ? (
                      <>
                        {canUpdate() && (
                          <button
                            onClick={() => setEditingBrand(brand)}
                            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Sửa
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteBrand(brand._id)}
                            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Xóa
                          </button>
                        )}
                        {canToggleStatus() && (
                          <button
                            className={`inline-flex items-center justify-center text-xs px-3 py-1 rounded-full shadow-sm transition-all ${
                              brand.isActive
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                            }`}
                            onClick={() =>
                              handleUpdateStatus(brand._id, !brand.isActive)
                            }
                          >
                            {brand.isActive ? "Tắt hoạt động" : "Kích hoạt"}
                          </button>
                        )}
                        {canUpdate() && (
                          <button
                            onClick={() => setShowLogoManager(brand)}
                            className="inline-flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Quản lý logo
                          </button>
                        )}
                      </>
                    ) : (
                      canUpdate() && (
                        <button
                          onClick={() => handleRestoreBrand(brand._id)}
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
      {/* Modal quản lý logo */}
      {showLogoManager && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setShowLogoManager(null)}
            >
              ×
            </button>
            <BrandLogoManager
              brandId={showLogoManager._id}
              logo={showLogoManager.logo}
              reloadBrand={fetchBrands}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBrandsPage;
