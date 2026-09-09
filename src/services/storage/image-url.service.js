import env from "../../config/env.js";


const getImageUrl = (imageKey) => {

    if (!imageKey) {
        return null;
    }

    return `${env.apiBaseUrl}/storage/${imageKey}`;
};


export {
    getImageUrl
};