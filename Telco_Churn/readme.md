# Telco Customer Churn Prediction

A machine learning project focused on predicting customer churn in the telecommunications industry using classification models such as Logistic Regression and Random Forest.

---

## Overview

Customer churn is one of the major challenges in the telecommunications industry. This project aims to analyze customer behavior and identify factors that influence churn decisions. By predicting churn early, companies can design more effective customer retention strategies.

The project includes:
- Exploratory Data Analysis (EDA)
- Data preprocessing and feature engineering
- Classification modeling
- Model evaluation and comparison
- Feature importance analysis

---

## Dataset

**Source:** Telco Customer Churn Dataset

The dataset contains:
- 7,043 customer records
- 21 features
- Target variable: `Churn`

### Main Features

**Demographic Features**
- Gender, SeniorCitizen, Partner, Dependents

**Service Features**
- PhoneService, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies

**Account Information**
- Tenure, Contract, PaymentMethod, MonthlyCharges, TotalCharges

---

## Project Workflow

### 1. Data Understanding
- Descriptive statistics
- Correlation analysis
- Distribution analysis
- Churn imbalance analysis

### 2. Exploratory Data Analysis (EDA)

Key findings from the analysis:
- Customers with **short tenure** are more likely to churn.
- Customers with **higher monthly charges** tend to churn more frequently.
- **Month-to-month contracts** show the highest churn rate.
- **Fiber optic users** have a higher churn tendency.
- Additional services such as **Online Security** and **Tech Support** help improve customer retention.

### 3. Data Preprocessing

Preprocessing steps include:
- Converting data types
- Handling missing values
- Removing unnecessary columns
- Checking duplicate data
- Outlier analysis
- Encoding categorical variables
- Feature scaling using `StandardScaler`

### 4. Feature Engineering

Additional features were created to improve model performance:

**Charge Ratio**
```python
charge_ratio = MonthlyCharges / (TotalCharges + 1)
```

**Tenure Group** — Customers were grouped based on subscription duration:

| Group | Duration |
|-------|----------|
| Short | < 1 year |
| Mid | 1–2 years |
| Long | 2–5 years |
| Loyal | 5+ years |

---

## Machine Learning Models

### Logistic Regression

Used as the baseline linear classification model.

**Best Parameters**
```json
{
  "C": 0.001,
  "class_weight": "balanced",
  "penalty": "l2",
  "solver": "liblinear"
}
```

**Performance**

| Metric | Score |
|--------|-------|
| Accuracy | 70.15% |
| Precision | 0.4654 |
| Recall | 0.8262 |
| F1-Score | 0.5954 |
| ROC-AUC | 0.8422 |

---

### Random Forest Classifier

Used as the main ensemble learning model.

**Best Parameters**
```json
{
  "criterion": "gini",
  "max_depth": 6,
  "max_features": "sqrt",
  "n_estimators": 300
}
```

**Performance**

| Metric | Score |
|--------|-------|
| Accuracy | 74.34% |
| Precision | 0.5111 |
| Recall | 0.7995 |
| F1-Score | 0.6236 |
| ROC-AUC | 0.8409 |

---

### Final Model Selection

**Random Forest** was selected as the final model because it provides a better balance between precision and recall while achieving higher accuracy and F1-score.

Although Logistic Regression achieved slightly higher recall, Random Forest reduced false positives and delivered more stable overall performance.

---

## Feature Importance

Top influential features from the Random Forest model:

| Feature | Importance |
|---------|------------|
| Contract | 0.2406 |
| charge_ratio | 0.1299 |
| tenure | 0.1296 |
| InternetService_Fiber optic | 0.1070 |
| MonthlyCharges | 0.0818 |
| TotalCharges | 0.0639 |
| PaymentMethod_Electronic check | 0.0505 |

---

## Key Insights

- Month-to-month contracts are highly associated with churn.
- Customers with short tenure are more vulnerable to leaving.
- High monthly charges increase churn risk.
- Fiber optic customers tend to churn more frequently.
- Customers without additional support services are less loyal.

---

## Business Recommendations

### 1. Encourage Long-Term Contracts
Provide incentives for customers to switch from month-to-month contracts to yearly plans.

### 2. Focus on Early Retention
Customers within the first 12 months require stronger onboarding and engagement programs.

### 3. Improve High-Cost Service Experience
Customers with expensive plans, especially Fiber Optic users, should receive better service quality and bundled support features.

---

## Technologies Used

- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- Seaborn

---

## Evaluation Metrics

The models were evaluated using:
- Accuracy
- Precision
- Recall
- F1-Score
- ROC-AUC
- Confusion Matrix

---

## Conclusion

This project demonstrates that machine learning can effectively identify customers with high churn risk. Contract type, tenure, and pricing-related variables are the most significant churn indicators.

The Random Forest model achieved the best overall performance and can be used to support customer retention strategies in real-world telecommunications businesses.

---

**Author:** Samuel Nathanael Sitompul

> Presentation and analysis were created as part of a customer churn classification case study using Telco customer behavior data.
