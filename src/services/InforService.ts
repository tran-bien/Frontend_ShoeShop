import { axiosInstanceAuth } from "../utils/axiosIntance";

export const inforApi = {
  getProfile: () => axiosInstanceAuth.get("/api/v1/users/Profile"),

  // Cập nhật thông tin người dùng
  updateProfile: (data: any) =>
    axiosInstanceAuth.put("/api/v1/users/Profile", data),
  // Cập nhật avatar (form-data)
  updateAvatar: (formData: FormData) =>
    axiosInstanceAuth.post("/api/v1/images/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Xóa avatar
  deleteAvatar: () => axiosInstanceAuth.delete("/api/v1/images/avatar"),

  // Thêm địa chỉ mới
  addAddress: (data: any) =>
    axiosInstanceAuth.post("/api/v1/users/addresses", data),

  // Cập nhật địa chỉ
  updateAddress: (addressId: string, data: any) =>
    axiosInstanceAuth.put(`/api/v1/users/addresses/${addressId}`, data),

  // Xóa địa chỉ
  deleteAddress: (addressId: string) =>
    axiosInstanceAuth.delete(`/api/v1/users/addresses/${addressId}`),
};
