import env from "../../config/env.js";


const getImageUrl = (imageKey) => {

    if (!imageKey) {
        return null;
    }

    return `${env.apiBaseUrl}/storage/${imageKey}`;
};

const getVerificationDocumentUrl = (documentKey) => {
    if (!documentKey) {
        return null;
    }

    return `${env.apiBaseUrl}/storage/${documentKey}`;
};


export {
    getImageUrl,
    getVerificationDocumentUrl,
};