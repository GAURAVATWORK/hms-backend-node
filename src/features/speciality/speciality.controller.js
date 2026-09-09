import {getActiveSpecialities} from "./speciality.service.js";
import {toSpecialitiesResponse} from "./speciality.dto.js";


const getSpecialities = async (req, res) => {

    const specialities = await getActiveSpecialities();

    const response = toSpecialitiesResponse(specialities);

    res.statusCode = 200;

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(
        JSON.stringify({
         success: true,
         data: response
        })
    );

};

export {getSpecialities};