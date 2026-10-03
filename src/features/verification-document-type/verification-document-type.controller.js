
import { getVerificationDocumentTypes } from "./verification-document-type.service.js";
import {toVerificationDocumentTypeListDto,} from "./verification-document-type.dto.js";

const getVerificationDocumentTypesController = async (req, res) => {
    const verificationDocumentTypes = await getVerificationDocumentTypes();

    const data = toVerificationDocumentTypeListDto(verificationDocumentTypes);

    const response = {
        success: true,
        data,
    };

    res.statusCode = 200;
    
    res.setHeader("Content-Type", "application/json");

    res.end(JSON.stringify(response));
};

export {
    getVerificationDocumentTypesController,
};
