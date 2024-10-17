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
        connection_string: string
    ) {
        console.log("INITIALIZING BLOB CLIENT", connection_string)
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connection_string)
        this.containerClient = this.blobServiceClient.getContainerClient('prod');
    }

    public async uploadBlob(file: Express.Multer.File): Promise<string> {
        if (!(["image/png", "image/gif", "image/jpeg"].includes(file.mimetype))) {
            throw Error("Invalid mimetype, must be image/png, image/jpeg or image/gif")
        }

        const blobName = uuidv7() + path.extname(file.originalname);

        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(blobName)
        return blockBlobClient.upload(file.buffer, file.size)
            .then(_ => (blobName))
    }
}

export default AzureBlobService;
