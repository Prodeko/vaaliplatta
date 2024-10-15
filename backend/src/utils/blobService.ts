import {
    BlobClient,
    BlobDownloadResponseParsed,
    BlobServiceClient,
    BlockBlobClient,
    BlockBlobUploadResponse,
    ContainerClient,
} from "@azure/storage-blob";
import path from "path";
import { v7 as uuidv7 } from "uuid"

class AzureBlobService {
    private blobServiceClient: BlobServiceClient;
    private containerClient: ContainerClient;

    constructor(
        BLOB_SAS_URL: string
    ) {
        this.blobServiceClient = new BlobServiceClient(BLOB_SAS_URL);
        this.containerClient = this.blobServiceClient.getContainerClient('');
    }

    public async uploadBlob(file: Express.Multer.File): Promise<string> {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
            throw Error("Invalid mimetype, must be image/png or image/jpeg")
        }

        const blobName = uuidv7() + path.extname(file.originalname);
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName)
        return blockBlobClient.upload(file.buffer, file.size)
            .then(_ => (blobName))
    }
}

export default AzureBlobService;
