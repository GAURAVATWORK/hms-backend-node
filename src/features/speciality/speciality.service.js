import {findActiveSpecialities} from "./speciality.repository.js";

const getActiveSpecialities = async() =>{
 const specialities = await findActiveSpecialities();


 if(!Array.isArray(specialities)){
    throw new Error(
        "Invalid speciality data returned from repository"
    );
     }
    
    return specialities;
};

export {getActiveSpecialities};