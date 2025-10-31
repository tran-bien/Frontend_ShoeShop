import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { inforApi } from "../../services/InforService";
import Cookie from "js-cookie";
import type { User, UserAddress } from "../../types/user";

// Alias for better semantics
type Address = UserAddress;

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    name: "",
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    addressDetail: "",
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
        const res = await inforApi.getProfile();
        setUser(res.data.user);
        setEditName(res.data.user.name);
      } catch {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("avatar", e.target.files[0]);
      await inforApi.updateAvatar(formData);
      const res = await inforApi.getProfile();
      setUser(res.data.user);
      setEditName(res.data.user.name);
    }
  };

  // Xóa avatar
  const handleDeleteAvatar = async () => {
    await inforApi.deleteAvatar();
    const res = await inforApi.getProfile();
    setUser(res.data.user);
    setEditName(res.data.user.name);
  };

  // Cập nhật tên người dùng
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    await inforApi.updateProfile({ name: editName });
    const res = await inforApi.getProfile();
    setUser(res.data.user);
    setEditName(res.data.user.name);
    setIsEditingName(false);
  };

  const handleUpdateAddress = async (addr: Address) => {
    if (!addr._id) return;
    await inforApi.updateAddress(addr._id, {
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      addressDetail: addr.addressDetail,
      isDefault: addr.isDefault,
    });
    const res = await inforApi.getProfile();
    setUser(res.data.user);
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await inforApi.addAddress({
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      province: newAddress.province,
      district: newAddress.district,
      ward: newAddress.ward,
      addressDetail: newAddress.addressDetail,
      isDefault: newAddress.isDefault,
    });
    setIsAddModalOpen(false);
    setNewAddress({
      name: "",
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detail: "",
      addressDetail: "",
      isDefault: false,
      _id: "",
    });
    const res = await inforApi.getProfile();
    setUser(res.data.user);
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId: string) => {
    await inforApi.deleteAddress(addressId);
    const res = await inforApi.getProfile();
    setUser(res.data.user);
  };

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-3 text-mono-800">
        Thông tin tài khoản
      </h2>

      <div className="flex flex-col items-center mb-4">
        <div className="relative mb-2 group">
          <img
            src={
              user.avatar?.url ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user.name)
            }
            alt="avatar"
            className="w-24 h-24 rounded-full border object-cover cursor-pointer group-hover:opacity-80 transition"
            onClick={() => document.getElementById("avatarInput")?.click()}
            title="Nhấn để đổi ảnh đại diện"
          />
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button
            onClick={handleDeleteAvatar}
            className="absolute right-0 bottom-0 bg-mono-800 text-white rounded-full px-2 py-1 text-xs shadow hover:bg-mono-900"
            title="Xóa avatar"
            type="button"
          >
            X
          </button>
        </div>
        {/* Form cập nhật tên */}
        {isEditingName ? (
          <form
            onSubmit={handleUpdateName}
            className="flex items-center gap-2 mb-2"
          >
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border px-2 py-1 rounded"
              autoFocus
            />
            <button
              type="submit"
              className="bg-mono-500 text-white px-3 py-1 rounded text-sm"
            >
              Lưu tên
            </button>
            <button
              type="button"
              className="bg-mono-300 px-3 py-1 rounded text-sm"
              onClick={() => {
                setEditName(user.name);
                setIsEditingName(false);
              }}
            >
              Hủy
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-lg">{user.name}</span>
            <button
              type="button"
              className="bg-mono-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => setIsEditingName(true)}
            >
              Sửa
            </button>
          </div>
        )}
        <div className="text-mono-500">{user.email}</div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Địa chỉ:</h3>
          <button
            className="bg-mono-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm địa chỉ
          </button>
        </div>
        {user.addresses && user.addresses.length > 0 ? (
          <ul className="space-y-2">
            {user.addresses.map((addr) => (
              <li
                key={addr._id}
                className={`border rounded p-2 ${
                  addr.isDefault ? "border-mono-700" : "border-mono-300"
                }`}
              >
                <div>
                  <span className="font-semibold">{addr.fullName}</span> -{" "}
                  {addr.phone}
                </div>
                <div>
                  {addr.addressDetail}, {addr.ward}, {addr.district},{" "}
                  {addr.province}
                </div>
                {addr.isDefault && (
                  <span className="text-mono-800 text-xs font-semibold">
                    [Mặc định]
                  </span>
                )}
                <button
                  className="ml-2 text-mono-500 text-xs"
                  onClick={() => {
                    setEditingAddress(addr);
                    setIsModalOpen(true);
                  }}
                >
                  Sửa
                </button>
                <button
                  className="ml-2 text-mono-800 text-xs"
                  onClick={() => addr._id && handleDeleteAddress(addr._id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-mono-500">Chưa có địa chỉ nào.</div>
        )}
      </div>

      {/* Modal chỉnh sửa địa chỉ */}
      {isModalOpen && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa địa chỉ</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingAddress) {
                  await handleUpdateAddress(editingAddress);
                  setIsModalOpen(false);
                }
              }}
              className="space-y-2"
            >
              {[
                "fullName",
                "phone",
                "province",
                "district",
                "ward",
                "addressDetail",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={String(
                    (editingAddress as Address)[field as keyof Address] || ""
                  )}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress!,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              ))}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingAddress.isDefault}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <span>Đặt làm mặc định</span>
              </label>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 bg-mono-300 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-mono-black text-white rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm địa chỉ mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Thêm địa chỉ mới</h3>
            <form onSubmit={handleAddAddress} className="space-y-2">
              {[
                "fullName",
                "phone",
                "province",
                "district",
                "ward",
                "addressDetail",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={String(
                    (newAddress as Address)[field as keyof Address] || ""
                  )}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              ))}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <span>Đặt làm mặc định</span>
              </label>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1 bg-mono-300 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-mono-black text-white rounded"
                >
                  Thêm
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
