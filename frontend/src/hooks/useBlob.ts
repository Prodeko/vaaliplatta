import { BlobClient, BlobDownloadResponseParsed } from "@azure/storage-blob";
import { useAppState } from "./useAppState";
import { useCallback } from "react";

export const useBlobClient = () => {
    const { blobServiceClient } = useAppState()

    const getBlob = useCallback(async (path: string) => {
        const containerClient = blobServiceClient.getContainerClient('');
        const blobClient: BlobClient = containerClient.getBlobClient(path);
        const blobResult: BlobDownloadResponseParsed = await blobClient.download();
        const body = await blobResult.blobBody;
        if (body)
            return URL.createObjectURL(body);
        else
            return null
    }, [blobServiceClient])

    return { getBlob };
}
