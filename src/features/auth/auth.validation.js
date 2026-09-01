const hasValue = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== ""
    );
};

const validateSignup = (data) => {
    const errors = {};

    const { email, password, name } = data;

    if (!hasValue(email)) {
        errors.email = "Email is required";
    } else if (typeof email !== "string") {
        errors.email = "Email must be a string";
    } else if (email.trim().length > 255) {
        errors.email = "Email must not exceed 255 characters";
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        errors.email = "Email format is invalid";
    }

    if (!hasValue(password)) {
        errors.password = "Password is required";
    } else if (typeof password !== "string") {
        errors.password = "Password must be a string";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    } else if (password.length > 128) {
        errors.password = "Password must not exceed 128 characters";
    }

    if (!hasValue(name)) {
        errors.name = "Name is required";
    } else if (typeof name !== "string") {
        errors.name = "Name must be a string";
    } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 100) {
        errors.name = "Name must not exceed 100 characters";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};


const validateResendVerification = (data) => {

    const errors = {};

    if(!data || typeof data.email !== "string"){
        errors.email = "Email is required";
    } else {
        const email = data.email.trim();
        if(!email){
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Invalid email format";
        }
    }

    return {
     isValid: Object.keys(errors).length === 0,
     errors,
    };


};

export { validateResendVerification };

export default validateSignup;