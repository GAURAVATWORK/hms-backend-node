const ALLOWED_FIELDS = new Set([
    "profilePhotoUrl",
    "name",
    "dateOfBirth",
    "gender",
    "phone",
    "address",
    "bloodGroup",
    "emergencyContact"
]);

const ADDRESS_FIELDS = new Set([
    "line1",
    "line2",
    "city",
    "state",
    "postalCode",
    "country"
]);

const EMERGENCY_CONTACT_FIELDS = new Set([
    "name",
    "phone",
    "relationship"
]);

const GENDER_VALUES = new Set([
    "MALE",
    "FEMALE",
    "OTHER"
]);

const BLOOD_GROUP_VALUES = new Set([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
]);

const MAX_LENGTHS = {
    profilePhotoUrl: 2048,
    name: 200,
    phone: 20,

    "address.line1": 255,
    "address.line2": 255,
    "address.city": 100,
    "address.state": 100,
    "address.postalCode": 20,
    "address.country": 100,

    "emergencyContact.name": 150,
    "emergencyContact.phone": 20,
    "emergencyContact.relationship": 50
};

const createValidationError = (
    message,
    details = []
) => {
    const error = new Error(message);

    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    error.details = details;

    return error;
};

const assertObject = (
    value,
    fieldName
) => {
    if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        throw createValidationError(
            `${fieldName} must be an object`
        );
    }
};

const validateString = (
    value,
    fieldName,
    {
        nullable = true,
        minLength = 1,
        maxLength
    } = {}
) => {

    if (value === null) {

        if (nullable) {
            return;
        }

        throw createValidationError(
            `${fieldName} cannot be null`
        );
    }

    if (typeof value !== "string") {
        throw createValidationError(
            `${fieldName} must be a string`
        );
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < minLength) {
        throw createValidationError(
            `${fieldName} cannot be empty`
        );
    }

    if (
        maxLength !== undefined &&
        trimmedValue.length > maxLength
    ) {
        throw createValidationError(
            `${fieldName} must not exceed ${maxLength} characters`
        );
    }
};

const validateDateOfBirth = (
    value
) => {

    if (value === null) {
        return;
    }

    if (typeof value !== "string") {
        throw createValidationError(
            "dateOfBirth must be a string"
        );
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        throw createValidationError(
            "dateOfBirth must use YYYY-MM-DD format"
        );
    }

    const date = new Date(
        `${value}T00:00:00.000Z`
    );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        throw createValidationError(
            "dateOfBirth must be a valid date"
        );
    }

    const [year, month, day] =
        value.split("-").map(Number);

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        throw createValidationError(
            "dateOfBirth must be a valid calendar date"
        );
    }

    const today = new Date();

    const todayUtc = new Date(
        Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        )
    );

    if (date > todayUtc) {
        throw createValidationError(
            "dateOfBirth cannot be in the future"
        );
    }
};

const validateEnum = (
    value,
    fieldName,
    allowedValues
) => {

    if (value === null) {
        return;
    }

    if (typeof value !== "string") {
        throw createValidationError(
            `${fieldName} must be a string`
        );
    }

    if (!allowedValues.has(value)) {
        throw createValidationError(
            `${fieldName} has an invalid value`
        );
    }
};

const validateAddress = (
    address
) => {

    assertObject(
        address,
        "address"
    );

    const fields =
        Object.keys(address);

    for (const field of fields) {

        if (!ADDRESS_FIELDS.has(field)) {
            throw createValidationError(
                `Unsupported address field: ${field}`
            );
        }
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "line1"
        )
    ) {
        validateString(
            address.line1,
            "address.line1",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.line1"]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "line2"
        )
    ) {
        validateString(
            address.line2,
            "address.line2",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.line2"]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "city"
        )
    ) {
        validateString(
            address.city,
            "address.city",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.city"]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "state"
        )
    ) {
        validateString(
            address.state,
            "address.state",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.state"]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "postalCode"
        )
    ) {
        validateString(
            address.postalCode,
            "address.postalCode",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.postalCode"]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            address,
            "country"
        )
    ) {
        validateString(
            address.country,
            "address.country",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS["address.country"]
            }
        );
    }
};

const validateEmergencyContact = (
    emergencyContact
) => {

    assertObject(
        emergencyContact,
        "emergencyContact"
    );

    const fields =
        Object.keys(emergencyContact);

    for (const field of fields) {

        if (
            !EMERGENCY_CONTACT_FIELDS.has(
                field
            )
        ) {
            throw createValidationError(
                `Unsupported emergencyContact field: ${field}`
            );
        }
    }

    if (
        Object.prototype.hasOwnProperty.call(
            emergencyContact,
            "name"
        )
    ) {
        validateString(
            emergencyContact.name,
            "emergencyContact.name",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS[
                        "emergencyContact.name"
                    ]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            emergencyContact,
            "phone"
        )
    ) {
        validateString(
            emergencyContact.phone,
            "emergencyContact.phone",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS[
                        "emergencyContact.phone"
                    ]
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            emergencyContact,
            "relationship"
        )
    ) {
        validateString(
            emergencyContact.relationship,
            "emergencyContact.relationship",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS[
                        "emergencyContact.relationship"
                    ]
            }
        );
    }
};

const validateProfileUpdate = (
    body
) => {

    assertObject(
        body,
        "Request body"
    );

    const fields =
        Object.keys(body);

    if (fields.length === 0) {
        throw createValidationError(
            "At least one profile field is required"
        );
    }

    for (const field of fields) {

        if (!ALLOWED_FIELDS.has(field)) {
            throw createValidationError(
                `Unsupported profile field: ${field}`
            );
        }
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "profilePhotoUrl"
        )
    ) {
        validateString(
            body.profilePhotoUrl,
            "profilePhotoUrl",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS.profilePhotoUrl
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "name"
        )
    ) {
        validateString(
            body.name,
            "name",
            {
                nullable: false,
                maxLength:
                    MAX_LENGTHS.name
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "dateOfBirth"
        )
    ) {
        validateDateOfBirth(
            body.dateOfBirth
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "gender"
        )
    ) {
        validateEnum(
            body.gender,
            "gender",
            GENDER_VALUES
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "phone"
        )
    ) {
        validateString(
            body.phone,
            "phone",
            {
                nullable: true,
                maxLength:
                    MAX_LENGTHS.phone
            }
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "address"
        )
    ) {
        validateAddress(
            body.address
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "bloodGroup"
        )
    ) {
        validateEnum(
            body.bloodGroup,
            "bloodGroup",
            BLOOD_GROUP_VALUES
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(
            body,
            "emergencyContact"
        )
    ) {
        validateEmergencyContact(
            body.emergencyContact
        );
    }

    return body;
};

export {
    validateProfileUpdate
};