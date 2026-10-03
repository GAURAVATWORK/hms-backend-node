import { toVerificationDocumentResponseDto,} from "../verification-document/verification-document.dto.js";


const toDoctorRegistrationDto = (doctor) => {
    return {
        doctorId: doctor.user_id,
        doctorNumber: doctor.doctor_number,
        name: doctor.name,
        registrationStatus: doctor.doctor_registration_status,
    };
};


const toPendingProfessionalDto = (pendingChange) => {
    if (!pendingChange) {
        return null;
    }

    const requestedData = pendingChange.requestedData ?? {};

    return {
        status: pendingChange.status,
        requestedAt: pendingChange.requestedAt,

        medicalRegistrationNumber:
            requestedData.medicalRegistrationNumber ?? null,

        medicalRegistrationAuthority:
            requestedData.medicalRegistrationAuthority ?? null,

        experienceYears:
            requestedData.experienceYears ?? null,

        hospitalOrClinicName:
            requestedData.hospitalOrClinicName ?? null,

        qualificationIds:
            requestedData.qualificationIds ?? null,

        specialityIds:
            requestedData.specialityIds ?? null,

        primarySpecialityId:
            requestedData.primarySpecialityId ?? null,

        rejectionReason:
            pendingChange.rejectionReason ?? null,

        reviewedAt:
            pendingChange.reviewedAt ?? null,
    };
};


const toPendingOfflineFeeDto = (pendingChange) => {
    if (!pendingChange) {
        return null;
    }

    const requestedData = pendingChange.requestedData ?? {};

    return {
        status: pendingChange.status,
        requestedAt: pendingChange.requestedAt,

        requestedValue:
            requestedData.offlineConsultationFee ?? null,

        rejectionReason:
            pendingChange.rejectionReason ?? null,

        reviewedAt:
            pendingChange.reviewedAt ?? null,
    };
};


const toPendingBankDto = (pendingChange) => {
    if (!pendingChange) {
        return null;
    }

    const requestedData = pendingChange.requestedData ?? {};

    return {
        status: pendingChange.status,
        requestedAt: pendingChange.requestedAt,

        accountHolderName:
            requestedData.accountHolderName ?? null,

        accountNumber:
            requestedData.accountNumber ?? null,

        ifscCode:
            requestedData.ifscCode ?? null,

        bankName:
            requestedData.bankName ?? null,

        branchName:
            requestedData.branchName ?? null,

        rejectionReason:
            pendingChange.rejectionReason ?? null,

        reviewedAt:
            pendingChange.reviewedAt ?? null,
    };
};


const toDoctorProfileDto = (doctor) => {
    return {
        doctorId: doctor.user_id,
        doctorNumber: doctor.doctor_number,

        name: doctor.name,
        email: doctor.email,

        profilePhotoKey: doctor.profile_photo_key,
        dateOfBirth: doctor.date_of_birth,
        gender: doctor.gender,
        phone: doctor.phone,

        experienceYears: doctor.experience_years,

        medicalRegistrationNumber:
            doctor.medical_registration_number,

        medicalRegistrationAuthority:
            doctor.medical_registration_authority,

        bio: doctor.bio,

        hospitalOrClinicName:
            doctor.hospital_or_clinic_name,

        address: {
            addressLine1: doctor.address_line_1,
            addressLine2: doctor.address_line_2,
            city: doctor.city,
            state: doctor.state,
            postalCode: doctor.postal_code,
            country: doctor.country,
        },

        offlineConsultationFee:
            doctor.offline_consultation_fee,

        qualifications:
            doctor.qualifications,

        specialities:
            doctor.specialities,

        bankInformation:
            doctor.bank_information,

        registrationStatus:
            doctor.doctor_registration_status,

        pendingChanges: {
            professional: toPendingProfessionalDto(
                doctor.pending_professional_change
            ),

            offlineFee: toPendingOfflineFeeDto(
                doctor.pending_offline_fee_change
            ),

            bank: toPendingBankDto(
                doctor.pending_bank_change
            ),
        },
      
        verificationDocuments:
            toVerificationDocumentResponseDto(
                doctor.verificationDocuments ?? []
            ),


        createdAt: doctor.created_at,
        updatedAt: doctor.updated_at,
    };
};


export {
    toDoctorRegistrationDto,
    toDoctorProfileDto,
};