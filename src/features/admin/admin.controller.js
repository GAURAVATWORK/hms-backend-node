import adminService from "./admin.service.js";
import {validateAdminDoctorListQuery,} from "./admin.validation.js";
import {validateDoctorRegistrationReview ,} from "./admin.validation.js";

const getAdminDoctorListController = async (req, res) => {
 
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host}`
  );

  const query = Object.fromEntries(
    requestUrl.searchParams.entries()
  );
   
 const filters = validateAdminDoctorListQuery(query);
 
 const response = await adminService.getDoctorList(filters);

 res.statusCode = 200;

 res.setHeader(
    "Content-Type",
    "application/json"
 );

 res.end(
    JSON.stringify(response)
 );

};

const getAdminDoctorDetailController = async (req, res) => {
 const {doctorId} = req.params;

 const response = await adminService.getDoctorDetail(doctorId);

 res.statusCode = 200;
 res.setHeader("Content-Type", "application/json");
 res.end(JSON.stringify(response));
};



const reviewDoctorRegistrationController = async (req, res) => {
    const { doctorId } = req.params;

    // The reviewer identity comes from the verified access token.
    const reviewedBy = req.user.id;

    const body = await readJsonBody(req);
    const validatedReview = validateDoctorRegistrationReview(body);

    const response = await adminService.reviewDoctorRegistration({
        doctorId,
        reviewedBy,
        reviews: validatedReview.reviews,
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
};

export {
    getAdminDoctorListController,
    getAdminDoctorDetailController,
    reviewDoctorRegistrationController
}