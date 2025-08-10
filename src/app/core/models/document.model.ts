export interface DocumentFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  documentId: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  status: number;
  metadata: {
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  files: DocumentFile[];
}
