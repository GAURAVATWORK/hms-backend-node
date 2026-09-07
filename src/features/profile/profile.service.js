import USER_ROLES from "../../constants/roles.js";
import {findPatientProfileByUserId} from "./profile.repository.js";
import {toProfileResponse} from "./profile.dto.js";
import User_Roles from "../../constants/roles.js";

const createProfileError = (
    message,
    code,
    statusCode
) => {
    const error = new Error(message);

    error.code = code;
    error.statusCode = statusCode;
    return error;
};

const getProfile = async({
    userId,
    userType
}) => {
    if(!userId){
        throw createProfileError(
            "User identity is required",
            "USER_ID_REQUIRED",
            401
        );
    }

    if(userType === User_Roles.PATIENT){
        const profile = await findPatientProfileByUserId(
            {userId}
        );

      if(!profile){
        throw createProfileError(
            "Patient profile not found",
            "PROFILE_NOT_FOUND",
            404
        );
      }  

      return toProfileResponse(
        profile
      );

    }
    throw createProfileError(
        "Profile type is not supported yet",
        "PROFILE_TYPE_NOT_SUPPORTED",
        501
    );
};


export {getProfile};