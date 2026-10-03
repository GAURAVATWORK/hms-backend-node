import pool from "../../config/database.js";

import { validateDoctorRegistration, validateDoctorProfileUpdate,} from "./doctor.validation.js";

import {
    findDoctorProfile,
    registerDoctor,
    updateImmediateDoctorProfile,
    createProfileChangeRequest,
} from "./doctor.repository.js";

import { findUserVerificationDocuments,} from "../verification-document/verification-document.repository.js";

const submitDoctorRegistration = async(
    doctorId,
        data
) => {
 
    const errors = validateDoctorRegistration(data);
    if(Object.keys(errors).length > 0){
        const error = new Error(
            "Doctor registration data is invalid."
        );

        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        error.details= errors;

        throw error;
    }

    const registrationData = {

        doctorId,

        phone:data.phone.trim(),
        medicalRegistrationNumber: data.medicalRegistrationNumber.trim(),
        medicalRegistrationAuthority: data.medicalRegistrationAuthority.trim(),
        qualificationIds: data.qualificationIds,
        experienceYears: data.experienceYears,
        bio: data.bio.trim(),
        hospitalOrClinicName: data.hospitalOrClinicName.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: typeof data.addressLine2 === "string"
                ? data.addressLine2.trim()
                : null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country.trim(),
        offlineConsultationFee: data.offlineConsultationFee,
        specialityIds: data.specialityIds,
        primarySpecialityId: data.primarySpecialityId.trim(),
    };


    const doctor = await registerDoctor(
        registrationData
    );

    return doctor;
};

const getDoctorProfile = async (doctorId) => {
    const [doctor, verificationDocuments] = await Promise.all([
        findDoctorProfile(doctorId),
        findUserVerificationDocuments(doctorId),
    ]);

    doctor.verificationDocuments = verificationDocuments;

    return doctor;
};

/*
|--------------------------------------------------------------------------
| Update Doctor Profile
|--------------------------------------------------------------------------
|
| Handles PATCH /api/v1/doctors/profile
|
| The update is divided into three categories:
|
| 1. Immediate changes
| 2. Professional changes requiring Admin approval
| 3. Offline fee / Bank changes requiring Admin approval
|
|--------------------------------------------------------------------------
*/

const updateDoctorProfile = async (
    doctorId,
    data
) => {

    /*
     |--------------------------------------------------------------------------
     | Validate request
     |--------------------------------------------------------------------------
     */

    const errors =
        validateDoctorProfileUpdate(data);


    if (Object.keys(errors).length > 0) {

        const error = new Error(
            "Doctor profile data is invalid."
        );

        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        error.details = errors;

        throw error;
    }


    /*
     |--------------------------------------------------------------------------
     | Separate immediate profile fields
     |--------------------------------------------------------------------------
     |
     | These fields can be changed immediately without
     | Admin approval.
     |
     */

    const immediateData = {
        doctorId,
    };


    if (data.name !== undefined) {
        immediateData.name =
            data.name.trim();
    }


    if (data.profilePhotoKey !== undefined) {
        immediateData.profilePhotoKey =
            data.profilePhotoKey.trim();
    }


    if (data.dateOfBirth !== undefined) {
        immediateData.dateOfBirth =
            data.dateOfBirth.trim();
    }


    if (data.gender !== undefined) {
        immediateData.gender =
            data.gender;
    }


    if (data.phone !== undefined) {
        immediateData.phone =
            data.phone.trim();
    }


    if (data.bio !== undefined) {
        immediateData.bio =
            data.bio.trim();
    }


    if (data.addressLine1 !== undefined) {
        immediateData.addressLine1 =
            data.addressLine1.trim();
    }


    if (data.addressLine2 !== undefined) {

        immediateData.addressLine2 =
            typeof data.addressLine2 === "string"
                ? data.addressLine2.trim()
                : null;
    }


    if (data.city !== undefined) {
        immediateData.city =
            data.city.trim();
    }


    if (data.state !== undefined) {
        immediateData.state =
            data.state.trim();
    }


    if (data.postalCode !== undefined) {
        immediateData.postalCode =
            data.postalCode.trim();
    }


    if (data.country !== undefined) {
        immediateData.country =
            data.country.trim();
    }


    /*
     |--------------------------------------------------------------------------
     | Professional approval data
     |--------------------------------------------------------------------------
     |
     | These changes must NOT overwrite the current
     | approved Doctor profile.
     |
     | They are stored as a pending PROFESSIONAL request.
     |
     */

    const professionalData = {};


    if (data.medicalRegistrationNumber !== undefined) {

        professionalData.medicalRegistrationNumber =
            data.medicalRegistrationNumber.trim();
    }


    if (data.medicalRegistrationAuthority !== undefined) {

        professionalData.medicalRegistrationAuthority =
            data.medicalRegistrationAuthority.trim();
    }


    if (data.experienceYears !== undefined) {

        professionalData.experienceYears =
            data.experienceYears;
    }


    if (data.hospitalOrClinicName !== undefined) {

        professionalData.hospitalOrClinicName =
            data.hospitalOrClinicName.trim();
    }


    if (data.qualificationIds !== undefined) {

        professionalData.qualificationIds =
            data.qualificationIds;
    }


    if (data.specialityIds !== undefined) {

        professionalData.specialityIds =
            data.specialityIds;
    }


    if (data.primarySpecialityId !== undefined) {

        professionalData.primarySpecialityId =
            data.primarySpecialityId.trim();
    }


    /*
     |--------------------------------------------------------------------------
     | Offline consultation fee
     |--------------------------------------------------------------------------
     */

    const offlineFeeData = {};


    if (data.offlineConsultationFee !== undefined) {

        offlineFeeData.offlineConsultationFee =
            data.offlineConsultationFee;
    }


    /*
     |--------------------------------------------------------------------------
     | Bank information
     |--------------------------------------------------------------------------
     */

    const bankData = {};


    if (data.bank !== undefined) {

        bankData.accountHolderName =
            data.bank.accountHolderName.trim();

        bankData.accountNumber =
            data.bank.accountNumber.trim();

        bankData.ifscCode =
            data.bank.ifscCode.trim();

        bankData.bankName =
            data.bank.bankName.trim();

        bankData.branchName =
            data.bank.branchName === undefined ||
            data.bank.branchName === null
                ? null
                : data.bank.branchName.trim();
    }


    /*
     |--------------------------------------------------------------------------
     | Start transaction
     |--------------------------------------------------------------------------
     */

    const client =
        await pool.connect();


    try {

        await client.query("BEGIN");


        /*
         |--------------------------------------------------------------------------
         | Immediate profile update
         |--------------------------------------------------------------------------
         */

        if (
            Object.keys(immediateData).length > 1
        ) {

            await updateImmediateDoctorProfile(
                client,
                immediateData
            );
        }


        /*
         |--------------------------------------------------------------------------
         | Professional approval request
         |--------------------------------------------------------------------------
         */

        if (
            Object.keys(professionalData).length > 0
        ) {

            /*
             * Validate qualifications against
             * the database.
             */

            if (
                professionalData.qualificationIds !==
                undefined
            ) {

                const qualificationResult =
                    await client.query(
                        `SELECT
                            id
                         FROM qualifications
                         WHERE id = ANY($1::uuid[])
                         AND is_active = TRUE`,
                        [
                            professionalData.qualificationIds,
                        ]
                    );


                if (
                    qualificationResult.rows.length !==
                    professionalData.qualificationIds.length
                ) {

                    const error = new Error(
                        "One or more selected qualifications are invalid or inactive."
                    );

                    error.statusCode = 400;
                    error.code =
                        "INVALID_QUALIFICATIONS";

                    throw error;
                }
            }


            /*
             * Validate specialities against
             * the database.
             */

            if (
                professionalData.specialityIds !==
                undefined
            ) {

                const specialityResult =
                    await client.query(
                        `SELECT
                            id
                         FROM specialities
                         WHERE id = ANY($1::uuid[])
                         AND is_active = TRUE`,
                        [
                            professionalData.specialityIds,
                        ]
                    );


                if (
                    specialityResult.rows.length !==
                    professionalData.specialityIds.length
                ) {

                    const error = new Error(
                        "One or more selected specialities are invalid or inactive."
                    );

                    error.statusCode = 400;
                    error.code =
                        "INVALID_SPECIALITIES";

                    throw error;
                }
            }


            /*
             * If primary speciality is supplied,
             * verify it belongs to the selected specialities.
             */

            if (
                professionalData.primarySpecialityId !==
                    undefined &&
                professionalData.specialityIds !==
                    undefined
            ) {

                if (
                    !professionalData.specialityIds.includes(
                        professionalData.primarySpecialityId
                    )
                ) {

                    const error = new Error(
                        "Primary speciality must be one of the selected specialities."
                    );

                    error.statusCode = 400;
                    error.code =
                        "INVALID_PRIMARY_SPECIALITY";

                    throw error;
                }
            }


            await createProfileChangeRequest(
                client,
                {
                    doctorId,
                    changeType: "PROFESSIONAL",
                    requestedData:
                        professionalData,
                }
            );
        }


        /*
         |--------------------------------------------------------------------------
         | Offline consultation fee approval request
         |--------------------------------------------------------------------------
         */

        if (
            Object.keys(offlineFeeData).length > 0
        ) {

            await createProfileChangeRequest(
                client,
                {
                    doctorId,
                    changeType: "OFFLINE_FEE",
                    requestedData:
                        offlineFeeData,
                }
            );
        }


        /*
         |--------------------------------------------------------------------------
         | Bank approval request
         |--------------------------------------------------------------------------
         */

        if (
            Object.keys(bankData).length > 0
        ) {

            await createProfileChangeRequest(
                client,
                {
                    doctorId,
                    changeType: "BANK",
                    requestedData:
                        bankData,
                }
            );
        }


        /*
         |--------------------------------------------------------------------------
         | Commit
         |--------------------------------------------------------------------------
         */

        await client.query("COMMIT");

    } catch (error) {

        /*
         |--------------------------------------------------------------------------
         | Rollback
         |--------------------------------------------------------------------------
         */

        await client.query("ROLLBACK");

        throw error;

    } finally {

        /*
         |--------------------------------------------------------------------------
         | Release PostgreSQL connection
         |--------------------------------------------------------------------------
         */

        client.release();
    }


    /*
     |--------------------------------------------------------------------------
     | Fetch the complete Doctor profile
     |--------------------------------------------------------------------------
     */

    const doctor =
        await findDoctorProfile(
            doctorId
        );


    return doctor;
};


export {
    submitDoctorRegistration,
    getDoctorProfile,
    updateDoctorProfile,
};