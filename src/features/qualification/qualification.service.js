import {
    findActiveQualifications,
} from "./qualification.repository.js";

const getQualifications = async () => {
    return await findActiveQualifications();
};

export {
    getQualifications,
};
