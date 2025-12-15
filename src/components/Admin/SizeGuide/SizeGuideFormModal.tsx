import { useState, useEffect, useRef } from "react";
import { adminSizeGuideService } from "../../../services/SizeGuideService";
import { sizeGuideImageService } from "../../../services/ImageService";
import { productAdminService } from "../../../services/ProductService";
import type {
  LegacySizeGuide,
  CreateSizeGuideData,
} from "../../../types/sizeGuide";
import type { Product } from "../../../types/product";
import toast from "react-hot-toast";
import { XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface SizeGuideFormModalProps {
  sizeGuide: LegacySizeGuide | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SizeGuideFormModal: React.FC<SizeGuideFormModalProps> = ({
  sizeGuide,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);
  const [uploadingMeasurement, setUploadingMeasurement] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const sizeChartInputRef = useRef<HTMLInputElement>(null);
  const measurementInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CreateSizeGuideData>({
    productId: sizeGuide?.product?._id || "",
    sizeChart: {
      description: sizeGuide?.sizeChart?.description || "",
      image: sizeGuide?.sizeChart?.image,
    },
    measurementGuide: {
      description: sizeGuide?.measurementGuide?.description || "",
      image: sizeGuide?.measurementGuide?.image,
    },
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await productAdminService.getProducts({});
        setProducts(data.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle upload size chart image
  const handleUploadSizeChartImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB");
      return;
    }

    // If editing existing size guide, upload directly
    if (sizeGuide) {
      setUploadingSizeChart(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("sizeChart", file);
        const response = await sizeGuideImageService.uploadSizeChartImage(
          sizeGuide._id,
          formDataUpload
        );
        setFormData({
          ...formData,
          sizeChart: {
            ...formData.sizeChart,
            image: response.data.sizeGuide?.sizeChart?.image || {
              url: response.data.url || "",
              public_id: response.data.public_id || "",
            },
          },
        });
        toast.success("Tải ảnh size chart thành công");
      } catch (error) {
        console.error("Failed to upload size chart image:", error);
        toast.error("Không thể tải ảnh lên");
      } finally {
        setUploadingSizeChart(false);
      }
    } else {
      // For new size guide, show preview with local URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        sizeChart: {
          ...formData.sizeChart,
          image: { url: previewUrl, public_id: "" },
        },
      });
      toast.success(
        "Ảnh sẽ được tải lên sau khi tạo Size Guide. Vui lòng tạo Size Guide trước."
      );
    }
    // Reset input
    if (sizeChartInputRef.current) {
      sizeChartInputRef.current.value = "";
    }
  };

  // Handle upload measurement guide image
  const handleUploadMeasurementImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB");
      return;
    }

    // If editing existing size guide, upload directly
    if (sizeGuide) {
      setUploadingMeasurement(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("measurementGuide", file);
        const response =
          await sizeGuideImageService.uploadMeasurementGuideImage(
            sizeGuide._id,
            formDataUpload
          );
        setFormData({
          ...formData,
          measurementGuide: {
            ...formData.measurementGuide,
            image: response.data.sizeGuide?.measurementGuide?.image || {
              url: response.data.url || "",
              public_id: response.data.public_id || "",
            },
          },
        });
        toast.success("Tải ảnh hướng dẫn đo thành công");
      } catch (error) {
        console.error("Failed to upload measurement guide image:", error);
        toast.error("Không thể tải ảnh lên");
      } finally {
        setUploadingMeasurement(false);
      }
    } else {
      // For new size guide, show preview with local URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        measurementGuide: {
          ...formData.measurementGuide,
          image: { url: previewUrl, public_id: "" },
        },
      });
      toast.success(
        "Ảnh sẽ được tải lên sau khi tạo Size Guide. Vui lòng tạo Size Guide trước."
      );
    }
    // Reset input
    if (measurementInputRef.current) {
      measurementInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    if (
      !formData.sizeChart.description &&
      !formData.measurementGuide.description
    ) {
      toast.error("Vui lòng nhập ít nhất một mô tả");
      return;
    }

    setLoading(true);
    try {
      if (sizeGuide) {
        await adminSizeGuideService.updateSizeGuide(sizeGuide._id, formData);
        toast.success("Cập nhật size guide thành công");
      } else {
        await adminSizeGuideService.createSizeGuide(formData);
        toast.success("Tạo size guide thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save size guide:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Không thể lưu size guide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mono-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-mono-black">
            {sizeGuide ? "Cập nhật Size Guide" : "Tạo Size Guide Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-mono-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Sản phẩm <span className="text-mono-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              required
              disabled={!!sizeGuide}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {sizeGuide && (
              <p className="text-xs text-mono-500 mt-1">
                Không thể thay đổi sản phẩm khi cập nhật
              </p>
            )}
          </div>

          {/* Size Chart Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-mono-black flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Bảng size
            </h3>

            {/* Size Chart Image URL */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Hình ảnh bảng size
              </label>
              {/* Image preview */}
              {formData.sizeChart.image?.url ? (
                <div className="relative">
                  <img
                    src={formData.sizeChart.image.url}
                    alt="Size chart preview"
                    className="w-full h-48 object-contain bg-mono-50 rounded-lg border border-mono-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sizeChart: { ...formData.sizeChart, image: undefined },
                      })
                    }
                    className="absolute top-2 right-2 p-1 bg-mono-1000 text-white rounded-full hover:bg-mono-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-full h-48 border-2 border-dashed border-mono-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-mono-500 hover:bg-mono-50 transition-colors"
                  onClick={() => sizeChartInputRef.current?.click()}
                >
                  {uploadingSizeChart ? (
                    <>
                      <svg
                        className="animate-spin h-8 w-8 text-mono-500 mb-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-sm text-mono-500">
                        Đang tải lên...
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-8 h-8 text-mono-400 mb-2" />
                      <span className="text-sm text-mono-500">
                        Nhấp để tải ảnh lên
                      </span>
                      <span className="text-xs text-mono-400 mt-1">
                        PNG, JPG tối đa 5MB
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={sizeChartInputRef}
                accept="image/*"
                onChange={handleUploadSizeChartImage}
                className="hidden"
              />
            </div>

            {/* Size Chart Description */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Mô tả bảng size
              </label>
              <textarea
                value={formData.sizeChart.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizeChart: {
                      ...formData.sizeChart,
                      description: e.target.value,
                    },
                  })
                }
                rows={4}
                placeholder="Mô tả chi tiết về bảng size này..."
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              />
            </div>
          </div>

          {/* Measurement Guide Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-mono-black flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Hướng dẫn đo
            </h3>

            {/* Measurement Guide Image URL */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Hình ảnh hướng dẫn đo
              </label>
              {/* Image preview */}
              {formData.measurementGuide.image?.url ? (
                <div className="relative">
                  <img
                    src={formData.measurementGuide.image.url}
                    alt="Measurement guide preview"
                    className="w-full h-48 object-contain bg-mono-50 rounded-lg border border-mono-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        measurementGuide: {
                          ...formData.measurementGuide,
                          image: undefined,
                        },
                      })
                    }
                    className="absolute top-2 right-2 p-1 bg-mono-1000 text-white rounded-full hover:bg-mono-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-full h-48 border-2 border-dashed border-mono-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-mono-500 hover:bg-mono-50 transition-colors"
                  onClick={() => measurementInputRef.current?.click()}
                >
                  {uploadingMeasurement ? (
                    <>
                      <svg
                        className="animate-spin h-8 w-8 text-mono-500 mb-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-sm text-mono-500">
                        Đang tải lên...
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-8 h-8 text-mono-400 mb-2" />
                      <span className="text-sm text-mono-500">
                        Nhấp để tải ảnh lên
                      </span>
                      <span className="text-xs text-mono-400 mt-1">
                        PNG, JPG tối đa 5MB
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={measurementInputRef}
                accept="image/*"
                onChange={handleUploadMeasurementImage}
                className="hidden"
              />
            </div>

            {/* Measurement Guide Description */}
            <div>
              <label className="block text-sm font-medium text-mono-700 mb-2">
                Mô tả hướng dẫn đo
              </label>
              <textarea
                value={formData.measurementGuide.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    measurementGuide: {
                      ...formData.measurementGuide,
                      description: e.target.value,
                    },
                  })
                }
                rows={4}
                placeholder="Hướng dẫn chi tiết cách đo chân để chọn size phù hợp..."
                className="w-full px-4 py-2 border border-mono-200 rounded-lg focus:outline-none focus:border-mono-black"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-mono-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-mono-700 bg-mono-100 rounded-lg hover:bg-mono-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-mono-black rounded-lg hover:bg-mono-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : sizeGuide ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SizeGuideFormModal;
