import USER_ROLES from "../../constants/roles.js";

import {
    findPatientProfileByUserId,
    updatePatientProfile
} from "./profile.repository.js";

import {
    toProfileResponse
} from "./profile.dto.js";

import {
    validateProfileUpdate
} from "./profile.validation.js";


const createProfileError = (
    message,
    code,
    statusCode
) => {
    const error = new Error(message);

    error.code = code;
    error.statusCode = statusCode;

    return error;
};


const getProfile = async ({
    userId,
    userType
}) => {

    if (!userId) {

        throw createProfileError(
            "User identity is required",
            "USER_ID_REQUIRED",
            401
        );
    }

    if (
        userType === USER_ROLES.PATIENT
    ) {

        const profile =
            await findPatientProfileByUserId({
                userId
            });

        if (!profile) {

            throw createProfileError(
                "Patient profile not found",
                "PROFILE_NOT_FOUND",
                404
            );
        }

        return toProfileResponse(
            profile
        );
    }

    throw createProfileError(
        "Profile type is not supported yet",
        "PROFILE_TYPE_NOT_SUPPORTED",
        501
    );
};


const updateProfile = async ({
    userId,
    userType,
    body
}) => {

    /*
     * Step 1:
     * Make sure the authenticated user's identity
     * is available.
     */
    if (!userId) {

        throw createProfileError(
            "User identity is required",
            "USER_ID_REQUIRED",
            401
        );
    }


    /*
     * Step 2:
     * Currently only PATIENT profiles are supported.
     */
    if (
        userType !== USER_ROLES.PATIENT
    ) {

        throw createProfileError(
            "Profile type is not supported yet",
            "PROFILE_TYPE_NOT_SUPPORTED",
            501
        );
    }


    /*
     * Step 3:
     * Validate the request body before
     * sending anything to the repository.
     */
    const validatedBody =
        validateProfileUpdate(body);


    /*
     * Step 4:
     * Convert the HTTP/API structure into
     * the flat structure expected by the repository.
     */
    const updates = {};


    /*
     * Simple top-level fields.
     */
    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "profilePhotoUrl"
        )
    ) {

        updates.profilePhotoUrl =
            validatedBody.profilePhotoUrl;
    }


    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "name"
        )
    ) {

        updates.name =
            validatedBody.name;
    }


    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "dateOfBirth"
        )
    ) {

        updates.dateOfBirth =
            validatedBody.dateOfBirth;
    }


    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "gender"
        )
    ) {

        updates.gender =
            validatedBody.gender;
    }


    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "phone"
        )
    ) {

        updates.phone =
            validatedBody.phone;
    }


    /*
     * Nested address fields.
     *
     * API:
     *
     * address: {
     *     city: "Delhi"
     * }
     *
     * becomes:
     *
     * {
     *     "address.city": "Delhi"
     * }
     */
    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "address"
        )
    ) {

        const address =
            validatedBody.address;

        for (
            const [field, value]
            of Object.entries(address)
        ) {

            updates[`address.${field}`] =
                value;
        }
    }


    /*
     * Blood group.
     */
    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "bloodGroup"
        )
    ) {

        updates.bloodGroup =
            validatedBody.bloodGroup;
    }


    /*
     * Nested emergency contact fields.
     *
     * API:
     *
     * emergencyContact: {
     *     name: "Rahul Singh",
     *     phone: "9876543210"
     * }
     *
     * becomes:
     *
     * {
     *     "emergencyContact.name": "Rahul Singh",
     *     "emergencyContact.phone": "9876543210"
     * }
     */
    if (
        Object.prototype.hasOwnProperty.call(
            validatedBody,
            "emergencyContact"
        )
    ) {

        const emergencyContact =
            validatedBody.emergencyContact;

        for (
            const [field, value]
            of Object.entries(emergencyContact)
        ) {

            updates[
                `emergencyContact.${field}`
            ] = value;
        }
    }


    /*
     * Step 5:
     * Send the server-controlled userId and
     * validated update fields to the repository.
     */
    const updatedPatient =
        await updatePatientProfile({
            userId,
            updates
        });


    /*
     * Step 6:
     * If no patient row was found for this
     * authenticated user, return 404.
     */
    if (!updatedPatient) {

        throw createProfileError(
            "Patient profile not found",
            "PROFILE_NOT_FOUND",
            404
        );
    }


    /*
     * Step 7:
     * Fetch the complete profile again.
     *
     * The UPDATE repository works only with
     * the patients table.
     *
     * The GET repository joins users + patients,
     * so we reuse it to get the complete profile.
     */
    const completeProfile =
        await findPatientProfileByUserId({
            userId
        });


    if (!completeProfile) {

        throw createProfileError(
            "Patient profile not found",
            "PROFILE_NOT_FOUND",
            404
        );
    }


    /*
     * Step 8:
     * Convert the database record into
     * our API response DTO.
     */
    return toProfileResponse(
        completeProfile
    );
};


export {
    getProfile,
    updateProfile
};