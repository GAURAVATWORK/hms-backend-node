import readJsonBody from "../../utils/read-json-body.js";
import {getDoctorProfile, submitDoctorRegistration, updateDoctorProfile} from "./doctor.service.js";
import { toDoctorProfileDto, toDoctorRegistrationDto } from "./doctor.dto.js";

const registerDoctorController = async (req, res) =>{

    const body = await readJsonBody(req);
    
    const doctorId = req.user.id;

    const doctor = await submitDoctorRegistration(
        doctorId,
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


const getDoctorProfileController = async(req, res) =>{

    const doctorId = req.user.id;

    const doctor = await getDoctorProfile(doctorId);

    const data = toDoctorProfileDto(doctor);

    const response = {
        success: true,
        data,
    };

    res.statusCode = 200;

    res.setHeader(
        "Content-Type",
        "application/json"
    );
   
    res.end(
        JSON.stringify(response)
    );

};

const updateDoctorProfileController = async (req, res) => {

    /*
     * Read the JSON request body.
      */
    const body = await readJsonBody(req);


    /*
     * Doctor ID comes from the authenticated access token.
     *
     * We never accept doctorId from the request body.
     */
    const doctorId = req.user.id;


    /*
     * Send the Doctor ID and requested profile changes
     * to the service layer.
          */
    const doctor = await updateDoctorProfile(
        doctorId,
        body
    );


    /*
     * Convert database/service data into the
     * public API response format.
     */
    const data = toDoctorProfileDto(doctor);


    /*
     * Standard API response.
     */
    const response = {
        success: true,
        data,
    };


    /*
     * HTTP 200
     *
     * The PATCH request has been processed successfully.
     */
    res.statusCode = 200;


    /*
     * Tell the client that the response is JSON.
     */
    res.setHeader(
        "Content-Type",
        "application/json"
    );


    /*
     * Send the response.
     */
    res.end(
        JSON.stringify(response)
    );
};

export {
    registerDoctorController,
    getDoctorProfileController,
    updateDoctorProfileController,
  };
