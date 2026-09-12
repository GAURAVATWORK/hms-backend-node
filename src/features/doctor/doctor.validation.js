const validateDoctorRegistration = (data) => {

    const errors = {};


    /*
     * Phone
     */

    if (
        typeof data.phone !== "string" ||
        data.phone.trim() === ""
    ) {
        errors.phone =
            "Phone is required.";
    }


    /*
     * Medical registration number
     */

    if (
        typeof data.medicalRegistrationNumber !== "string" ||
        data.medicalRegistrationNumber.trim() === ""
    ) {
        errors.medicalRegistrationNumber =
            "Medical registration number is required.";
    }


    /*
     * Medical registration authority
     */

    if (
        typeof data.medicalRegistrationAuthority !== "string" ||
        data.medicalRegistrationAuthority.trim() === ""
    ) {
        errors.medicalRegistrationAuthority =
            "Medical registration authority is required.";
    }


    /*
     * Qualification IDs
     */

    if (!Array.isArray(data.qualificationIds)) {

        errors.qualificationIds =
            "Qualification IDs must be an array.";

    } else {

        if (
            data.qualificationIds.length < 1 ||
            data.qualificationIds.length > 3
        ) {
            errors.qualificationIds =
                "A doctor must select between 1 and 3 qualifications.";
        }


        /*
         * Every qualification ID must be a
         * non-empty string.
         */

        const invalidQualificationId =
            data.qualificationIds.some(
                (qualificationId) =>
                    typeof qualificationId !== "string" ||
                    qualificationId.trim() === ""
            );

        if (invalidQualificationId) {
            errors.qualificationIds =
                "Qualification IDs must be non-empty strings.";
        }


        /*
         * Duplicate qualification IDs
         */

        const uniqueQualificationIds =
            new Set(data.qualificationIds);

        if (
            uniqueQualificationIds.size !==
            data.qualificationIds.length
        ) {
            errors.qualificationIds =
                "Qualification IDs must not contain duplicates.";
        }
    }


    /*
     * Experience years
     */

    if (
        !Number.isInteger(data.experienceYears) ||
        data.experienceYears < 0
    ) {
        errors.experienceYears =
            "Experience years must be a non-negative integer.";
    }


    /*
     * Bio
     */

    if (
        typeof data.bio !== "string" ||
        data.bio.trim() === ""
    ) {
        errors.bio =
            "Bio is required.";
    }


    /*
     * Hospital / Clinic
     */

    if (
        typeof data.hospitalOrClinicName !== "string" ||
        data.hospitalOrClinicName.trim() === ""
    ) {
        errors.hospitalOrClinicName =
            "Hospital or clinic name is required.";
    }


    /*
     * Address Line 1
     */

    if (
        typeof data.addressLine1 !== "string" ||
        data.addressLine1.trim() === ""
    ) {
        errors.addressLine1 =
            "Address line 1 is required.";
    }


    /*
     * Address Line 2
     *
     * Optional field.
     */


    /*
     * City
     */

    if (
        typeof data.city !== "string" ||
        data.city.trim() === ""
    ) {
        errors.city =
            "City is required.";
    }


    /*
     * State
     */

    if (
        typeof data.state !== "string" ||
        data.state.trim() === ""
    ) {
        errors.state =
            "State is required.";
    }


    /*
     * Postal code
     */

    if (
        typeof data.postalCode !== "string" ||
        data.postalCode.trim() === ""
    ) {
        errors.postalCode =
            "Postal code is required.";
    }


    /*
     * Country
     */

    if (
        typeof data.country !== "string" ||
        data.country.trim() === ""
    ) {
        errors.country =
            "Country is required.";
    }


    /*
     * Offline consultation fee
     */

    if (
        typeof data.offlineConsultationFee !== "number" ||
        !Number.isFinite(data.offlineConsultationFee) ||
        data.offlineConsultationFee < 0
    ) {
        errors.offlineConsultationFee =
            "Offline consultation fee must be a non-negative number.";
    }


    /*
     * Speciality IDs
     */

    if (!Array.isArray(data.specialityIds)) {

        errors.specialityIds =
            "Speciality IDs must be an array.";

    } else {

        if (
            data.specialityIds.length < 1 ||
            data.specialityIds.length > 3
        ) {
            errors.specialityIds =
                "A doctor must select between 1 and 3 specialities.";
        }


        /*
         * Every speciality ID must be a
         * non-empty string.
         */

        const invalidSpecialityId =
            data.specialityIds.some(
                (specialityId) =>
                    typeof specialityId !== "string" ||
                    specialityId.trim() === ""
            );

        if (invalidSpecialityId) {
            errors.specialityIds =
                "Speciality IDs must be non-empty strings.";
        }


        /*
         * Duplicate speciality IDs
         */

        const uniqueSpecialityIds =
            new Set(data.specialityIds);

        if (
            uniqueSpecialityIds.size !==
            data.specialityIds.length
        ) {
            errors.specialityIds =
                "Speciality IDs must not contain duplicates.";
        }
    }


    /*
     * Primary speciality ID
     */

    const primarySpecialityId =
        typeof data.primarySpecialityId === "string"
            ? data.primarySpecialityId.trim()
            : "";


    if (primarySpecialityId === "") {

        errors.primarySpecialityId =
            "Primary speciality ID is required.";

    } else if (Array.isArray(data.specialityIds)) {

        if (
            !data.specialityIds.includes(
                primarySpecialityId
            )
        ) {
            errors.primarySpecialityId =
                "Primary speciality must be one of the selected specialities.";
        }
    }


    return errors;
};


export {
    validateDoctorRegistration,
};