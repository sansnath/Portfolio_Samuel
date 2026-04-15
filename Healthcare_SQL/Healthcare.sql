use medical;
CREATE TABLE healthcare_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Age INT,
    Gender VARCHAR(10),
    BloodType VARCHAR(5),
    MedicalCondition VARCHAR(100),
    DateofAdmission DATE,
    Doctor VARCHAR(100),
    Hospital VARCHAR(150),
    InsuranceProvider VARCHAR(100),
    BillingAmount DECIMAL(15,2),
    RoomNumber INT,
    AdmissionType VARCHAR(50),
    DischargeDate DATE,
    Medication VARCHAR(100),
    TestResults VARCHAR(50)
);

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/healthcare_dataset.csv'
INTO TABLE healthcare_data
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(Name, Age, Gender, BloodType, MedicalCondition,
 DateofAdmission, Doctor, Hospital, InsuranceProvider,
 BillingAmount, RoomNumber, AdmissionType,
 DischargeDate, Medication, TestResults);

select * from healthcare_data;

-- Easy Question
-- 1. Siapa pasien dengan umur paling tua dalam dataset?
select lower(name) as nama, age, gender
from healthcare_data
where age = (
select max(age) from healthcare_data
)
order by nama desc;

-- 2. Rumah sakit mana yang memiliki jumlah pasien terbanyak?
select hospital, count(*) as jumlah_pasien
from healthcare_data
group by hospital
order by jumlah_pasien desc;

-- 3. Rumah sakit mana yang menghasilkan total pendapatan (billing) terbesar?
select hospital, count(*) as jumlah_pasien, sum(billingamount) as total_pendapatan
from healthcare_data
group by hospital
order by total_pendapatan desc
limit 10;

-- 4. Siapa pasien yang mengeluarkan biaya paling besar secara keseluruhan?
select lower(name), count(name) as total_kunjungan, sum(billingamount) as total_biaya
from healthcare_data
group by lower(name)
order by total_biaya desc
limit 10;

-- Moderate Question
-- 1. Tampilkan daftar pasien dengan kondisi medis tertentu (misalnya Cancer), urutkan berdasarkan nama.
select lower(name), age, medicalcondition, hospital, doctor
from healthcare_data
where medicalcondition = 'Cancer'
order by name desc;

-- 2. Dokter mana yang menangani pasien paling banyak?
select doctor, count(*) as jumlah_pasien
from healthcare_data
group by doctor
order by jumlah_pasien desc;

-- Tampilkan pasien yang memiliki lama rawat inap lebih lama dari rata-rata seluruh pasien.
WITH base AS (
    SELECT 
        LOWER(name) AS name,
        age,
        gender,
        DATEDIFF(DischargeDate, DateofAdmission) AS rawat_inap
    FROM healthcare_data
    WHERE DischargeDate IS NOT NULL
)
SELECT *,
       AVG(rawat_inap) OVER () AS avg_rawat_inap
FROM base
WHERE rawat_inap > (
    SELECT AVG(rawat_inap) FROM base
)
ORDER BY rawat_inap DESC;

-- Advanced
-- 1. Hitung total biaya (billing) untuk setiap jenis kondisi medis.
select medicalcondition, round(sum(billingamount),0) as total_biaya
from healthcare_data
group by medicalcondition
order by total_biaya desc;

-- 2. Tentukan kondisi medis yang paling sering muncul pada masing-masing gender. 
with ranked_gender as(
select gender, medicalcondition, count(medicalcondition) as total_terkena,
rank() over (partition by gender order by count(medicalcondition) desc) as ranking 
from healthcare_data
group by gender, medicalcondition
)
select gender, medicalcondition, total_terkena, ranking
from ranked_gender
where ranking < 4
group by gender, medicalcondition;

-- 3. Cari pasien dengan total biaya terbesar di setiap rumah sakit.
with ranked_billing as(
select lower(name) as nama, hospital, sum(billingamount) as total_biaya, RANK() OVER (PARTITION BY hospital ORDER BY SUM(billingamount) DESC) as ranking from healthcare_data group by lower(name), hospital
) 
select nama, hospital, total_biaya
from ranked_billing 
where ranking = 1
order by total_biaya desc;

-- 4. Analisis hubungan antara Admission Type dengan biaya (rata-rata, maksimum).
select admissiontype, round(avg(billingamount),2) as rata_rata_bill, max(billingamount) as maksimal_bill, min(billingamount) as minimum_bill
from healthcare_data
group by admissiontype