import React, { useState } from "react";
import { categoryApi } from "../../../services/CategoryService";

interface AddCategoryProps {
  handleClose: () => void;
  onSuccess?: () => void;
}

const AddCategoryPage: React.FC<AddCategoryProps> = ({
  handleClose,
  onSuccess,
}) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryDescription, setCategoryDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleCategoryDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCategoryDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await categoryApi.create({
        name: categoryName,
        description: categoryDescription,
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch {
      setError("Thêm danh mục thất bại!");
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
        <h2 className="text-xl font-bold mb-6 text-center">Thêm Danh Mục</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="categoryName"
              className="block text-sm font-bold text-mono-600"
            >
              Tên Danh Mục
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={handleCategoryNameChange}
              placeholder="Nhập tên danh mục"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="categoryDescription"
              className="block text-sm font-bold text-mono-600"
            >
              Mô tả
            </label>
            <textarea
              id="categoryDescription"
              value={categoryDescription}
              onChange={handleCategoryDescriptionChange}
              placeholder="Nhập mô tả danh mục"
              className="mt-2 block w-full px-4 py-2 border border-mono-300 rounded-md"
              required
            />
          </div>
          {error && <div className="text-mono-800 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Đang thêm..." : "Thêm Danh Mục"}
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

export default AddCategoryPage;
