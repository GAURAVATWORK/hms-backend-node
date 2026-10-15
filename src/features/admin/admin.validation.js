
const ADMIN_DOCTOR_REGISTRATION_STATUSES = new Set([
    "NEW",
    "PENDING",
    "VERIFIED",
    "REJECTED",
]);

const MAX_CURSOR_LENGTH = 2048;

const createValidationError = (message, code) => {
    const error = new Error(message);

    error.code = code;
    error.statusCode = 400;

    return error;
};

const getOptionalQueryValue = (
    value,
    parameterName,
    errorCode
) => {
    if (value === undefined) {
        return null;
    }

    if (typeof value !== "string") {
        throw createValidationError(
            `${parameterName} must be a single string value`,
            errorCode
        );
    }

    const normalizedValue = value.trim();

    return normalizedValue === "" ? null : normalizedValue;
};

const validateAdminDoctorListQuery = (query = {}) => {
    const emailVerifiedValue = getOptionalQueryValue(
        query.email_verified,
        "email_verified",
        "INVALID_EMAIL_VERIFIED"
    );

    const registrationStatusValue = getOptionalQueryValue(
        query.registration_status,
        "registration_status",
        "INVALID_REGISTRATION_STATUS"
    );

    const cursor = getOptionalQueryValue(
        query.cursor,
        "cursor",
        "INVALID_CURSOR"
    );

    let emailVerified = null;
    let registrationStatus = null;

    // Accept only lowercase "true" or "false".
    if (emailVerifiedValue !== null) {
        if (
            emailVerifiedValue !== "true" &&
            emailVerifiedValue !== "false"
        ) {
            throw createValidationError(
                "email_verified must be true or false",
                "INVALID_EMAIL_VERIFIED"
            );
        }

        emailVerified = emailVerifiedValue === "true";
    }

    if (registrationStatusValue !== null) {
        if (
            !ADMIN_DOCTOR_REGISTRATION_STATUSES.has(
                registrationStatusValue
            )
        ) {
            throw createValidationError(
                "registration_status must be NEW, PENDING, VERIFIED, or REJECTED",
                "INVALID_REGISTRATION_STATUS"
            );
        }

        registrationStatus = registrationStatusValue;
    }

    // Registration review filters apply only to email-verified doctors.
    if (registrationStatus !== null) {
        if (emailVerified === false) {
            throw createValidationError(
                "registration_status cannot be combined with email_verified=false",
                "CONFLICTING_DOCTOR_FILTERS"
            );
        }

        // Normalize the effective filter so cursor validation and
        // repository queries use the same filter values.
        emailVerified = true;
    }

    if (cursor !== null && cursor.length > MAX_CURSOR_LENGTH) {
        throw createValidationError(
            "Invalid cursor",
            "INVALID_CURSOR"
        );
    }

    return {
        emailVerified,
        registrationStatus,
        cursor,
    };
};





const ALLOWED_REVIEW_STATUSES = new Set([
    "VERIFIED",
    "REJECTED",
]);

const ALLOWED_REVIEW_ITEM_TYPES = new Set([
    "IDENTITY_PROOF",
    "MEDICAL_REGISTRATION_CERTIFICATE",
    "QUALIFICATION_CERTIFICATE",
    "PROFESSIONAL_DETAILS",
    "OFFLINE_CONSULTATION_FEE",
    "BANK_DETAILS",
]);

const validateDoctorRegistrationReview = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        throw createValidationError(
            "Request body must be an object",
            "INVALID_REVIEW_BODY"
        );
    }

    const { reviews } = body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
        throw createValidationError(
            "reviews must be a non-empty array",
            "INVALID_REVIEW_ITEMS"
        );
    }

    const seenItems = new Set();

    const validatedReviews = reviews.map((review) => {
        if (
            !review ||
            typeof review !== "object" ||
            Array.isArray(review)
        ) {
            throw createValidationError(
                "Each review must be an object",
                "INVALID_REVIEW_ITEM"
            );
        }

        const { itemType, itemId, status, reason } = review;

        if (!ALLOWED_REVIEW_ITEM_TYPES.has(itemType)) {
            throw createValidationError(
                "Unsupported review item type",
                "INVALID_REVIEW_ITEM_TYPE"
            );
        }

        if (!ALLOWED_REVIEW_STATUSES.has(status)) {
            throw createValidationError(
                "Status must be VERIFIED or REJECTED",
                "INVALID_REVIEW_STATUS"
            );
        }

        if (
            itemType !== "OFFLINE_CONSULTATION_FEE" &&
            itemType !== "PROFESSIONAL_DETAILS" &&
            itemType !== "BANK_DETAILS" &&
            (
                typeof itemId !== "string" ||
                !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemId)
            )
        ) {
            throw createValidationError(
                "A valid itemId is required for this review item",
                "INVALID_REVIEW_ITEM_ID"
            );
        }

        if (
            ["OFFLINE_CONSULTATION_FEE", "PROFESSIONAL_DETAILS", "BANK_DETAILS"].includes(itemType) &&
            itemId !== undefined
        ) {
            throw createValidationError(
                "itemId is not accepted for this review item type",
                "INVALID_REVIEW_ITEM_ID"
            );
        }

        const uniqueKey = `${itemType}:${itemId ?? "singleton"}`;

        if (seenItems.has(uniqueKey)) {
            throw createValidationError(
                "Duplicate review items are not allowed",
                "DUPLICATE_REVIEW_ITEM"
            );
        }

        seenItems.add(uniqueKey);

        let normalizedReason = null;

        if (status === "REJECTED") {
            if (
                typeof reason !== "string" ||
                reason.trim().length === 0
            ) {
                throw createValidationError(
                    "A rejection reason is required",
                    "REVIEW_REJECTION_REASON_REQUIRED"
                );
            }

            normalizedReason = reason.trim();
        } else if (reason !== undefined && reason !== null) {
            throw createValidationError(
                "A rejection reason is only allowed for rejected items",
                "UNEXPECTED_REVIEW_REASON"
            );
        }

        return {
            itemType,
            ...(itemId === undefined ? {} : { itemId }),
            status,
            reason: normalizedReason,
        };
    });

    return { reviews: validatedReviews };
};


export {
    ADMIN_DOCTOR_REGISTRATION_STATUSES,
    validateAdminDoctorListQuery,
    validateDoctorRegistrationReview,
};
