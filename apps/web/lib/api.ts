/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { Document, ApiResponse, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const createUser = async (data: {
  clerkId: string;
  email: string;
  name?: string;
}): Promise<User> => {
  const response = await api.post<ApiResponse<{ user: User }>>("/users", data);
  return response.data.data!.user;
};

export const uploadDocument = async (
  file: File,
  token: string
): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiResponse<{ document: Document }>>(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data!.document;
};

export const getUserDocuments = async (token: string): Promise<Document[]> => {
  const response = await api.get<ApiResponse<{ documents: Document[] }>>(
    "/users/documents",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data!.documents;
};

export const getDocument = async (
  documentId: string,
  token: string
): Promise<Document> => {
  const response = await api.get<ApiResponse<{ document: Document }>>(
    `/users/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data!.document;
};

export const parseDocument = async (
  documentId: string,
  token: string
): Promise<{ parsedData: any }> => {
  const response = await api.post<ApiResponse<{ parsedData: any }>>(
    "/parse",
    { documentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data!;
};
