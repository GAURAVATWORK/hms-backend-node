const toAdminDoctorListItemDto = (doctor) => ({
    userId: doctor.user_id,
    email: doctor.email,
    emailVerified: doctor.is_email_verified,
    isActive: doctor.is_active,
    name:doctor.name,
    doctorNumber:doctor.doctor_number,
    registrationStatus:doctor.doctor_registration_status,
});



const toAdminDoctorListResponseDto = ({
    rows,
    nextCursor,
    message = "Doctors retrieved successfully",
}) => ({
    success: true,
    message,
    data: rows.map(toAdminDoctorListItemDto),
    nextCursor,
});

export {
    toAdminDoctorListItemDto,
    toAdminDoctorListResponseDto,
};