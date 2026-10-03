import { findAllIdentityProofTypes } from "./identity-proof.repository.js";

const getIdentityProofTypes = async () =>{

    const identityProofTypes = await findAllIdentityProofTypes();
    return identityProofTypes;
};

export {
   getIdentityProofTypes, 
};
