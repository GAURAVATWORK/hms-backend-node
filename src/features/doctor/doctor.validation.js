const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


/*
|--------------------------------------------------------------------------
| Doctor Registration Validation
|--------------------------------------------------------------------------
*/

const validateDoctorRegistration = (data) => {
    const errors = {};


    /*
    |--------------------------------------------------------------------------
    | Phone
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.phone !== "string" ||
        data.phone.trim() === ""
    ) {
        errors.phone =
            "Phone is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Medical Registration Number
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.medicalRegistrationNumber !== "string" ||
        data.medicalRegistrationNumber.trim() === ""
    ) {
        errors.medicalRegistrationNumber =
            "Medical registration number is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Medical Registration Authority
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.medicalRegistrationAuthority !== "string" ||
        data.medicalRegistrationAuthority.trim() === ""
    ) {
        errors.medicalRegistrationAuthority =
            "Medical registration authority is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Qualification IDs
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(data.qualificationIds)) {

        errors.qualificationIds =
            "Qualification IDs must be an array.";

    } else {

        /*
        |--------------------------------------------------------------------------
        | Qualification Count
        |--------------------------------------------------------------------------
        */

        if (
            data.qualificationIds.length < 1 ||
            data.qualificationIds.length > 3
        ) {
            errors.qualificationIds =
                "A doctor must select between 1 and 3 qualifications.";
        }


        /*
        |--------------------------------------------------------------------------
        | Qualification ID Format
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Duplicate Qualification IDs
        |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Experience Years
    |--------------------------------------------------------------------------
    */

    if (
        !Number.isInteger(data.experienceYears) ||
        data.experienceYears < 0
    ) {
        errors.experienceYears =
            "Experience years must be a non-negative integer.";
    }


    /*
    |--------------------------------------------------------------------------
    | Bio
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.bio !== "string" ||
        data.bio.trim() === ""
    ) {
        errors.bio =
            "Bio is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Hospital / Clinic
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.hospitalOrClinicName !== "string" ||
        data.hospitalOrClinicName.trim() === ""
    ) {
        errors.hospitalOrClinicName =
            "Hospital or clinic name is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Address Line 1
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.addressLine1 !== "string" ||
        data.addressLine1.trim() === ""
    ) {
        errors.addressLine1 =
            "Address line 1 is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Address Line 2
    |--------------------------------------------------------------------------
    | Optional field.
    |--------------------------------------------------------------------------
    */


    /*
    |--------------------------------------------------------------------------
    | City
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.city !== "string" ||
        data.city.trim() === ""
    ) {
        errors.city =
            "City is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.state !== "string" ||
        data.state.trim() === ""
    ) {
        errors.state =
            "State is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Postal Code
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.postalCode !== "string" ||
        data.postalCode.trim() === ""
    ) {
        errors.postalCode =
            "Postal code is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Country
    |--------------------------------------------------------------------------
    */

    if (
        typeof data.country !== "string" ||
        data.country.trim() === ""
    ) {
        errors.country =
            "Country is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Offline Consultation Fee
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Speciality IDs
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(data.specialityIds)) {

        errors.specialityIds =
            "Speciality IDs must be an array.";

    } else {

        /*
        |--------------------------------------------------------------------------
        | Speciality Count
        |--------------------------------------------------------------------------
        */

        if (
            data.specialityIds.length < 1 ||
            data.specialityIds.length > 3
        ) {
            errors.specialityIds =
                "A doctor must select between 1 and 3 specialities.";
        }


        /*
        |--------------------------------------------------------------------------
        | Speciality ID Format
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Duplicate Speciality IDs
        |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | Primary Speciality ID
    |--------------------------------------------------------------------------
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


    /*
    |--------------------------------------------------------------------------
    | Return Registration Validation Errors
    |--------------------------------------------------------------------------
    */

    return errors;
};


/*
|--------------------------------------------------------------------------
| Doctor Profile Update Validation
|--------------------------------------------------------------------------
|
| PATCH endpoint.
|
| Every field is optional.
| Only fields supplied by the doctor are validated.
|
|--------------------------------------------------------------------------
*/

const validateDoctorProfileUpdate = (data) => {
    const errors = {};


    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (
        data.name !== undefined &&
        (
            typeof data.name !== "string" ||
            data.name.trim().length === 0
        )
    ) {
        errors.name =
            "Name must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Profile Photo Key
    |--------------------------------------------------------------------------
    */

    if (
        data.profilePhotoKey !== undefined &&
        (
            typeof data.profilePhotoKey !== "string" ||
            data.profilePhotoKey.trim().length === 0
        )
    ) {
        errors.profilePhotoKey =
            "Profile photo key must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Date of Birth
    |--------------------------------------------------------------------------
    */

    if (
        data.dateOfBirth !== undefined &&
        (
            typeof data.dateOfBirth !== "string" ||
            data.dateOfBirth.trim().length === 0
        )
    ) {
        errors.dateOfBirth =
            "Date of birth must be a valid date string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Gender
    |--------------------------------------------------------------------------
    */

    if (
        data.gender !== undefined &&
        !["MALE", "FEMALE", "OTHER"].includes(data.gender)
    ) {
        errors.gender =
            "Gender must be MALE, FEMALE, or OTHER.";
    }


    /*
    |--------------------------------------------------------------------------
    | Phone
    |--------------------------------------------------------------------------
    */

    if (
        data.phone !== undefined &&
        (
            typeof data.phone !== "string" ||
            data.phone.trim().length === 0
        )
    ) {
        errors.phone =
            "Phone must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Experience Years
    |--------------------------------------------------------------------------
    */

    if (
        data.experienceYears !== undefined &&
        (
            !Number.isInteger(data.experienceYears) ||
            data.experienceYears < 0
        )
    ) {
        errors.experienceYears =
            "Experience years must be a non-negative integer.";
    }


    /*
    |--------------------------------------------------------------------------
    | Medical Registration Number
    |--------------------------------------------------------------------------
    */

    if (
        data.medicalRegistrationNumber !== undefined &&
        (
            typeof data.medicalRegistrationNumber !== "string" ||
            data.medicalRegistrationNumber.trim().length === 0
        )
    ) {
        errors.medicalRegistrationNumber =
            "Medical registration number must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Medical Registration Authority
    |--------------------------------------------------------------------------
    */

    if (
        data.medicalRegistrationAuthority !== undefined &&
        (
            typeof data.medicalRegistrationAuthority !== "string" ||
            data.medicalRegistrationAuthority.trim().length === 0
        )
    ) {
        errors.medicalRegistrationAuthority =
            "Medical registration authority must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Bio
    |--------------------------------------------------------------------------
    */

    if (
        data.bio !== undefined &&
        (
            typeof data.bio !== "string" ||
            data.bio.trim().length === 0
        )
    ) {
        errors.bio =
            "Bio must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Hospital / Clinic Name
    |--------------------------------------------------------------------------
    */

    if (
        data.hospitalOrClinicName !== undefined &&
        (
            typeof data.hospitalOrClinicName !== "string" ||
            data.hospitalOrClinicName.trim().length === 0
        )
    ) {
        errors.hospitalOrClinicName =
            "Hospital or clinic name must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Address Line 1
    |--------------------------------------------------------------------------
    */

    if (
        data.addressLine1 !== undefined &&
        (
            typeof data.addressLine1 !== "string" ||
            data.addressLine1.trim().length === 0
        )
    ) {
        errors.addressLine1 =
            "Address line 1 must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Address Line 2
    |--------------------------------------------------------------------------
    |
    | Optional.
    | null is also allowed.
    |
    */

    if (
        data.addressLine2 !== undefined &&
        data.addressLine2 !== null &&
        typeof data.addressLine2 !== "string"
    ) {
        errors.addressLine2 =
            "Address line 2 must be a string or null.";
    }


    /*
    |--------------------------------------------------------------------------
    | City
    |--------------------------------------------------------------------------
    */

    if (
        data.city !== undefined &&
        (
            typeof data.city !== "string" ||
            data.city.trim().length === 0
        )
    ) {
        errors.city =
            "City must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    if (
        data.state !== undefined &&
        (
            typeof data.state !== "string" ||
            data.state.trim().length === 0
        )
    ) {
        errors.state =
            "State must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Postal Code
    |--------------------------------------------------------------------------
    */

    if (
        data.postalCode !== undefined &&
        (
            typeof data.postalCode !== "string" ||
            data.postalCode.trim().length === 0
        )
    ) {
        errors.postalCode =
            "Postal code must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Country
    |--------------------------------------------------------------------------
    */

    if (
        data.country !== undefined &&
        (
            typeof data.country !== "string" ||
            data.country.trim().length === 0
        )
    ) {
        errors.country =
            "Country must be a non-empty string.";
    }


    /*
    |--------------------------------------------------------------------------
    | Offline Consultation Fee
    |--------------------------------------------------------------------------
    */

    if (
        data.offlineConsultationFee !== undefined &&
        (
            typeof data.offlineConsultationFee !== "number" ||
            !Number.isFinite(data.offlineConsultationFee) ||
            data.offlineConsultationFee < 0
        )
    ) {
        errors.offlineConsultationFee =
            "Offline consultation fee must be a non-negative number.";
    }


    /*
    |--------------------------------------------------------------------------
    | Qualification IDs
    |--------------------------------------------------------------------------
    */

    if (data.qualificationIds !== undefined) {

        if (!Array.isArray(data.qualificationIds)) {

            errors.qualificationIds =
                "Qualification IDs must be an array.";

        } else if (
            data.qualificationIds.length < 1 ||
            data.qualificationIds.length > 3
        ) {

            errors.qualificationIds =
                "You can select between 1 and 3 qualifications.";

        } else {

            /*
            |--------------------------------------------------------------------------
            | Qualification UUID Validation
            |--------------------------------------------------------------------------
            */

            const invalidQualificationId =
                data.qualificationIds.some(
                    (qualificationId) =>
                        typeof qualificationId !== "string" ||
                        !UUID_REGEX.test(
                            qualificationId.trim()
                        )
                );

            if (invalidQualificationId) {
                errors.qualificationIds =
                    "Qualification IDs must be valid UUIDs.";
            }


            /*
            |--------------------------------------------------------------------------
            | Duplicate Qualification IDs
            |--------------------------------------------------------------------------
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
    }


    /*
    |--------------------------------------------------------------------------
    | Speciality IDs
    |--------------------------------------------------------------------------
    */

    if (data.specialityIds !== undefined) {

        if (!Array.isArray(data.specialityIds)) {

            errors.specialityIds =
                "Speciality IDs must be an array.";

        } else if (
            data.specialityIds.length < 1 ||
            data.specialityIds.length > 3
        ) {

            errors.specialityIds =
                "You can select between 1 and 3 specialities.";

        } else {

            /*
            |--------------------------------------------------------------------------
            | Speciality UUID Validation
            |--------------------------------------------------------------------------
            */

            const invalidSpecialityId =
                data.specialityIds.some(
                    (specialityId) =>
                        typeof specialityId !== "string" ||
                        !UUID_REGEX.test(
                            specialityId.trim()
                        )
                );

            if (invalidSpecialityId) {
                errors.specialityIds =
                    "Speciality IDs must be valid UUIDs.";
            }


            /*
            |--------------------------------------------------------------------------
            | Duplicate Speciality IDs
            |--------------------------------------------------------------------------
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
    }


    /*
    |--------------------------------------------------------------------------
    | Primary Speciality ID
    |--------------------------------------------------------------------------
    |
    | Primary speciality can only be changed together with
    | specialityIds.
    |
    */

    if (data.primarySpecialityId !== undefined) {

        /*
        |--------------------------------------------------------------------------
        | UUID Validation
        |--------------------------------------------------------------------------
        */

        if (
            typeof data.primarySpecialityId !== "string" ||
            !UUID_REGEX.test(
                data.primarySpecialityId.trim()
            )
        ) {
            errors.primarySpecialityId =
                "Primary speciality ID must be a valid UUID.";
        }


        /*
        |--------------------------------------------------------------------------
        | specialityIds Must Also Be Provided
        |--------------------------------------------------------------------------
        */

        if (data.specialityIds === undefined) {
            errors.primarySpecialityId =
                "Speciality IDs must be provided when updating the primary speciality.";
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Primary Speciality Must Exist In Selected Specialities
    |--------------------------------------------------------------------------
    */

    if (
        Array.isArray(data.specialityIds) &&
        data.primarySpecialityId !== undefined
    ) {

        const primarySpecialityId =
            data.primarySpecialityId.trim();

        if (
            !data.specialityIds.includes(
                primarySpecialityId
            )
        ) {
            errors.primarySpecialityId =
                "Primary speciality must be one of the selected specialities.";
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Bank Information
    |--------------------------------------------------------------------------
    |
    | Bank changes require admin approval.
    |
    | When bank information is supplied, all required bank
    | fields must be provided together.
    |
    */

    if (data.bank !== undefined) {

        if (
            typeof data.bank !== "object" ||
            data.bank === null ||
            Array.isArray(data.bank)
        ) {

            errors.bank =
                "Bank information must be an object.";

        } else {

            const bank = data.bank;


            /*
            |--------------------------------------------------------------------------
            | Account Holder Name
            |--------------------------------------------------------------------------
            */

            if (
                typeof bank.accountHolderName !== "string" ||
                bank.accountHolderName.trim() === ""
            ) {
                errors.accountHolderName =
                    "Account holder name is required.";
            }


            /*
            |--------------------------------------------------------------------------
            | Account Number
            |--------------------------------------------------------------------------
            */

            if (
                typeof bank.accountNumber !== "string" ||
                bank.accountNumber.trim() === ""
            ) {
                errors.accountNumber =
                    "Account number is required.";
            }


            /*
            |--------------------------------------------------------------------------
            | IFSC Code
            |--------------------------------------------------------------------------
            */

            if (
                typeof bank.ifscCode !== "string" ||
                bank.ifscCode.trim() === ""
            ) {
                errors.ifscCode =
                    "IFSC code is required.";
            }


            /*
            |--------------------------------------------------------------------------
            | Bank Name
            |--------------------------------------------------------------------------
            */

            if (
                typeof bank.bankName !== "string" ||
                bank.bankName.trim() === ""
            ) {
                errors.bankName =
                    "Bank name is required.";
            }


            /*
            |--------------------------------------------------------------------------
            | Branch Name
            |--------------------------------------------------------------------------
            |
            | Optional.
            | null is allowed.
            |
            */

            if (
                bank.branchName !== undefined &&
                bank.branchName !== null &&
                typeof bank.branchName !== "string"
            ) {
                errors.branchName =
                    "Branch name must be a string or null.";
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Allowed Fields
    |--------------------------------------------------------------------------
    |
    | These are the ONLY fields that the doctor is allowed
    | to send to the PATCH endpoint.
    |
    */

    const allowedFields = [
        "name",
        "profilePhotoKey",
        "dateOfBirth",
        "gender",
        "phone",
        "experienceYears",
        "medicalRegistrationNumber",
        "medicalRegistrationAuthority",
        "bio",
        "hospitalOrClinicName",
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "postalCode",
        "country",
        "offlineConsultationFee",
        "qualificationIds",
        "specialityIds",
        "primarySpecialityId",
        "bank",
    ];


    /*
    |--------------------------------------------------------------------------
    | Check Unsupported Fields
    |--------------------------------------------------------------------------
    */

    const receivedFields =
        Object.keys(data);

    for (const field of receivedFields) {

        if (!allowedFields.includes(field)) {

            errors[field] =
                "This field cannot be updated.";
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Empty PATCH Request
    |--------------------------------------------------------------------------
    */

    if (receivedFields.length === 0) {

        errors.general =
            "At least one profile field is required.";
    }


    /*
    |--------------------------------------------------------------------------
    | Return Validation Errors
    |--------------------------------------------------------------------------
    */

    return errors;
};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
    validateDoctorRegistration,
    validateDoctorProfileUpdate,
};