import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService, addressService } from "../../services/ProfileService";
import Cookie from "js-cookie";
import type { User, UserAddress } from "../../types/user";
import {
  FiCamera,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMapPin,
  FiCheck,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

// Alias for better semantics
type Address = UserAddress;

// Field labels for address form
const fieldLabels: Record<string, string> = {
  name: "Họ và tên",
  phone: "Số điện thoại",
  province: "Tính/Thành phố",
  district: "Quận/Huyện",
  ward: "Phường/Xã",
  detail: "Ð?a chờ chi tiết",
};

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    isDefault: false,
    _id: "",
  });
  const [editName, setEditName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || Cookie.get("token");
    if (!token || token === "null" || token === "undefined") {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileService.getProfile();
        setUser(res.data.data);
        setEditName(res.data.data.name);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("avatar", e.target.files[0]);
        await profileService.updateAvatar(formData);
        const res = await profileService.getProfile();
        setUser(res.data.data);
        setEditName(res.data.data.name);
        toast.success("Cập nhật ẩnh đổi diẩn thành công");
      } catch {
        toast.error("Không thể cập nhật ẩnh đổi diẩn");
      } finally {
        setLoading(false);
      }
    }
  };

  // Xóa avatar
  const handleDeleteAvatar = async () => {
    try {
      setLoading(true);
      await profileService.deleteAvatar();
      const res = await profileService.getProfile();
      setUser(res.data.data);
      setEditName(res.data.data.name);
      toast.success("Ðã xóa ẩnh đổi diẩn");
    } catch {
      toast.error("Không thể xóa ẩnh đổi diẩn");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật tên người dùng
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await profileService.updateProfile({ name: editName });
      const res = await profileService.getProfile();
      setUser(res.data.data);
      setEditName(res.data.data.name);
      setIsEditingName(false);
      toast.success("Cập nhật tên thành công");
    } catch {
      toast.error("Không thể cập nhật tên");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (addr: Address) => {
    if (!addr._id) return;
    try {
      setLoading(true);
      await addressService.updateAddress(addr._id, {
        name: addr.name,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        detail: addr.detail,
        isDefault: addr.isDefault,
      });
      const res = await profileService.getProfile();
      setUser(res.data.data);
      toast.success("Cập nhật địa chỉ thành công");
    } catch {
      toast.error("Không thể cập nhật địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addressService.addAddress({
        name: newAddress.name,
        phone: newAddress.phone,
        province: newAddress.province,
        district: newAddress.district,
        ward: newAddress.ward,
        detail: newAddress.detail,
        isDefault: newAddress.isDefault,
      });
      setIsAddModalOpen(false);
      setNewAddress({
        name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        detail: "",
        isDefault: false,
        _id: "",
      });
      const res = await profileService.getProfile();
      setUser(res.data.data);
      toast.success("Thêm địa chỉ thành công");
    } catch {
      toast.error("Không thể thêm địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      await addressService.deleteAddress(addressId);
      const res = await profileService.getProfile();
      setUser(res.data.data);
      toast.success("Ðã xóa địa chỉ");
    } catch {
      toast.error("Không thể xóa địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-mono-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-mono-100 w-full max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-mono-800 to-mono-black p-6">
        <h2 className="text-2xl font-bold text-white">Thông tin tài khoẩn</h2>
        <p className="text-mono-300 mt-1">Quận lý thông tin cá nhân của bẩn</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Avatar & Name Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-mono-100">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={
                user.avatar?.url ||
                "https://ui-avatars.com/api/ẩname=" +
                  encodeURIComponent(user.name) +
                  "&background=171717&color=fff"
              }
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-mono-100 object-cover shadow-md"
            />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => document.getElementById("avatarInput")?.click()}
                className="p-2 bg-white rounded-full text-mono-800 hover:bg-mono-100 transition-colors"
                title="Ð?i ẩnh"
                disabled={loading}
              >
                <FiCamera size={18} />
              </button>
              {user.avatar?.url && (
                <button
                  onClick={handleDeleteAvatar}
                  className="p-2 bg-white rounded-full text-mono-700 hover:bg-mono-100 transition-colors"
                  title="Xóa ẩnh"
                  disabled={loading}
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name & Email */}
          <div className="flex-1 text-center sm:text-left">
            {isEditingName ? (
              <form
                onSubmit={handleUpdateName}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-mono-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mono-black text-lg font-semibold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 bg-mono-black text-white rounded-xl hover:bg-mono-800 transition-colors"
                  disabled={loading}
                >
                  <FiCheck size={20} />
                </button>
                <button
                  type="button"
                  className="p-2 bg-mono-100 text-mono-600 rounded-xl hover:bg-mono-200 transition-colors"
                  onClick={() => {
                    setEditName(user.name);
                    setIsEditingName(false);
                  }}
                >
                  <FiX size={20} />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-2xl font-bold text-mono-900">
                  {user.name}
                </h3>
                <button
                  type="button"
                  className="p-1.5 text-mono-500 hover:text-mono-800 hover:bg-mono-100 rounded-lg transition-colors"
                  onClick={() => setIsEditingName(true)}
                >
                  <FiEdit2 size={16} />
                </button>
              </div>
            )}
            <p className="text-mono-500 mt-1">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-2 px-3 py-1 bg-mono-100 text-mono-700 text-sm rounded-full capitalize">
                {user.role === "admin"
                  ? "Quận trở viên"
                  : user.role === "staff"
                  ? "Nhân viên"
                  : "Khách hàng"}
              </span>
            )}
          </div>
        </div>

        {/* Addresses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-mono-700" size={20} />
              <h3 className="text-lg font-semibold text-mono-900">
                Ð?a chờ của tôi
              </h3>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-mono-black text-white rounded-xl hover:bg-mono-800 transition-colors text-sm font-medium"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus size={16} />
              Thêm địa chỉ
            </button>
          </div>

          {user.addresses && user.addresses.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    addr.isDefault
                      ? "border-mono-800 bg-mono-50"
                      : "border-mono-200 hover:border-mono-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-mono-900">
                          {addr.name}
                        </span>
                        <span className="text-mono-400">|</span>
                        <span className="text-mono-600">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-mono-800 text-white text-xs rounded-full">
                            M?c đếnh
                          </span>
                        )}
                      </div>
                      <p className="text-mono-600 text-sm">
                        {addr.detail}, {addr.ward}, {addr.district},{" "}
                        {addr.province}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        className="p-2 text-mono-500 hover:text-mono-800 hover:bg-mono-100 rounded-lg transition-colors"
                        onClick={() => {
                          setEditingAddress(addr);
                          setIsModalOpen(true);
                        }}
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className="p-2 text-mono-500 hover:text-mono-700 hover:bg-mono-100 rounded-lg transition-colors"
                        onClick={() =>
                          addr._id && handleDeleteAddress(addr._id)
                        }
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-mono-50 rounded-xl">
              <FiMapPin className="mx-auto text-mono-300 mb-2" size={40} />
              <p className="text-mono-500">Bẩn chua có địa chỉ nào</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 text-mono-800 hover:text-mono-black font-medium"
              >
                Thêm địa chỉ đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal chơnh sửa địa chỉ */}
      {isModalOpen && editingAddress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-mono-100">
              <h3 className="text-xl font-bold text-mono-900">
                Chơnh sửa địa chỉ
              </h3>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingAddress) {
                  await handleUpdateAddress(editingAddress);
                  setIsModalOpen(false);
                }
              }}
              className="p-6 space-y-4"
            >
              {Object.keys(fieldLabels).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    {fieldLabels[field]}
                  </label>
                  <input
                    type="text"
                    placeholder={fieldLabels[field]}
                    value={String(
                      (editingAddress as Address)[field as keyof Address] || ""
                    )}
                    onChange={(e) =>
                      setEditingAddress({
                        ...editingAddress!,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-mono-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mono-black transition-all"
                  />
                </div>
              ))}
              <label className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={editingAddress.isDefault}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-mono-300 text-mono-black focus:ring-mono-black"
                />
                <span className="text-mono-700">Ð?t làm địa chỉ m?c đếnh</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-mono-200 text-mono-700 rounded-xl hover:bg-mono-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-mono-black text-white rounded-xl hover:bg-mono-800 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Ðang luu..." : "Luu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm địa chỉ mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-mono-100">
              <h3 className="text-xl font-bold text-mono-900">
                Thêm địa chỉ mới
              </h3>
            </div>
            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              {Object.keys(fieldLabels).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    {fieldLabels[field]}
                  </label>
                  <input
                    type="text"
                    placeholder={fieldLabels[field]}
                    value={String(
                      (newAddress as Address)[field as keyof Address] || ""
                    )}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-mono-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mono-black transition-all"
                  />
                </div>
              ))}
              <label className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-mono-300 text-mono-black focus:ring-mono-black"
                />
                <span className="text-mono-700">Ð?t làm địa chỉ m?c đếnh</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-mono-200 text-mono-700 rounded-xl hover:bg-mono-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-mono-black text-white rounded-xl hover:bg-mono-800 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Ðang thêm..." : "Thêm địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;


