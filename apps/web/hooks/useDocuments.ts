import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  getUserDocuments,
  getDocument,
  uploadDocument,
  parseDocument,
} from "@/lib/api";
import { Document } from "@/lib/types";

export function useDocuments() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return getUserDocuments(token);
    },
    refetchInterval: (query) => {
      // Check if any document is processing
      const documents = query.state.data as Document[] | undefined;
      const hasProcessing = documents?.some(
        (doc: Document) => doc.status === "PARSING" || doc.status === "UPLOADED"
      );
      return hasProcessing ? 3000 : false;
    },
  });
}

export function useDocument(documentId: string | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("No document ID");
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return getDocument(documentId, token);
    },
    enabled: !!documentId,
    refetchInterval: (query) => {
      // Check if document is still processing
      const document = query.state.data as Document | undefined;
      return document?.status === "PARSING" || document?.status === "UPLOADED"
        ? 3000
        : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return uploadDocument(file, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useParseDocument() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return parseDocument(documentId, token);
    },
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
    },
  });
}
