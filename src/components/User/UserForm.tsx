import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiCamera,
  FiEdit3,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiStar,
  FiBell,
  FiShield,
  FiChevronDown,
  FiCheck,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { profileService, addressService } from "../../services/ProfileService";
import type {
  User as UserType,
  UserAddress,
  NotificationPreferences,
} from "../../types/user";

// Vietnam Address API types
interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

// Vietnam Address API
const vietnamAddressApi = {
  getProvinces: async (): Promise<Province[]> => {
    const res = await fetch("https://provinces.open-api.vn/api/p/");
    return res.json();
  },
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
    );
    const data = await res.json();
    return data.districts || [];
  },
  getWards: async (districtCode: number): Promise<Ward[]> => {
    const res = await fetch(
      `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
    );
    const data = await res.json();
    return data.wards || [];
  },
};

type TabType = "profile" | "addresses" | "notifications";
type GenderType = "male" | "female" | "other" | "";
type DropdownType = "province" | "district" | "ward" | "gender" | null;

const UserForm: React.FC = () => {
  // User state
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    gender: "" as GenderType,
    dateOfBirth: "",
  });

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    isDefault: false,
  });

  // Notification preferences (match BE schema)
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      emailNotifications: {
        orderUpdates: true,
      },
      inAppNotifications: true,
    });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Vietnam address dropdown states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [loadingAddress, setLoadingAddress] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Load user data
  useEffect(() => {
    fetchUserData();
    fetchProvinces();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressesRes] = await Promise.all([
        profileService.getProfile(),
        addressService.getAddresses(),
      ]);

      if (profileRes.data.success && profileRes.data.data) {
        const userData = profileRes.data.data;
        setUser(userData);

        const dob = userData.dateOfBirth
          ? typeof userData.dateOfBirth === "string"
            ? userData.dateOfBirth.split("T")[0]
            : new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "";

        setProfileForm({
          name: userData.name || "",
          phone: userData.phone || "",
          gender: (userData.gender as GenderType) || "",
          dateOfBirth: dob,
        });

        // Load notification preferences from user.preferences (BE schema structure)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prefs = (userData as any).preferences;
        if (prefs) {
          setNotificationPrefs({
            emailNotifications: {
              orderUpdates: prefs.emailNotifications?.orderUpdates ?? true,
            },
            inAppNotifications: prefs.inAppNotifications ?? true,
          });
        }
      }

      if (addressesRes.data.success && addressesRes.data.data) {
        setAddresses(addressesRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setLoadingAddress((prev) => ({ ...prev, provinces: true }));
      const data = await vietnamAddressApi.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoadingAddress((prev) => ({ ...prev, provinces: false }));
    }
  };

  const fetchDistricts = async (provinceCode: number) => {
    try {
      setLoadingAddress((prev) => ({ ...prev, districts: true }));
      const data = await vietnamAddressApi.getDistricts(provinceCode);
      setDistricts(data);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoadingAddress((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchWards = async (districtCode: number) => {
    try {
      setLoadingAddress((prev) => ({ ...prev, wards: true }));
      const data = await vietnamAddressApi.getWards(districtCode);
      setWards(data);
      setSelectedWard(null);
    } catch (error) {
      console.error("Error fetching wards:", error);
    } finally {
      setLoadingAddress((prev) => ({ ...prev, wards: false }));
    }
  };

  // Handle province selection
  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setAddressForm((prev) => ({
      ...prev,
      province: province.name,
      district: "",
      ward: "",
    }));
    fetchDistricts(province.code);
    setOpenDropdown(null);
  };

  // Handle district selection
  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setAddressForm((prev) => ({ ...prev, district: district.name, ward: "" }));
    fetchWards(district.code);
    setOpenDropdown(null);
  };

  // Handle ward selection
  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setAddressForm((prev) => ({ ...prev, ward: ward.name }));
    setOpenDropdown(null);
  };

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const res = await profileService.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        gender: profileForm.gender || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
      });

      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        setEditingProfile(false);
        toast.success("Cập nhật thông tin thành công");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await profileService.updateAvatar(formData);
      if (res.data.success && res.data.data) {
        setUser((prev) =>
          prev ? { ...prev, avatar: res.data.data?.avatar } : null
        );
        toast.success("Cập nhật ảnh đại diện thành công");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Không thể cập nhật ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async () => {
    try {
      setUploadingAvatar(true);
      const res = await profileService.deleteAvatar();
      if (res.data.success) {
        setUser((prev) => (prev ? { ...prev, avatar: undefined } : null));
        toast.success("Đã xóa ảnh đại diện");
      }
    } catch (error) {
      console.error("Delete avatar error:", error);
      toast.error("Không thể xóa ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Address operations
  const handleAddAddress = async () => {
    if (
      !addressForm.name ||
      !addressForm.phone ||
      !addressForm.province ||
      !addressForm.district ||
      !addressForm.ward ||
      !addressForm.detail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      setSaving(true);
      const res = await addressService.addAddress({
        name: addressForm.name,
        phone: addressForm.phone,
        province: addressForm.province,
        district: addressForm.district,
        ward: addressForm.ward,
        detail: addressForm.detail,
        isDefault: addressForm.isDefault,
      });

      if (res.data.success && res.data.data) {
        // Handle response - it could be address directly or in an object
        const newAddress =
          "address" in res.data.data ? res.data.data.address : res.data.data;
        setAddresses((prev) => [...prev, newAddress as UserAddress]);
        resetAddressForm();
        setAddingAddress(false);
        toast.success("Thêm địa chỉ thành công");
      }
    } catch (error) {
      console.error("Add address error:", error);
      toast.error("Không thể thêm địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    if (
      !addressForm.name ||
      !addressForm.phone ||
      !addressForm.province ||
      !addressForm.district ||
      !addressForm.ward ||
      !addressForm.detail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      setSaving(true);
      const res = await addressService.updateAddress(addressId, {
        name: addressForm.name,
        phone: addressForm.phone,
        province: addressForm.province,
        district: addressForm.district,
        ward: addressForm.ward,
        detail: addressForm.detail,
        isDefault: addressForm.isDefault,
      });

      if (res.data.success && res.data.data) {
        const updatedAddress =
          "address" in res.data.data ? res.data.data.address : res.data.data;
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === addressId ? (updatedAddress as UserAddress) : addr
          )
        );
        resetAddressForm();
        setEditingAddress(null);
        toast.success("Cập nhật địa chỉ thành công");
      }
    } catch (error) {
      console.error("Update address error:", error);
      toast.error("Không thể cập nhật địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      setLoadingAddresses(true);
      const res = await addressService.deleteAddress(addressId);
      if (res.data.success) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        toast.success("Xóa địa chỉ thành công");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("Không thể xóa địa chỉ");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setLoadingAddresses(true);
      const res = await addressService.setDefaultAddress(addressId);
      if (res.data.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr._id === addressId,
          }))
        );
        toast.success("Đã đặt làm địa chỉ mặc định");
      }
    } catch (error) {
      console.error("Set default address error:", error);
      toast.error("Không thể đặt địa chỉ mặc định");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      detail: "",
      isDefault: false,
    });
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  const startEditAddress = (address: UserAddress) => {
    setAddressForm({
      name: address.name,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address._id || null);
    // Find and set province/district/ward for existing address
    const province = provinces.find((p) => p.name === address.province);
    if (province) {
      setSelectedProvince(province);
      fetchDistricts(province.code);
    }
  };

  // Update notification preferences
  const handleUpdateNotifications = async () => {
    try {
      setSavingNotifications(true);
      const res = await profileService.updateNotificationPreferences(
        notificationPrefs
      );
      if (res.data.success) {
        toast.success("Cập nhật cài đặt thông báo thành công");
      }
    } catch (error) {
      console.error("Update notifications error:", error);
      toast.error("Không thể cập nhật cài đặt thông báo");
    } finally {
      setSavingNotifications(false);
    }
  };

  // Gender options
  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];

  // Get avatar URL
  const getAvatarUrl = (): string | null => {
    if (!user?.avatar) return null;
    return typeof user.avatar === "string" ? user.avatar : user.avatar.url;
  };

  // Format date for display
  const formatDateDisplay = (date: Date | string | undefined): string => {
    if (!date) return "Chưa cập nhật";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <FiAlertCircle className="w-12 h-12 mb-4" />
        <p>Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {[
          {
            id: "profile" as TabType,
            label: "Thông tin cá nhân",
            icon: FiUser,
          },
          { id: "addresses" as TabType, label: "Địa chỉ", icon: FiMapPin },
          { id: "notifications" as TabType, label: "Thông báo", icon: FiBell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Avatar Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Ảnh đại diện
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiUser className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <FiLoader className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <FiCamera className="w-4 h-4" />
                    Thay đổi ảnh
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={uploadingAvatar}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông tin cơ bản
                </h3>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        const dob = user.dateOfBirth
                          ? typeof user.dateOfBirth === "string"
                            ? user.dateOfBirth.split("T")[0]
                            : new Date(user.dateOfBirth)
                                .toISOString()
                                .split("T")[0]
                          : "";
                        setProfileForm({
                          name: user.name || "",
                          phone: user.phone || "",
                          gender: (user.gender as GenderType) || "",
                          dateOfBirth: dob,
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      Hủy
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      Lưu
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="w-4 h-4 inline mr-2" />
                    Họ và tên
                  </label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.name || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <FiShield className="w-3 h-3" />
                        Đã xác minh
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="w-4 h-4 inline mr-2" />
                    Số điện thoại
                  </label>
                  {editingProfile ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.phone || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {editingProfile ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "gender" ? null : "gender"
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                      >
                        <span
                          className={
                            profileForm.gender
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {profileForm.gender
                            ? genderOptions.find(
                                (g) => g.value === profileForm.gender
                              )?.label
                            : "Chọn giới tính"}
                        </span>
                        <FiChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            openDropdown === "gender" ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdown === "gender" && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {genderOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setProfileForm((prev) => ({
                                  ...prev,
                                  gender: option.value as GenderType,
                                }));
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              {option.label}
                              {profileForm.gender === option.value && (
                                <FiCheck className="w-4 h-4 text-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.gender
                        ? genderOptions.find((g) => g.value === user.gender)
                            ?.label
                        : "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="w-4 h-4 inline mr-2" />
                    Ngày sinh
                  </label>
                  {editingProfile ? (
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formatDateDisplay(user.dateOfBirth)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Add Address Button */}
            {!addingAddress && !editingAddress && (
              <button
                onClick={() => {
                  resetAddressForm();
                  setAddingAddress(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Thêm địa chỉ mới
              </button>
            )}

            {/* Add/Edit Address Form */}
            {(addingAddress || editingAddress) && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {addingAddress ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên người nhận
                    </label>
                    <input
                      type="text"
                      value={addressForm.name}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "province" ? null : "province"
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                      >
                        <span
                          className={
                            addressForm.province
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {addressForm.province || "Chọn Tỉnh/Thành phố"}
                        </span>
                        {loadingAddress.provinces ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              openDropdown === "province" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {openDropdown === "province" && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {provinces.map((province) => (
                            <button
                              key={province.code}
                              type="button"
                              onClick={() => handleProvinceSelect(province)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              {province.name}
                              {selectedProvince?.code === province.code && (
                                <FiCheck className="w-4 h-4 text-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "district" ? null : "district"
                          )
                        }
                        disabled={!selectedProvince}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span
                          className={
                            addressForm.district
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {addressForm.district || "Chọn Quận/Huyện"}
                        </span>
                        {loadingAddress.districts ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              openDropdown === "district" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {openDropdown === "district" && districts.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {districts.map((district) => (
                            <button
                              key={district.code}
                              type="button"
                              onClick={() => handleDistrictSelect(district)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              {district.name}
                              {selectedDistrict?.code === district.code && (
                                <FiCheck className="w-4 h-4 text-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ward */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "ward" ? null : "ward"
                          )
                        }
                        disabled={!selectedDistrict}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span
                          className={
                            addressForm.ward ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {addressForm.ward || "Chọn Phường/Xã"}
                        </span>
                        {loadingAddress.wards ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform ${
                              openDropdown === "ward" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {openDropdown === "ward" && wards.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {wards.map((ward) => (
                            <button
                              key={ward.code}
                              type="button"
                              onClick={() => handleWardSelect(ward)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              {ward.name}
                              {selectedWard?.code === ward.code && (
                                <FiCheck className="w-4 h-4 text-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      value={addressForm.detail}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          detail: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>

                  {/* Default checkbox */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            isDefault: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">
                        Đặt làm địa chỉ mặc định
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setAddingAddress(false);
                      setEditingAddress(null);
                      resetAddressForm();
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() =>
                      editingAddress
                        ? handleUpdateAddress(editingAddress)
                        : handleAddAddress()
                    }
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {addresses.length === 0 && !addingAddress ? (
                <div className="text-center py-12 text-gray-500">
                  <FiMapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có địa chỉ nào</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`bg-white border rounded-xl p-6 transition-all ${
                      address.isDefault
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {address.name}
                          </h4>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-black text-white text-xs font-medium rounded-full">
                              <FiStar className="w-3 h-3" />
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {address.detail}, {address.ward}, {address.district},{" "}
                          {address.province}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!address.isDefault && address._id && (
                          <button
                            onClick={() =>
                              handleSetDefaultAddress(address._id!)
                            }
                            disabled={loadingAddresses}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Đặt làm mặc định"
                          >
                            <FiStar className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEditAddress(address)}
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FiEdit3 className="w-5 h-5" />
                        </button>
                        {address._id && (
                          <button
                            onClick={() => handleDeleteAddress(address._id!)}
                            disabled={loadingAddresses}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Cài đặt thông báo
              </h3>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Thông báo qua Email
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">
                          Cập nhật đơn hàng
                        </p>
                        <p className="text-sm text-gray-500">
                          Nhận email khi đơn hàng có thay đổi (xác nhận, đang
                          giao, đã giao, hủy, đổi hàng, trả hàng)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          notificationPrefs.emailNotifications?.orderUpdates ??
                          true
                        }
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            emailNotifications: {
                              ...prev.emailNotifications,
                              orderUpdates: e.target.checked,
                            },
                          }))
                        }
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </label>
                  </div>
                </div>

                {/* In-App Notifications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Thông báo trong ứng dụng
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">
                          Thông báo trong app
                        </p>
                        <p className="text-sm text-gray-500">
                          Nhận thông báo trực tiếp trong ứng dụng
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.inAppNotifications ?? true}
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            inAppNotifications: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleUpdateNotifications}
                  disabled={savingNotifications}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {savingNotifications ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserForm;
