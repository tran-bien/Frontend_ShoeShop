import { useState, useEffect } from "react";
import { brandImageService } from "../../../services/ImageService";
import { adminBrandService } from "../../../services/BrandService";

const BrandLogoManager = ({ brandId, reloadBrand }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logo, setLogo] = useState<any>(null);

  const fetchBrandLogo = async () => {
    const res = await adminBrandService.getById(brandId);
    setLogo(res.data.brand?.logo ?? res.data.data?.logo ?? null);
  };

  useEffect(() => {
    fetchBrandLogo();
  }, [brandId]);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn một ảnh!");
      return;
    }
    const formData = new FormData();
    formData.append("logo", selectedFile);
    await brandImageService.uploadLogo(brandId, formData);
    setSelectedFile(null);
    await fetchBrandLogo();
    reloadBrand();
  };

  const handleRemove = async () => {
    await brandImageService.removeLogo(brandId);
    await fetchBrandLogo();
    reloadBrand();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-black">
      <h3 className="text-lg font-bold mb-4">Quản Lý Logo Thương Hiệu</h3>
      <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          name="logo"
          onChange={(e) =>
            setSelectedFile(e.target.files ? e.target.files[0] : null)
          }
          className="block border border-mono-300 rounded px-2 py-1 text-sm"
        />
        <button
          onClick={handleUpload}
          className="bg-mono-500 text-white px-3 py-1 rounded-full hover:bg-mono-black transition text-xs"
        >
          Tại Lên
        </button>
      </div>
      {logo?.url && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <img
            src={logo.url}
            alt="logo"
            className="h-24 w-24 object-contain border rounded"
          />
          <button
            onClick={handleRemove}
            className="bg-mono-800 hover:bg-mono-900 text-white px-3 py-1 rounded-full transition text-xs"
          >
            Xóa
          </button>
        </div>
      )}
      {!logo?.url && (
        <div className="text-mono-400 text-sm text-center mt-2">
          Chưa có logo
        </div>
      )}
    </div>
  );
};

export default BrandLogoManager;

