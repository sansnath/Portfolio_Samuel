import streamlit as st
import pandas as pd
import joblib

st.set_page_config(
    page_title="Employee Attrition Prediction",
    page_icon="💼",
    layout="wide"
)

model = joblib.load("HR_Analyst/model/xgb_model.pkl")
scaler = joblib.load("HR_Analyst/model/scaler.pkl")
selected_features = joblib.load("HR_Analyst/model/features.pkl")

st.markdown("<h1 style='text-align: center;'>Employee Attrition Prediction</h1>", unsafe_allow_html=True)
st.markdown(
    "<p style='text-align: center; color: gray;'>XGBoost • 15 Selected Features • SMOTE-trained</p>",
    unsafe_allow_html=True
)

st.markdown("## 👤 Employee Profile")

user_input = {}
c1, c2, c3 = st.columns(3)

with c1:
    user_input["Gender"] = st.selectbox("Gender", ["Male", "Female"])
    user_input["JobLevel"] = st.selectbox("Job Level", [1, 2, 3, 4, 5])
    user_input["JobInvolvement"] = st.selectbox("Job Involvement (1–4)", [1, 2, 3, 4])
    user_input["JobSatisfaction"] = st.selectbox("Job Satisfaction (1–4)", [1, 2, 3, 4])

with c2:
    user_input["MonthlyIncome"] = st.number_input("Monthly Income", min_value=1000, max_value=30000, value=8000)
    user_input["OverTime"] = st.selectbox("OverTime", ["No", "Yes"])
    user_input["PerformanceRating"] = st.selectbox("Performance Rating", [1,2,3, 4])
    user_input["RelationshipSatisfaction"] = st.selectbox("Relationship Satisfaction (1–4)", [1, 2, 3, 4])

with c3:
    user_input["StockOptionLevel"] = st.selectbox("Stock Option Level", [0, 1, 2, 3])
    user_input["TrainingTimesLastYear"] = st.number_input("Training Times Last Year", 0, 10, 2)
    user_input["WorkLifeBalance"] = st.selectbox("Work Life Balance (1–4)", [1, 2, 3, 4])
    user_input["YearsAtCompany"] = st.number_input("Years at Company", 0, 40, 5)

st.markdown("##Derived Engagement Metrics")

c4, c5 = st.columns(2)

with c4:
    user_input["PromotionGap"] = st.number_input("Promotion Gap (Years)", 0, 20, 2)

with c5:
    user_input["BalanceEngagement"] = st.number_input("Balance Engagement Score", 1, 16, 8)
    user_input["ManagerDependency"] = st.number_input("Manager Dependency Score", 1, 10, 5)

st.markdown("---")

if st.button("Predict Attrition Risk", use_container_width=True):

    input_df = pd.DataFrame([user_input])
    input_df = input_df[selected_features]

    input_df["Gender"] = input_df["Gender"].map({"Male": 1, "Female": 0})
    input_df["OverTime"] = input_df["OverTime"].map({"Yes": 1, "No": 0})

    input_scaled = scaler.transform(input_df)

    prob_stay, prob_leave = model.predict_proba(input_scaled)[0]

    if prob_leave >= 0.40:
        st.error("⚠️ HIGH ATTRITION RISK")
        risk = "HIGH"
    elif prob_leave >= 0.20:
        st.warning("⚠️ MEDIUM ATTRITION RISK")
        risk = "MEDIUM"
    else:
        st.success("✅ LOW ATTRITION RISK")
        risk = "LOW"

    col1, col2, col3 = st.columns(3)
    col1.metric("Probability Stay", f"{prob_stay*100:.2f}%")
    col2.metric("Probability Leave", f"{prob_leave*100:.2f}%")
    col3.metric("Risk Level", risk)

    with st.expander("Debug Input to Model"):
        st.dataframe(input_df)

st.markdown("<hr>", unsafe_allow_html=True)
st.caption("Developed by Samuel Nathanael | XGBoost Attrition Prediction System")