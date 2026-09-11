ALTER TABLE specialities
ADD COLUMN IF NOT EXISTS online_consultation_fee NUMERIC(10,2);


ALTER TABLE specialities
ADD CONSTRAINT chk_specialities_online_consultation_fee
CHECK (
    online_consultation_fee IS NULL
    OR online_consultation_fee >= 0
);
