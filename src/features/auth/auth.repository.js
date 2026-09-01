import pool from "../../config/database.js";

const findUserByEmail = async (email) => {
//  const result = await pool.query(
//    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
//    [email]

const result = await pool.query(
    `SELECT 
        u.id,
        u.email,
        u.is_email_verified,
        p.name
     FROM users u
     LEFT JOIN patients p
          on p.user_id = u.id
      WHERE u.email = $1
      LIMIT 1`,
      [email]
);
 return result.rows[0] ?? null;

};

const createPatientAccount = async ({
 email,
 passwordHash,
 name,
 patientNumber,
 verificationTokenHash,
 verificationTokenExpiresAt,
}) => {
        const client = await pool.connect();

        try{
            await client.query("BEGIN");
    const userResult =  await client.query(
        `INSERT INTO users(
            email,
            password_hash,
            role,
            is_email_verified,
            is_active
        )
        VALUES($1, $2, 'PATIENT', false, TRUE)
        RETURNING id, email`,
        [email, passwordHash]  
    );

        const user = userResult.rows[0];

        const patientResult = await client.query(
            `INSERT INTO patients(
            user_id,
            patient_number,
            name
            )
            VALUES($1, $2, $3)
            RETURNING user_id, patient_number, name`,
            [
                user.id,
                patientNumber,
                name
            ]

        );
        
        const patient = patientResult.rows[0];

        await client.query(
        `INSERT INTO email_verification_tokens(
         user_id,
         token_hash,
         expires_at
        )
        VALUES ($1, $2, $3)`,
        [
            user.id,
            verificationTokenHash,
            verificationTokenExpiresAt
        ]  
             
    );  


       await client.query("COMMIT");


        return {
            userId: user.id,
            email: user.email,
            patientNumber: patient.patient_number,
            name: patient.name
        };
     } catch (error){
        await client.query("ROLLBACK");
        
        throw error;

        } finally{
            client.release();
        }
};



const verifyEmailToken = async (tokenHash) => {
 
    const client = await pool.connect();

    try{

        await client.query("BEGIN");
        
        const tokenRsult = await client.query(
        `SELECT 
           evt.id,
           evt.user_id,
           evt.expires_at,
           evt.used_at,
           u.email
           FROM email_verification_tokens evt
           INNER JOIN users u
           on u.id = evt.user_id
           where evt.token_hash = $1
           LIMIT 1
           FOR UPDATE OF evt`,
           [tokenHash]
        );

        const verificationToken = tokenRsult.rows[0] ?? null;

        if(!verificationToken){
            await client.query("ROLLBACK");
            
            return{
                status: "NOT_FOUND",
            };
        }

        if(new Date(verificationToken.expires_at) <= new Date()){
            await client.query("ROLLBACK");
            
            return{
                status: "EXPIRED",
            }
        }

        if (verificationToken.used_at) {
            await client.query("ROLLBACK");

            return {
        status: "ALREADY_USED",
        };
      }

        const userResult = await client.query(
         `UPDATE users
          SET
            is_email_verified = TRUE,
            updated_at = NOW()
            WHERE id = $1
            RETURNING id, email `,
            [verificationToken.user_id]
         );

        const user = userResult.rows[0] ?? null;
        
        if(!user){
                  throw new Error("User associated with verification token was not found");
        }
      
        await client.query(
       `UPDATE email_verification_tokens
         SET used_at = NOW()
         WHERE id = $1`,
         [verificationToken.id]
        );

        await client.query("COMMIT");

        return {
         status: "VERIFIED",
        //  userId: user.id,
        //  email: user.email,
        };
 } catch (error){
    await client.query("ROLLBACK");
    throw error;

    } finally{
        client.release();

 }

};


const replaceEmailVerificationToken = async ({
 userId,
 verificationTokenHash,
 verificationTokenExpiresAt
}) =>{
  const client = await pool.connect();

  try{

    await client.query("BEGIN");

    await client.query(
    `DELETE FROM email_verification_tokens
    WHERE user_id = $1`,
    [userId]
  );

  await client.query(
  `INSERT INTO email_verification_tokens(
   user_id,
   token_hash,
   expires_at
  )
   VALUES($1, $2, $3)`,
   [
    userId,
    verificationTokenHash,
    verificationTokenExpiresAt,
   ]
  );

  await client.query("COMMIT");

  } catch(error){
    await client.query("ROLLBACK");
    throw error;

  } finally{
    client.release();

  }
  
 


};


const authRepository = {
    findUserByEmail,
    createPatientAccount,
    verifyEmailToken,
    replaceEmailVerificationToken,
};

export default authRepository;