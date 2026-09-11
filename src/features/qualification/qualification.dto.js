const toQualificationDto = (qualification) => {
    return {
        qualificationId: qualification.id,
        code: qualification.code,
        name: qualification.name,
        description: qualification.description,
    };
};

const toQualificationListDto = (qualifications) => {
    return qualifications.map(toQualificationDto);
};

export {
    toQualificationDto,
    toQualificationListDto,
};
