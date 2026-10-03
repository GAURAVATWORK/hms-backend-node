
import {getUserVerificationDocuments,} from "./verification-document.service.js";
import { toVerificationDocumentResponseDto,} from "./verification-document.dto.js";
import readMultipartBody from "../../utils/read-multipart-body.js";
import { normalizeVerificationDocuments,} from "./verification-document.multipart.js";
import { createVerificationDocuments,} from "./verification-document.service.js";

const getUserVerificationDocumentsController = async (req, res) => {
    const userId = req.user.id;

    const documents = await getUserVerificationDocuments(userId);

    const data = toVerificationDocumentResponseDto(documents);

    const response = {
        success: true,
        data,
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
};

const uploadVerificationDocumentsController = async(req,res) => {

        // Step 1: Read multipart/form-data request

    const {fields, files} = await readMultipartBody(req);

    // Step 2: Convert multipart fields/files into normalized verification documents

     const documents = normalizeVerificationDocuments({
        fields,
        files,
     });
     
        // Step 3: Create verification documents

        const createdDocuments = await createVerificationDocuments(
            req.user.id,
            documents
        );

        // Step 4: calling dto for response

        const reponseData = toVerificationDocumentResponseDto(createdDocuments);

                // Step 5: Send response

        res.statusCode = 201;

        res.setHeader(
        "Content-Type",
        "application/json"
        );

       res.end(
        JSON.stringify({
         success: true,
         data: reponseData,
        })
       ); 
};

export {
    getUserVerificationDocumentsController,
    uploadVerificationDocumentsController,
};
