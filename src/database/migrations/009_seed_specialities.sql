INSERT INTO specialities (
    code,
    name,
    description,
    image_key,
    is_active,
    sort_order
)
VALUES
(
    'CARDIOLOGY',
    'Cardiology',
    'Heart and cardiovascular system care, including diagnosis and treatment of cardiac conditions.',
    'specialities/cardiology.svg',
    TRUE,
    1
),
(
    'NEUROLOGY',
    'Neurology',
    'Treatment of brain, nerves, and neurological disorders affecting movement, memory, and function.',
    'specialities/neurology.svg',
    TRUE,
    2
),
(
    'ORTHOPAEDICS',
    'Orthopaedics',
    'Bone, joint, muscle and spine care including fractures, arthritis, and injuries.',
    'specialities/orthopaedics.svg',
    TRUE,
    3
),
(
    'GASTROENTEROLOGY',
    'Gastroenterology',
    'Digestive system care covering stomach, intestines, liver, and pancreas disorders.',
    'specialities/gastroenterology.svg',
    TRUE,
    4
),
(
    'GENERAL_MEDICINE',
    'General Medicine',
    'Primary medical care for common illnesses, chronic diseases, and preventive health.',
    'specialities/general-medicine.svg',
    TRUE,
    5
),
(
    'PULMONOLOGY',
    'Pulmonology',
    'Respiratory system care including asthma, COPD, lung infections, and breathing disorders.',
    'specialities/pulmonology.svg',
    TRUE,
    6
),
(
    'PSYCHIATRY',
    'Psychiatry',
    'Mental health care including depression, anxiety, and behavioral conditions.',
    'specialities/psychiatry.svg',
    TRUE,
    7
),
(
    'ENT',
    'ENT',
    'Ear, nose and throat care including hearing loss, sinus issues, and tonsil conditions.',
    'specialities/ent.svg',
    TRUE,
    8
),
(
    'NEPHROLOGY',
    'Nephrology',
    'Kidney care including stones, infections, kidney failure, and dialysis support.',
    'specialities/nephrology.svg',
    TRUE,
    9
),
(
    'GYNECOLOGY',
    'Gynecology',
    'Women''s reproductive health, pregnancy care, menstrual disorders, and hormonal issues.',
    'specialities/gynecology.svg',
    TRUE,
    10
),
(
    'PEDIATRICS',
    'Pediatrics',
    'Child healthcare including growth, development, vaccination, and infections.',
    'specialities/pediatrics.svg',
    TRUE,
    11
),
(
    'DERMATOLOGY',
    'Dermatology',
    'Skin, hair, and nail treatments including acne, eczema, and cosmetic procedures.',
    'specialities/dermatology.svg',
    TRUE,
    12
),
(
    'OPHTHALMOLOGY',
    'Ophthalmology',
    'Eye care including vision correction, cataracts, glaucoma, and retinal diseases.',
    'specialities/ophthalmology.svg',
    TRUE,
    13
),
(
    'DENTAL',
    'Dental',
    'Oral health including teeth cleaning, cavities, braces, and cosmetic dentistry.',
    'specialities/dental.svg',
    TRUE,
    14
),
(
    'ONCOLOGY',
    'Oncology',
    'Cancer care including diagnosis, treatment, radiation therapy, and long-term survivorship.',
    'specialities/oncology.svg',
    TRUE,
    15
),
(
    'ENDOCRINOLOGY',
    'Endocrinology',
    'Hormonal and metabolic disorders including thyroid, diabetes, and PCOS.',
    'specialities/endocrinology.svg',
    TRUE,
    16
),
(
    'UROLOGY',
    'Urology',
    'Urinary tract and male reproductive health including stones, infections, and prostate care.',
    'specialities/urology.svg',
    TRUE,
    17
),
(
    'RHEUMATOLOGY',
    'Rheumatology',
    'Arthritis, joint pain, autoimmune disorders, and connective tissue diseases.',
    'specialities/rheumatology.svg',
    TRUE,
    18
),
(
    'ANDROLOGY_SEXUAL_HEALTH',
    'Andrology / Sexual Health',
    'Male sexual health, fertility, erectile dysfunction, and hormonal issues.',
    'specialities/andrology-sexual-health.svg',
    TRUE,
    19
),
(
    'GENERAL_SURGERY',
    'General Surgery',
    'Surgical care including appendix, hernia, gallbladder, and abdominal procedures.',
    'specialities/general-surgery.svg',
    TRUE,
    20
),
(
    'VASCULAR_SURGERY',
    'Vascular Surgery',
    'Blood vessel disorders including varicose veins, blockages, and vascular repair.',
    'specialities/vascular-surgery.svg',
    TRUE,
    21
),
(
    'DIABETES',
    'Diabetes',
    'Diabetes care including sugar control, monitoring, and lifestyle management.',
    'specialities/diabetes.svg',
    TRUE,
    22
),
(
    'PHYSIOTHERAPY',
    'Physiotherapy',
    'Physiotherapy and rehabilitation for pain, mobility, posture, and injury recovery.',
    'specialities/physiotherapy.svg',
    TRUE,
    23
),
(
    'NUTRITION_DIETETICS',
    'Nutrition / Dietetics',
    'Diet planning and nutrition counselling for weight, diabetes, and lifestyle health.',
    'specialities/nutrition-dietetics.svg',
    TRUE,
    24
),
(
    'FAMILY_MEDICINE',
    'Family Medicine',
    'Family medicine physicians deliver comprehensive, lifelong primary healthcare to individuals and families across all ages, genders, and stages of life.',
    'specialities/family-medicine.svg',
    TRUE,
    25
),
(
    'EMERGENCY_PHYSICIAN',
    'Emergency Physician',
    'Emergency physicians provide rapid assessment, diagnosis, and acute care to stabilize patients experiencing sudden, severe illnesses or traumatic injuries.',
    'specialities/emergency-physician.svg',
    TRUE,
    26
)
ON CONFLICT (code) DO NOTHING;