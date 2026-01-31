# Final Project: Tackling Dropout Issues in an Edutech Institution

## Business Understanding

This educational institution faces a serious challenge: **high student dropout rates**.  
This issue leads to lower graduation rates, increased administrative burden, and reduced academic resource efficiency.

The academic department requires a **data-driven approach** to understand the key factors behind student dropout and implement effective retention strategies.

### Business Problem

- High student dropout rate (**approximately 32.12%** of the total population).  
- Dropouts are **predominantly Portuguese students**.  
- **Lack of scholarship support** is a strong contributing factor.  
- **Low academic performance** in the first two semesters strongly correlates with dropout.  
- **Older students at enrollment** are at higher risk of not completing their studies.  
- Certain study programs, such as **Management (Evening)** and **Nursing**, have the highest dropout rates.  

### Project Scope

- Analyze the **factors contributing to student dropout** using higher education data.  
- Build a **dashboard** to visualize dropout by demographic, financial, and academic factors.  
- Develop a **predictive model (XGBoost)** to estimate the likelihood of dropout.  
- Provide **data-driven policy recommendations** to reduce dropout rates.  

## Machine Learning Pipeline

1. **Data Preparation**  
   - Source: Education Dataset (https://github.com/dicodingacademy/dicoding_dataset/tree/main/students_performance)  
   - Handle missing values, categorical encoding (OrdinalEncoder), and scaling (MinMaxScaler).  

2. **Data Splitting & Oversampling**  
   - Split the dataset into training and test sets.  
   - Apply **SMOTE** on the training set to balance class distribution.  

3. **Feature Selection & Model Training**  
   - Identify important features affecting dropout.  
   - Train **XGBoost Classifier** using key features.  

4. **Evaluation**  
   - Metrics: Accuracy, Precision, Recall, F1-score, ROC-AUC.  
   - Confusion matrix analysis to assess predictive performance.  

5. **Deployment**  
   - Model artifacts saved in `/model` folder:
     ```
     project/
     ├── model/
     │   ├── best_xgb_model.joblib 
     │   ├── important_features.pkl 
     │   ├── pca_model.pkl 
     │   └── scaler.pkl 
     ├── app.py 
     ├── requirements.txt 
     └── README.md
     ```
   - **Run the Streamlit interface**: (https://sansnath-portfolio-samuel-education-analysisapp-mnvsil.streamlit.app/)  

## Business Dashboard

The dashboard focuses on:

- Dropout by **Nationality**  
- Dropout by **Scholarship & Debtor Status**  
- Dropout by **First Two Semesters GPA**  
- Dropout by **Age at Enrollment**  
- Dropout by **Study Program**  

This helps the institution:

- Identify student groups with the highest risk of dropout.  
- Discover the academic and financial factors most influencing dropout.  
- Gain actionable insights for student support policies.  

**View the Dashboard:** (https://public.tableau.com/app/profile/samuel.sitompul/viz/UniversityDropoutAnalytics/Dashboard1?publish=yes)  

## Conclusion

- **Dropout rate:** 32.12%  
- **Dominant factors:** Portuguese nationality, lack of financial support  
- **Key predictors:** Low academic performance in early semesters  
- **High-risk groups:** Older students, debtor status  
- **Programs needing attention:** Management (Evening), Nursing  

### Recommended Action Items

1. **Nationality & Age**  
   - Most dropouts are older Portuguese students.  
   - Implement fast-track orientation and academic support for this group.  

2. **Financial Support**  
   - Lack of scholarships and debtor status increases dropout risk.  
   - Expand scholarship and financial aid programs for high-risk students.  

3. **Early Academic Performance**  
   - Low GPA in the first two semesters indicates weak academic adaptation.  
   - Implement an Early Warning System (EWS) and mandatory remedial programs for students with GPA < 8.0.  

4. **High-Risk Study Programs**  
   - Programs like Management (Evening) and Nursing have the highest dropout rates.  
   - Evaluate curriculum and workload, and provide additional academic support for students in these programs.
