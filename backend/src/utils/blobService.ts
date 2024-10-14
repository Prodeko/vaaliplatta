import {
    BlobClient,
    BlobDownloadResponseParsed,
    BlobServiceClient,
    BlockBlobClient,
    BlockBlobUploadResponse,
    ContainerClient,
} from "@azure/storage-blob";

class AzureBlobService {
    private blobServiceClient: BlobServiceClient;
    private containerClient: ContainerClient;

    constructor(
        BLOB_SAS_URL: string
    ) {
        this.blobServiceClient = new BlobServiceClient(BLOB_SAS_URL);
        this.containerClient = this.blobServiceClient.getContainerClient('');
    }

    public async uploadBlob(file: Express.Multer.File): Promise<BlockBlobUploadResponse> {
        const blobName = `${Date.now()}_${file.originalname}`;
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName)
        const result = await blockBlobClient.upload(file.buffer, file.size)
        return result
    }
}

export default AzureBlobService;
