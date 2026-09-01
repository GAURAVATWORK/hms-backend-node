ALTER TABLE patients
ADD COLUMN name VARCHAR(200);

UPDATE patients
SET name = CONCAT_WS(' ', first_name, last_name);

ALTER TABLE patients
ALTER COLUMN name SET NOT NULL;

ALTER TABLE patients
DROP COLUMN first_name,
DROP COLUMN last_name;
