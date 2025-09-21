import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { categoryApi } from "../../../services/CategoryService";
import AddCategoryPage from "./AddCategories";
import { useAuth } from "../../../hooks/useAuth";

// Định nghĩa lại interface cho đúng với dữ liệu backend trả về
interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const EditCategoryModal: React.FC<{
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
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
      await categoryApi.update(category._id, formData);
      onSuccess();
      onClose();
    } catch {
      setError("Cập nhật danh mục thất bại!");
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
          Cập nhật Danh Mục
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-black">
              Tên Danh Mục
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

const ListCategoriesPage: React.FC = () => {
  const { canCreate, canUpdate, canDelete, canToggleStatus } = useAuth();
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchDeletedCategories = async () => {
    try {
      const res = await categoryApi.getDeleted();
      setDeletedCategories(res.data.data || []);
    } catch {
      setDeletedCategories([]);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedCategories();
    } else {
      fetchCategories();
    }
  }, [showDeleted]);

  const handleBack = () => {
    setIsSearchVisible(false);
    setSearchQuery("");
  };

  const filteredCategories = (
    showDeleted ? deletedCategories : categories
  ).filter((category) => {
    return (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryApi.delete(id);
      if (showDeleted) {
        fetchDeletedCategories();
      } else {
        fetchCategories();
      }
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleRestoreCategory = async (id: string) => {
    try {
      await categoryApi.restore(id);
      fetchDeletedCategories();
      fetchCategories();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    try {
      await categoryApi.updateStatus(id, { isActive });
      fetchCategories();
    } catch {
      // Xử lý lỗi nếu cần
    }
  };

  return (
    <div className="p-6 w-full font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug">
          Danh Sách Danh Mục
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
          Danh mục đang hoạt động
        </button>
        <button
          onClick={() => setShowDeleted(true)}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Danh mục đã xóa
        </button>
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => setShowAddCategory(true)}
          >
            Thêm Danh Mục
          </button>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryPage
          handleClose={() => setShowAddCategory(false)}
          onSuccess={fetchCategories}
        />
      )}
      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={fetchCategories}
        />
      )}

      {/* Categories Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-md overflow-hidden border">
          <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
            <tr>
              <th className="py-3 px-4 text-left border-b">ID</th>
              <th className="py-3 px-4 text-left border-b">Tên Danh Mục</th>
              <th className="py-3 px-4 text-left border-b">Slug</th>
              <th className="py-3 px-4 text-left border-b">Mô Tả</th>
              <th className="py-3 px-4 text-center border-b">Trạng Thái</th>

              <th className="py-3 px-4 text-center border-b">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50 border-t">
                <td className="px-4 py-3 text-sm">{category._id}</td>
                <td className="px-4 py-3 text-sm">{category.name}</td>
                <td className="px-4 py-3 text-sm">{category.slug}</td>
                <td className="px-4 py-3 text-sm">{category.description}</td>
                <td className="px-4 py-3 text-center">
                  {category.deletedAt ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Đã xóa
                    </span>
                  ) : category.isActive ? (
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
                            onClick={() => setEditingCategory(category)}
                            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Sửa
                          </button>
                        )}
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-sm transition-all"
                          >
                            Xóa
                          </button>
                        )}
                        {canToggleStatus() && (
                          <button
                            className={`inline-flex items-center justify-center text-xs px-3 py-1 rounded-full shadow-sm transition-all ${
                              category.isActive
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                            }`}
                            onClick={() =>
                              handleUpdateStatus(
                                category._id,
                                !category.isActive
                              )
                            }
                          >
                            {category.isActive ? "Tắt hoạt động" : "Kích hoạt"}
                          </button>
                        )}
                      </>
                    ) : (
                      canUpdate() && (
                        <button
                          onClick={() => handleRestoreCategory(category._id)}
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

export default ListCategoriesPage;
