import bcrypt from "bcrypt";
import crypto from "crypto";
import validateSignup, {validateResendVerification} from "./auth.validation.js";
import authRepository from "./auth.repository.js";
import {generateVerificationToken, hashToken,} from "../../utils/token.js";
import emailService from "../../services/email/email.service.js";


const generatePatientNumber = () =>{
  const randomPart = crypto.randomBytes(6)
                           .toString("hex")
                           .toUpperCase();
  return `PAT-${randomPart}`;
};

const signup = async(data) => {
  const validationResult = validateSignup(data);
  
  if(!validationResult.isValid){
    const error = new Error("Validation failed");
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    error.details = validationResult.errors;
    throw error;
  } 
  
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const name = data.name.trim();

  const existingUser = await authRepository.findUserByEmail(email);

  if(existingUser){
    const error = new Error("Email is already registered");

    error.code= "EMAIL_ALREADY_EXISTS";
    error.statusCode = 400;
    throw error;
  }
  
  const passwordHash = await bcrypt.hash(password, 12);
  
  const patientNumber = generatePatientNumber();

  const verificationToken = generateVerificationToken();

  const verificationTokenHash = hashToken(verificationToken);

  const verificationTokenExpiresAt = new Date(Date.now() + 30 * 60 *1000);



  const user = await authRepository.createPatientAccount({
   email,
   passwordHash,
   name,
   patientNumber,
   verificationTokenHash,
   verificationTokenExpiresAt,
  });
  
await emailService.sendVerificationEmail({
  email,
  verificationToken,
});

  return {
   userId: user.userId,
   patientNumber: user.patientNumber,
   email: user.email,
   name: user.name
  };
};


const verifyEmail = async(token) => {

  if(!token || !token.trim()){
    const error = new Error("Verification token is required");
    error.code = "VERIFICATION_TOKEN_REQUIRED";
    error.statusCode = 400;
    throw error;
  }
  
  const tokenHash = hashToken(token);
  
  const result = await authRepository.verifyEmailToken(tokenHash);

  if(result.status == "NOT_FOUND"){
    const error = new Error("Invalid verification token");
    error.code = "INVALID_VRIFICATION_TOKEN";
    error.statusCode = 400;
    throw error;
  }

  if(result.status == "ALREADY_USED"){
    const error = new Error("Verification token has already been used");
    error.code = "VERIFICATION_TOKEN_ALREADY_USED";
    error.statusCode = 400;
    throw error;
  }

  if(result.status == "EXPIRED"){
    const error = Error("Verification token has expired");
    error.code = "VERIFICATION_TOKEN_EXPIRED";
    error.statusCode = 400;
    throw error;
  }

  return {
    userId: result.userId,
    email: result.email,
  };
};

const resendVerification = async (data) => {
 
  const validationResult = validateResendVerification(data);

  if(!validationResult.isValid){
    const erorr = new Error("Validation failed");
    erorr.code = "VALIDATION_ERROR";
    erorr.statusCode = 400;
    erorr.details = validationResult.errors;
    throw erorr;
  }
  
  const email = data.email.trim().toLowerCase();

  const user = await authRepository.findUserByEmail(email);

if(!user){
    const error = new Error(
        "Unable to proceed verification request"
    );

    error.code = "VERIFICATION_RESEND_FAILED";
    error.statusCode = 400;

    throw error;
}

if(user.is_email_verified){
    const error = new Error(
        "Email is already verified"
    );

    error.code = "EMAIL_ALREADY_VERIFIED";
    error.statusCode = 400;

    throw error;
}

  const verificationToken = generateVerificationToken();

  const verificationTokenHash = hashToken(verificationToken);

  const verificationTokenExpiresAt = new Date(Date.now() + 30 * 60 *1000);

  await authRepository.replaceEmailVerificationToken({
    userId: user.id,
    verificationTokenHash,
    verificationTokenExpiresAt,
  });

  await emailService.sendVerificationEmail({
   email,
   name: user.name,
   verificationToken,
  });

  return {
   email 
  };


};

export default{
    signup,
    verifyEmail,
    resendVerification
};