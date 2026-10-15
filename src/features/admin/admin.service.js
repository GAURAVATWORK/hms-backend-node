import adminRepository from "./admin.repository.js";
import { encodeCursor, decodeCursor } from "../../utils/cursor.js";
import { toAdminDoctorListResponseDto } from "./admin.dto.js";
import {toDoctorProfileDto,} from "../doctor/doctor.dto.js";
import {toVerificationDocumentDto,} from "../verification-document/verification-document.dto.js";


const getDoctorList = async ({
    emailVerified = null,
    registrationStatus = null,
    cursor = null,
}) => {
    // Decode the cursor for pagination.
    const cursorPosition = cursor
        ? decodeCursor(cursor, {
              emailVerified,
              registrationStatus,
          })
        : null;

    // Fetch the current batch of doctors from the repository.
    const result = await adminRepository.findDoctorList({
        emailVerified,
        registrationStatus,
        cursor: cursorPosition,
    });

    // Generate the next cursor when more records are available.
    const nextCursor = result.nextCursorPosition
        ? encodeCursor({
              emailVerified,
              registrationStatus,
              createdAt: result.nextCursorPosition.createdAt,
              userId: result.nextCursorPosition.userId,
          })
        : null;

    // Set the response message based on the filter and results.
    let message = "Doctors retrieved successfully";

    if (result.rows.length === 0) {
        switch (registrationStatus) {
            case "VERIFIED":
                message = "No verified doctors found";
                break;

            case "REJECTED":
                message = "No rejected doctors found";
                break;

            case "PENDING":
                message = "No pending doctors found";
                break;

            case "NEW":
                message = "No new doctors found";
                break;

            default:
                message = "No doctors found";
        }
    }

    // Return the formatted response.
    return toAdminDoctorListResponseDto({
        rows: result.rows,
        nextCursor,
        message,
    });
};


const getDoctorDetail = async (doctorId) =>{
 const doctor = await adminRepository.findDoctorDetail(
    doctorId
 );
 return toDoctorProfileDto(doctor);
};

const reviewVerificationDocument = async({    doctorId,
    documentId,
    status,
    reason,
    reviewedBy,
}) => {

    const document = await adminRepository.reviewVerificationDocument({
        doctorId,
        documentId,
        status,
        reason,
        reviewedBy,
    });
    return toVerificationDocumentDto(document); 
};


const reviewDoctorRegistration = async ({
    doctorId,
    reviewedBy,
    reviews,
}) => {
    return adminRepository.reviewDoctorRegistration({
        doctorId,
        reviewedBy,
        reviews,
    });
};


const adminService = {
    getDoctorList,
    getDoctorDetail,
    reviewVerificationDocument,
    reviewDoctorRegistration,
};

export default adminService;