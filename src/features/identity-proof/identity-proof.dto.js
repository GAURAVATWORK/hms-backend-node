const toIdentityProofTypeDto = (identityProofType) =>{

    return {
     id: identityProofType.id,
     code:identityProofType.code,
     name:identityProofType.name,
     description:identityProofType.description
    };
};

const toIdentityProofTypeListDto = (identityProofTypes)=>{

    return identityProofTypes.map(toIdentityProofTypeDto);
};

export {
    toIdentityProofTypeDto,
    toIdentityProofTypeListDto
};