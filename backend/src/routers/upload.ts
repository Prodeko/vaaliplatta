import { Router } from "express";
import multer from 'multer'
import AzureBlobService from "../utils/blobService";
import { requireAuthenticated } from "../middleware/auth";
import { config } from "config";

export const uploadRouter = Router();
const memoryStorage = multer.memoryStorage(); // Use memory storage to buffer files before uploading
const multerMemoryStorage = multer({ storage: memoryStorage });
const blobService = new AzureBlobService(config.BLOB_SAS_URL!)

uploadRouter.post(
    '/',
    requireAuthenticated,
    multerMemoryStorage.array('file', 5),
    async (req, res, next) => {
        const files = req.files as Express.Multer.File[] | undefined

        if (files) {
            Promise
                .all(files.map(file => blobService.uploadBlob(file)))
                .then(result => {
                    console.log(result)
                    res.status(201).send(result)
                })
                .catch(error => res.status(400).send(error))
        }
        else res.status(400).send("No files provided or uploaded")
    })

