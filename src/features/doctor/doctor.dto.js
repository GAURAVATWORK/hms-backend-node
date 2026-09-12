const toDoctorRegistrationDto = (doctor) => {

    return {
            doctorId: doctor.user_id,
        doctorNumber: doctor.doctor_number,
        name: doctor.name,
        registrationStatus:
            doctor.doctor_registration_status,
    };
};

export {toDoctorRegistrationDto,}