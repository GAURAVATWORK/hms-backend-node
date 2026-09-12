import readJsonBody from "../../utils/read-json-body.js";
import {submitDoctorRegistration,} from "./doctor.service.js";
import { toDoctorRegistrationDto } from "./doctor.dto.js";

const registerDoctorController = async (req, res) =>{

    const body = await readJsonBody(req);
    
    const dotorId = req.user.id;

    const doctor = await submitDoctorRegistration(
        dotorId,
        body
    );

    const data = toDoctorRegistrationDto(doctor);

    const response = {
        success: true,
        data,
    };

    res.statusCode = 200;
    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(JSON.stringify(response));

};

export {registerDoctorController, };
