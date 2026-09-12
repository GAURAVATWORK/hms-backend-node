import {validateDoctorRegistration,} from "./doctor.validation.js";

import { registerDoctor, } from "./doctor.repository.js";

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

export {
    submitDoctorRegistration,
}