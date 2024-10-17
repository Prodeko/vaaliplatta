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
        console.log("INITIALIZING BLOB CLIENT")
        console.log(BLOB_SAS_URL)
        this.blobServiceClient = new BlobServiceClient(BLOB_SAS_URL);
        this.containerClient = this.blobServiceClient.getContainerClient('');
    }

    public async uploadBlob(file: Express.Multer.File): Promise<string> {
        if (!(["image/png", "image/gif", "image/jpeg"].includes(file.mimetype))) {
            throw Error("Invalid mimetype, must be image/png, image/jpeg or image/gif")
        }

        const blobName = uuidv7() + path.extname(file.originalname);
        console.log(blobName)
        console.log(this.blobServiceClient.url)

        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName)
        return blockBlobClient.upload(file.buffer, file.size)
            .then(_ => (blobName))
    }
}

export default AzureBlobService;
