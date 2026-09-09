import {getImageUrl} from "../../services/storage/image-url.service.js";


const toSpecialityResponse = (speciality) => {

    return {
     specialityId: speciality.id,
     code: speciality.code,
     name: speciality.name,
     description: speciality.description,
     imageUrl: getImageUrl(speciality.image_key)
    };
};

const toSpecialitiesResponse = (specialities) => {
return specialities.map(toSpecialityResponse);
};


export {
    toSpecialityResponse,
    toSpecialitiesResponse
}