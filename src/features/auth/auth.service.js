import bcrypt from "bcrypt";
import crypto from "crypto";
import validateSignup, {validateForgotPassword, validateLogin, validateResendVerification, validateResetPassword} from "./auth.validation.js";
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


const login = async (data) => {
const validationResult = validateLogin(data);
 
if(!validationResult.isValid){
  const error = new Error("Validation failed");
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  error.details = validationResult.errors;
  throw error;
} 

const email = data.email.trim().toLowerCase();
const password = data.password;

const user = await authRepository.findUserForLogin(email);

if(!user){
          const error = new Error("Invalid email or password");
          error.code = "INVALID_CREDENTIALS";
          error.statusCode = 401;
        throw error;

}


if(!user.is_email_verified){
  const error = new Error("Please verify your email before login in");
  error.code = "EMAIL_NOT_VERIFIED";
  error.statusCode= 403;
  throw error;
}

if(!user.is_active){
  const error = new Error("Your account is inactive");
  error.code = "ACCOUNT_INACTIVE";
  error.statusCode = 403;
  throw error;
}

const passwordMatch = await bcrypt.compare(
  password,
  user.password_hash
);

if(!passwordMatch){
  const error = new Error("Invalid email or password");
  error.code = "INVALID_CREDENTIALS";
  error.statusCode = 401;
  throw error;
}

// token generation will be added next

return{
  userId: user.id,
  name:  user.name,
  email: user.email,
  role:  user.role 
};
};


const forgotPassword = async (data) => {
 const validationResult =  validateForgotPassword(data);

 if(!validationResult.isValid){
  const error = new Error("Validation failed");
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  error.details = validationResult.errors;
  throw error;
 }

 const email = data.email.trim().toLowerCase();

 const user  = await authRepository.findUserForPasswordReset(email);


 if(!user){
  return{
  email
  };
 }

 const resetToken = generateVerificationToken();

 const resetTokenHash = hashToken(resetToken);

 const resetTokenExpiresAt = new Date(
  Date.now() + 30 * 60 * 1000
 );

 await authRepository.replacePasswordResetToken({
  userId:user.id,
  resetTokenHash,
  resetTokenExpiresAt
 });

 await emailService.sendPasswordResetEmail({
  email:user.email,
  name: user.name,
  resetToken
 });

 return {
  email
 };

};


const resetPassword = async (data) =>{

  const validationResult = validateResetPassword(data);

  if(!validationResult.isValid){
    const error = new Error("Validation failed");
    
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    error.details = validationResult.errors;
    throw error;
  }

  const token = data.token.trim();

  const newPassword = data.newPassword;


  const tokenHash = hashToken(token);

  const passwordHash = await bcrypt.hash(
    newPassword,
    12
  );

  const result = await authRepository.resetPassword({
  tokenHash,
  passwordHash
  });

  if(result.status === "NOT_FOUND"){
    const error = new Error("Invalid password reset token");
    error.code = "INVALID_RESET_TOKEN";
    error.statusCode = 400;
    throw error;
  }

  if(result.status === "ALREADY_USED"){
    const error = new Error("Password reset token has already been used");
    
    error.code = "RESET_TOKEN_ALREADY_USED";
    error.statusCode = 400;
    throw error;
  }

  if(result.status === "EXPIRED"){
    const error = new Error("Password reset token has expired");

    error.code = "RESET_TOKEN_EXPIRED";
    error.statusCode = 400;
    throw error;
  }

  if(result.status === "USER_NOT_FOUND"){
    const error = new Error("Unable to reset password");

    error.code = "PASSWORD_RESET_FAILED";
    error.statusCode = 400;
    throw error;
  }

  return{
    message: "Password reset successfully"
  };

};


export default{
    signup,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    resetPassword,
};