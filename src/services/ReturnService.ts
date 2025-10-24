import axios from "axios";
import type { CreateReturnRequestData } from "../types/return";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface GetReturnRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: "RETURN" | "EXCHANGE";
  customerId?: string;
}

export interface ApproveReturnData {
  note?: string;
}

export interface RejectReturnData {
  reason: string;
}

export interface ProcessReturnData {
  note?: string;
}

class ReturnService {
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Customer APIs
  async createReturnRequest(data: CreateReturnRequestData) {
    const response = await axios.post(
      `${API_URL}/returns`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getReturnRequests(params: GetReturnRequestsParams = {}) {
    const response = await axios.get(`${API_URL}/returns`, {
      ...this.getAuthHeader(),
      params,
    });
    return response.data;
  }

  async getReturnRequestDetail(id: string) {
    const response = await axios.get(
      `${API_URL}/returns/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async cancelReturnRequest(id: string) {
    const response = await axios.delete(
      `${API_URL}/returns/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // Admin APIs
  async approveReturnRequest(id: string, data: ApproveReturnData = {}) {
    const response = await axios.patch(
      `${API_URL}/returns/${id}/approve`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async rejectReturnRequest(id: string, data: RejectReturnData) {
    const response = await axios.patch(
      `${API_URL}/returns/${id}/reject`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async processReturn(id: string, data: ProcessReturnData = {}) {
    const response = await axios.post(
      `${API_URL}/returns/${id}/process-return`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async processExchange(id: string, data: ProcessReturnData = {}) {
    const response = await axios.post(
      `${API_URL}/returns/${id}/process-exchange`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getReturnStats() {
    const response = await axios.get(
      `${API_URL}/returns/stats/summary`,
      this.getAuthHeader()
    );
    return response.data;
  }
}

export default new ReturnService();
