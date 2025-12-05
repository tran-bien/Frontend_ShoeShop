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

export interface SimpleImage {
  url: string;
  public_id: string;
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
  url?: string;
  public_id?: string;
  data?: {
    images?: Image[];
    image?: Image;
    logo?: Image;
  };
  // For SizeGuide responses
  sizeGuide?: {
    sizeChart?: {
      image?: SimpleImage;
    };
    measurementGuide?: {
      image?: SimpleImage;
    };
  };
  // For Blog responses
  featuredImage?: SimpleImage;
  thumbnail?: SimpleImage;
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
