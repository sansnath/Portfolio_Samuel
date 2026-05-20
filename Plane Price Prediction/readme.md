# Flight Ticket Price Prediction

A machine learning project focused on predicting flight ticket prices using regression models such as Random Forest, XGBoost, and CatBoost.

## Overview

Ticket pricing in the aviation industry is highly dynamic and influenced by various factors. This project aims to analyze flight data, identify key drivers of ticket prices, and build robust predictive models. By accurately forecasting prices, this project provides valuable insights for both consumers and businesses in the travel sector.

The project includes:
* Exploratory Data Analysis (EDA)
* Target transformation and feature preprocessing
* Regression modeling using advanced boosting techniques
* Model evaluation and comparison (MAE, RMSE, $R^2$)
* Feature importance analysis

---

## Dataset

The dataset contains flight records with various flight attributes and ticket prices as the target variable.

### Main Features
* **Target Variable:** `Price` (Flight ticket price)
* **Categorical Features:** `Airline`, `Source`, `Destination`, `Additional_Info`
* **Route Features:** `Route 1` to `Route 6`, `Route_SD`
* **Temporal Features:** `Journey_Day`, `Journey_Month`, `Journey_Weekday`, `Dep_Hour`, `Dep_Minute`, `Arrival_Hour`, `Arrival_Minute`, `Dep_Period`, `Arrival_Next_Day`
* **Numerical Features:** `Duration_Minutes`, `Total_Stops`

---

## Project Workflow

### 1. Data Understanding & Preprocessing
* Handling missing values and ensuring proper data types.
* Analyzing data imbalance, particularly for categorical attributes like airlines.
* Checking duplicate data and outlier analysis.

### 2. Exploratory Data Analysis (EDA)
Key findings from the visual analysis:
* **Target Distribution:** The original price distribution is highly right-skewed. Applying a **Log Transformation (`log1p`)** successfully normalizes the distribution, ensuring better model stability.
* **Airline Pricing:** Premium airlines like *Jet Airways*, *Multiple Carriers*, and *Air India* exhibit wider price ranges and higher medians, whereas LCCs like *SpiceJet* and *IndiGo* remain consistently budget-friendly.
* **Stops vs Price:** A clear linear trend is observed; flight prices gradually scale up as the number of transits (`Total_Stops`) increases.
* **Route Premium:** Specific long-haul or high-demand routes such as *Banglore → New Delhi* and *Delhi → Cochin* command the highest median prices.
* **Market Share:** *Jet Airways* dominates the dataset with the highest flight frequency, indicating a strong market presence.

### 3. Feature Engineering
* **Log Transformation:** Converted the skewed `Price` target into a normal distribution via `np.log1p()`.
* **Temporal Parsing:** Extracted operational time blocks (`Dep_Period`) and indicator flags (`Arrival_Next_Day`) to better capture seasonal and time-of-day pricing patterns.

---

## Machine Learning Models

### 1. Random Forest Regressor
Used as the baseline ensemble learning model.
* **Performance:**
  * **MAE:** 822.1092
  * **RMSE:** 1585.7970
  * **$R^2$ Score:** 0.8737

### 2. CatBoost Regressor
Used as a powerful gradient boosting model optimized for categorical data.
* **Performance:**
  * **MAE:** 783.0884
  * **RMSE:** 1484.2239
  * **$R^2$ Score:** 0.8893

### 3. XGBoost Regressor
Used as the advanced scalable gradient boosting model.
* **Performance:**
  * **MAE:** 680.2949
  * **RMSE:** 1415.1347
  * **$R^2$ Score:** 0.8994

---

## Final Model Selection

**XGBoost** was selected as the final model because it demonstrated superior performance across all evaluation metrics. It achieved the lowest error rates (**MAE: 680.29**, **RMSE: 1415.13**) and the highest explanatory power (**$R^2$ Score: 0.8994**), meaning it can account for approximately 89.9% of the variance in flight ticket prices.

---

## Feature Importance

Top driving factors identified across the models:
* **Duration_Minutes:** This feature heavily dominates the split decisions in Random Forest and XGBoost, acting as the strongest baseline indicator for price.
* **Airline:** Highly critical across all models, especially in CatBoost where it stands as the most influential feature.
* **Route & Stops:** Specific route legs (e.g., `Route 3`) and `Total_Stops` consistently rank in the upper tier of feature importance.
* **Low Impact Features:** Sparse attributes like `Route 5` and `Route 6` yielded near-zero importance and can be considered for future feature pruning.

---

## Key Insights & Business Recommendations

* **Durasi Perjalanan (`Duration_Minutes`).** Merupakan faktor paling krusial dan dominan yang menentukan harga tiket. Semakin lama durasi penerbangan, harga tiket cenderung meningkat secara signifikan, yang juga berkorelasi erat dengan jumlah transit (`Total_Stops`).
* **Karakteristik & Dominasi Maskapai (`Airline`).** Jenis maskapai memberikan pengaruh besar terhadap variasi harga. Maskapai premium seperti **Jet Airways** tidak hanya mendominasi volume penerbangan di dalam dataset, tetapi juga memiliki rata-rata harga tiket tertinggi dibandingkan maskapai *Low-Cost Carrier* (LCC) seperti **SpiceJet** atau **IndiGo**.
* **Dinamika Rute Perjalanan (`Route`).** Lokasi asal dan tujuan menentukan kelas harga tiket. Rute-rute yang menghubungkan kota besar seperti **Banglore → New Delhi** dan **Delhi → Cochin** merupakan rute premium dengan median harga tertinggi, jauh melampaui rute pendek seperti **Mumbai → Hyderabad**.

---

## Technologies Used

* **Python**
* **Pandas & NumPy**
* **Scikit-learn**
* **XGBoost & CatBoost**
* **Matplotlib & Seaborn**

---

## Conclusion

This project demonstrates that gradient boosting algorithms, particularly **XGBoost**, can effectively predict flight ticket prices with high accuracy. Flight duration, airline tier, and key transit routes serve as the most significant pricing anchors. The resulting model can serve as a dependable backend tool for flight fare aggregation and dynamic pricing optimization systems.

**Author:** Samuel Nathanael Sitompul  
