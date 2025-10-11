import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Shipper {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  shipper: {
    isAvailable: boolean;
    activeOrders: number;
    maxOrders: number;
    currentLocation?: {
      latitude: number;
      longitude: number;
      updatedAt: string;
    };
    deliveryStats: {
      totalDeliveries: number;
      successfulDeliveries: number;
      failedDeliveries: number;
    };
  };
}

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  status: "out_for_delivery" | "delivery_failed" | "delivered";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  note?: string;
}

export interface AssignOrderData {
  shipperId: string;
}

export interface UpdateDeliveryStatusData {
  status: "out_for_delivery" | "delivery_failed" | "delivered";
  note?: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
}

class ShipperService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // ADMIN APIs
  async getShippers(available?: boolean) {
    const params = available !== undefined ? { available } : {};
    const response = await axios.get(`${API_URL}/shipper/list`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data;
  }

  async assignOrderToShipper(orderId: string, data: AssignOrderData) {
    const response = await axios.post(
      `${API_URL}/shipper/assign/${orderId}`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getShipperStats(shipperId: string) {
    const response = await axios.get(
      `${API_URL}/shipper/stats/${shipperId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getShipperDetail(shipperId: string) {
    const response = await axios.get(
      `${API_URL}/shipper/detail/${shipperId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // SHIPPER APIs
  async getMyOrders(status?: string) {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_URL}/shipper/my-orders`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data;
  }

  async updateDeliveryStatus(orderId: string, data: UpdateDeliveryStatusData) {
    const response = await axios.patch(
      `${API_URL}/shipper/delivery-status/${orderId}`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateLocation(data: UpdateLocationData) {
    const response = await axios.patch(
      `${API_URL}/shipper/location`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateAvailability(isAvailable: boolean) {
    const response = await axios.patch(
      `${API_URL}/shipper/availability`,
      { isAvailable },
      this.getAuthHeader()
    );
    return response.data;
  }
}

export default new ShipperService();
