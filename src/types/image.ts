/**
 * Image Types
 * Định nghĩa các interface liên quan đến Image/Media
 */

// =======================
// IMAGE TYPES
// =======================

export interface Image {
  _id: string;
  url: string;
  publicId: string;
  displayOrder?: number;
  isMain?: boolean;
  alt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageOrder {
  _id: string;
  displayOrder: number;
}

// =======================
// UPLOAD TYPES
// =======================

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    images?: Image[];
    image?: Image;
    logo?: Image;
  };
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
  data?: {
    deletedCount?: number;
  };
}

export interface ReorderImageResponse {
  success: boolean;
  message: string;
  data: {
    images: Image[];
  };
}

export interface SetMainImageResponse {
  success: boolean;
  message: string;
  data: {
    mainImage: Image;
  };
}
