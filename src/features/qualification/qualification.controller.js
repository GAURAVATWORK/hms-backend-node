import {
    getQualifications,
} from "./qualification.service.js";

import {
    toQualificationListDto,
} from "./qualification.dto.js";


const getQualificationsController = async (req, res) => {

    try {

        const qualifications =
            await getQualifications();


        const response = {
            success: true,
            data: toQualificationListDto(
                qualifications
            ),
        };


        res.statusCode = 200;

        res.setHeader(
            "Content-Type",
            "application/json"
        );


        res.end(
            JSON.stringify(response)
        );

    } catch (error) {

        throw error;
    }
};


export {
    getQualificationsController,
};