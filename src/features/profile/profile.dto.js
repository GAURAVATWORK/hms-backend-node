


const toProfileResponse = (profile) => {

return {
userId: profile.user_id,
email: profile.email,
role: profile.role,
patient:{
    patientNumber: profile.patient_number,
    profilePhotoUrl: profile.profile_photo_url,
    name: profile.name,
    dateOfBirth: profile.date_of_birth,
    gender: profile.gender,
    phone: profile.phone,
    address:{
        line1: profile.address_line_1,
        line2: profile.address_line_2,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postal_code,
        country: profile.country,
    },

    bloodGroup: profile.blood_group,
    emergencyContact: {
        name: profile.emergency_contact_name,
        phone: profile.emergency_contact_phone,
        relationship: profile.emergency_contact_relationship
    }
}
};
};

export {toProfileResponse};


