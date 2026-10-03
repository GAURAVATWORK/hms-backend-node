import { getVerificationDocumentUrl,} from "../../services/storage/image-url.service.js";


const toVerificationDocumentDto = (document) => ({
    documentId: document.id,

    documentKey: document.document_key,
    originalFileName: document.original_file_name,
    mimeType: document.mime_type,
    fileSizeBytes: document.file_size_bytes,

    verificationStatus: document.verification_status,
    rejectionReason: document.rejection_reason,
    reviewedBy: document.reviewed_by,
    reviewedAt: document.reviewed_at,

    identityProofType: document.identity_proof_type_id
        ? {
              identityProofTypeId: document.identity_proof_type_id,
              code: document.identity_proof_type_code,
              name: document.identity_proof_type_name,
          }
        : null,

    verificationDocumentType: document.verification_document_type_id
        ? {
              verificationDocumentTypeId:
                  document.verification_document_type_id,
              code: document.verification_document_type_code,
              name: document.verification_document_type_name,
          }
        : null,

    qualification: document.qualification_id
        ? {
              qualificationId: document.qualification_id,
              code: document.qualification_code,
              name: document.qualification_name,
          }
        : null,

    createdAt: document.created_at,
    updatedAt: document.updated_at,
});

const toVerificationDocumentListDto = (documents) => {
    return documents.map(toVerificationDocumentDto);
};

const toVerificationDocumentItemDto = (document) => ({
    documentId: document.id,

    documentType:
        document.identity_proof_type_code ??
        document.verification_document_type_code,

    documentName:
        document.identity_proof_type_name ??
        document.verification_document_type_name,

    verificationStatus: document.verification_status,

    rejectionReason: document.rejection_reason,

    reviewedAt: document.reviewed_at,

    documentUrl: getVerificationDocumentUrl(document.document_key),
});


const toQualificationDocumentDto = (document) => ({
    documentId: document.id,

    documentType: document.verification_document_type_code,

    documentName: document.verification_document_type_name,

    qualification: {
        id: document.qualification_id,
        name: document.qualification_name,
    },

    verificationStatus: document.verification_status,

    rejectionReason: document.rejection_reason,

    reviewedAt: document.reviewed_at,

    documentUrl: getVerificationDocumentUrl(document.document_key),
});

const toVerificationDocumentResponseDto = (documents) => {

    let idProof = null;
    let mrcCertificate = null;
    const qualifications = [];
   
    for(const document of documents){
        if(document.identity_proof_type_id){
            idProof = toVerificationDocumentItemDto(document);
            continue;
        }
        if(document.verification_document_type_code === "MEDICAL_REGISTRATION_CERTIFICATE"){
            mrcCertificate = toVerificationDocumentItemDto(document);
            continue;
        }

        if(document.verification_document_type_code === "QUALIFICATION_CERTIFICATE"){
            qualifications.push(toQualificationDocumentDto(document));
            }
    }


    return {
    idProof,
    mrcCertificate,
    qualifications,
    };
};




export {
    toVerificationDocumentDto,
    toVerificationDocumentListDto,
    toVerificationDocumentResponseDto,
};