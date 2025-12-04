/**
 * Tag Types
 * Định nghĩa các interface liên quan đến Tags
 */

export type TagType = "MATERIAL" | "USECASE" | "CUSTOM";

export interface Tag {
  _id: string;
  name: string;
  slug?: string;
  type: TagType;
  description?: string;
  isActive: boolean;
  deletedAt?: string | null | undefined;
  deletedBy?: string | { _id: string; name?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagData {
  name: string;
  type: TagType;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTagData {
  name?: string;
  type?: TagType;
  description?: string;
  isActive?: boolean;
}

export interface TagQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  type?: TagType;
  isActive?: boolean;
  sort?: string;
}
