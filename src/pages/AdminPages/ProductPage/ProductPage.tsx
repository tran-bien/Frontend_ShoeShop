import { useState, useEffect } from "react";
import { productApi } from "../../../services/ProductService";
import { brandApi } from "../../../services/BrandService";
import { categoryApi } from "../../../services/CategoryService";
import { Product } from "../../../model/Product";
import AddProduct from "./AddProduct";
import ProductDetail from "./ProductDetail";
import { useAuth } from "../../../hooks/useAuth";

const ProductPage = () => {
  const { canDelete, canCreate, canUpdate, canToggleStatus } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal cập nhật trạng thái active
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [activeForm, setActiveForm] = useState({
    isActive: false,
    cascade: true,
  });

  // State cho form sửa
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = showDeleted
        ? await productApi.getDeleted()
        : await productApi.getAll();
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [showDeleted]);

  useEffect(() => {
    if (showEdit) {
      brandApi.getAll().then((res) => setBrands(res.data.data || []));
      categoryApi.getAll().then((res) => setCategories(res.data.data || []));
    }
  }, [showEdit]);

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchProducts();
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category:
        typeof product.category === "string"
          ? product.category
          : product.category?._id || "",
      brand:
        typeof product.brand === "string"
          ? product.brand
          : product.brand?._id || "",
    });
    setEditError(null);
    setShowEdit(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await productApi.update(selectedProduct._id, editForm);
      setShowEdit(false);
      fetchProducts();
    } catch {
      setEditError("Cập nhật sản phẩm thất bại!");
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await productApi.delete(selectedProduct._id);
    setShowDelete(false);
    fetchProducts();
  };

  const handleRestore = async (id: string) => {
    await productApi.restore(id);
    fetchProducts();
  };

  // Mở modal cập nhật trạng thái active
  const openActiveModal = (product: Product) => {
    setSelectedProduct(product);
    setActiveForm({ isActive: !product.isActive, cascade: true });
    setShowActiveModal(true);
  };

  // Gửi cập nhật trạng thái active
  const handleActiveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    await productApi.updateStatus(selectedProduct._id, activeForm);
    setShowActiveModal(false);
    fetchProducts();
  };

  const handleUpdateStockStatus = async (product: Product) => {
    await productApi.updateStockStatus(product._id);
    fetchProducts();
  };

  const openModal = (type: string, product?: Product) => {
    if (product) setSelectedProduct(product);
    switch (type) {
      case "add":
        setShowAdd(true);
        break;
      case "edit":
        openEditModal(product!);
        break;
      case "delete":
        openDeleteModal(product!);
        break;
      case "detail":
        setShowDetail(true);
        break;
    }
  };

  const closeModal = (type: string) => {
    switch (type) {
      case "add":
        setShowAdd(false);
        break;
      case "edit":
        setShowEdit(false);
        break;
      case "delete":
        setShowDelete(false);
        break;
      case "detail":
        setShowDetail(false);
        break;
      case "active":
        setShowActiveModal(false);
        break;
    }
    setSelectedProduct(null);
  };

  return (
    <div className="p-6 w-full font-sans">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-6">
        Danh Sách Sản Phẩm
      </h2>
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
          Sản phẩm
        </button>
        <button
          onClick={() => setShowDeleted(true)}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            showDeleted
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-blue-600"
          }`}
        >
          Sản phẩm đã xóa
        </button>
        {!showDeleted && canCreate() && (
          <button
            className="ml-auto px-4 py-2 bg-slate-500 text-white rounded-3xl font-medium"
            onClick={() => openModal("add")}
          >
            Thêm Sản Phẩm
          </button>
        )}
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full w-full bg-white rounded-md overflow-hidden border font-sans">
            <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase">
              <tr>
                <th className="py-3 px-4 text-left border-b">ID</th>
                <th className="py-3 px-4 text-left border-b">Tên Sản Phẩm</th>
                <th className="py-3 px-4 text-left border-b">Danh Mục</th>
                <th className="py-3 px-4 text-left border-b">Thương Hiệu</th>
                <th className="py-3 px-4 text-left border-b">Giá</th>
                <th className="py-3 px-4 text-center border-b">Trạng Thái</th>
                <th className="py-3 px-4 text-center border-b">Tồn Kho</th>
                <th className="py-3 px-4 text-center border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const { _id, name, category, brand, stockStatus, isActive } =
                  product;

                // Sử dụng variantSummary nếu có, nếu không thì fallback về price
                const priceRange = product.variantSummary?.priceRange || {
                  min: product.price || 0,
                  max: product.price || 0,
                };

                return (
                  <tr key={_id} className="hover:bg-gray-50 border-t">
                    <td className="px-4 py-3 text-sm">{_id}</td>
                    <td className="px-4 py-3 text-sm">{name}</td>
                    <td className="px-4 py-3 text-sm">
                      {typeof category === "string" ? category : category?.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {typeof brand === "string" ? brand : brand?.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {priceRange?.min && priceRange?.max
                        ? `${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()} VND`
                        : "0 VND"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!showDeleted && canToggleStatus() && (
                        <button
                          type="button"
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold focus:outline-none transition ${
                            isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => openActiveModal(product)}
                          title="Cập nhật trạng thái"
                        >
                          {isActive ? "Đang bán" : "Ẩn"}
                        </button>
                      )}
                      {!showDeleted && !canToggleStatus() && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isActive ? "Đang bán" : "Ẩn"}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-center select-none ${
                        canUpdate() ? "cursor-pointer" : ""
                      }`}
                      title={
                        !showDeleted && canUpdate()
                          ? "Nhấn để cập nhật trạng thái tồn kho"
                          : ""
                      }
                      onClick={() => {
                        if (!showDeleted && canUpdate())
                          handleUpdateStockStatus(product);
                      }}
                    >
                      {
                        {
                          in_stock: (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Còn hàng
                            </span>
                          ),
                          low_stock: (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Sắp hết hàng
                            </span>
                          ),
                          out_of_stock: (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Hết hàng
                            </span>
                          ),
                        }[stockStatus || "out_of_stock"]
                      }
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      {!showDeleted ? (
                        <>
                          {canUpdate() && (
                            <button
                              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                              onClick={() => openModal("edit", product)}
                            >
                              Sửa
                            </button>
                          )}
                          {canDelete() && (
                            <button
                              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                              onClick={() => openModal("delete", product)}
                            >
                              Xóa
                            </button>
                          )}
                          <button
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() => openModal("detail", product)}
                          >
                            Chi tiết
                          </button>
                        </>
                      ) : (
                        canUpdate() && (
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleRestore(product._id)}
                          >
                            Khôi phục
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddProduct handleClose={handleAddSuccess} />}

      {showEdit && selectedProduct && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-auto relative text-black">
            <button
              type="button"
              onClick={() => closeModal("edit")}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-300"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-8 text-center">Sửa Sản Phẩm</h2>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Nhập tên sản phẩm"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Nhập mô tả"
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Danh mục
                </label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-600">
                  Thương hiệu
                </label>
                <select
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              {editError && (
                <div className="text-red-500 text-sm mb-2">{editError}</div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => closeModal("edit")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && selectedProduct && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-auto relative text-black">
            <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>
            <p className="text-center mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm "{selectedProduct.name}"?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => closeModal("delete")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật trạng thái active */}
      {showActiveModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-4">
              Cập nhật trạng thái sản phẩm
            </h2>
            <form onSubmit={handleActiveSubmit}>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={activeForm.isActive}
                  onChange={(e) =>
                    setActiveForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                <label htmlFor="isActive">
                  {activeForm.isActive
                    ? "Đang bán (isActive = true)"
                    : "Ẩn (isActive = false)"}
                </label>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cascade"
                  checked={activeForm.cascade}
                  onChange={(e) =>
                    setActiveForm((f) => ({ ...f, cascade: e.target.checked }))
                  }
                />
                <label htmlFor="cascade">Cập nhật cho biến thể (cascade)</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => closeModal("active")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          handleClose={() => closeModal("detail")}
        />
      )}
    </div>
  );
};

export default ProductPage;
