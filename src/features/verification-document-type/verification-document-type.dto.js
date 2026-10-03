
const toVerificationDocumentTypeDto = (verificationDocumentType) => ({
    verificationDocumentTypeId: verificationDocumentType.id,
    code: verificationDocumentType.code,
    name: verificationDocumentType.name,
    description: verificationDocumentType.description,
});

const toVerificationDocumentTypeListDto = (verificationDocumentTypes) => {
    return verificationDocumentTypes.map(toVerificationDocumentTypeDto);
};

export {
    toVerificationDocumentTypeDto,
    toVerificationDocumentTypeListDto,
};
