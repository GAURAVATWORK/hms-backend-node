import { getIdentityProofTypes } from "./identity-proof.service.js";
import { toIdentityProofTypeListDto } from "./identity-proof.dto.js";

const getIdentityProofTypesController = async (req, res) => {

    const identityProofTypes = await getIdentityProofTypes();

    const data = toIdentityProofTypeListDto(
        identityProofTypes
    );

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

export {
    getIdentityProofTypesController,
};