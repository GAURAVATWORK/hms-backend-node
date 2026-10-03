import {findAllVerificationDocumentTypes,} from "./verification-document-type.repository.js";

const getVerificationDocumentTypes = async () => {

const verificationDocumentTypes = await findAllVerificationDocumentTypes();

 return verificationDocumentTypes;
};

export {
    getVerificationDocumentTypes,
};

