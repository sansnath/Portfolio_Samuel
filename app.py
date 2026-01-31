import streamlit as st
import pandas as pd
import joblib

st.set_page_config(
    page_title="Student Status Prediction",
    page_icon="🎓",
    layout="wide"
)

st.markdown("""
<h1 style='text-align: center;'>Student Status Prediction</h1>
<p style='text-align: center; color: gray;'>
    XGBoost–based model using selected academic, demographic, and socio-economic features.
</p>
""", unsafe_allow_html=True)

model = joblib.load("model/xgb_model.pkl")
scaler = joblib.load("model/scaler.pkl")
selected_features = joblib.load("model/features.pkl")

st.markdown("## 👤 Student Demographics & Background")

col1, col2, col3 = st.columns(3)
user_input = {}

with col1:
    user_input["Application_mode"] = st.selectbox(
        "Application Mode",
        [1, 2, 5, 7, 10, 15, 16, 17, 18, 26, 27, 39, 42, 43, 44, 51, 53, 57],
        format_func=lambda x: {
            1: "1st phase - general contingent",
            2: "Ordinance No. 612/93",
            5: "1st phase - special contingent (Azores Island)",
            7: "Holders of other higher courses",
            10: "Ordinance No. 854-B/99",
            15: "International student (bachelor)",
            16: "1st phase - special contingent (Madeira Island)",
            17: "2nd phase - general contingent",
            18: "3rd phase - general contingent",
            26: "Ordinance 533-A/99 (Diff. Plan)",
            27: "Ordinance 533-A/99 (Other Institution)",
            39: "Over 23 years old",
            42: "Transfer",
            43: "Change of course",
            44: "Technological specialization diploma holders",
            51: "Change of institution/course",
            53: "Short cycle diploma holders",
            57: "Change of institution/course (International)"
        }[x]
    )

    user_input["Course"] = st.selectbox(
        "Course",
        [33, 171, 8014, 9003, 9070, 9085, 9119, 9130, 9147, 9238,
         9254, 9500, 9556, 9670, 9773, 9853, 9991]
    )

    user_input["Displaced"] = st.selectbox(
        "Displaced", [0, 1], format_func=lambda x: "Yes" if x == 1 else "No"
    )

with col2:
    user_input["Mothers_qualification"] = st.number_input("Mother's Qualification", min_value=0, step=1)
    user_input["Fathers_qualification"] = st.number_input("Father's Qualification", min_value=0, step=1)
    user_input["Tuition_fees_up_to_date"] = st.selectbox(
        "Tuition Fees Up To Date", [0, 1], format_func=lambda x: "Yes" if x == 1 else "No"
    )

with col3:
    user_input["Age_at_enrollment"] = st.number_input("Age at Enrollment", min_value=15, max_value=80, value=19)
    user_input["Curricular_units_1st_sem_approved"] = st.number_input(
        "1st Semester Approved Units", min_value=0, step=1
    )
    user_input["Curricular_units_2nd_sem_credited"] = st.number_input(
        "2nd Semester Credited Units", min_value=0, step=1
    )

st.markdown("---")
st.markdown("## 📚 Academic Performance (2nd Semester)")

col4, col5 = st.columns(2)
with col4:
    user_input["Curricular_units_2nd_sem_enrolled"] = st.number_input(
        "2nd Semester Enrolled Units", min_value=0, step=1
    )
with col5:
    user_input["Curricular_units_2nd_sem_approved"] = st.number_input(
        "2nd Semester Approved Units", min_value=0, step=1
    )

st.markdown("---")
st.markdown("## 💰 Socio-Economic Factors")

col6, col7 = st.columns(2)
with col6:
    user_input["Unemployment_rate"] = st.number_input(
        "Unemployment Rate (%)", min_value=0.0, max_value=100.0, value=6.5
    )
with col7:
    user_input["International"] = st.selectbox(
        "International Student", [0, 1], format_func=lambda x: "Yes" if x == 1 else "No"
    )

st.markdown("---")
st.markdown("## 🚀 Prediction Result")

if st.button("Predict Student Status", use_container_width=True):
    input_df = pd.DataFrame([user_input], columns=selected_features)
    input_scaled = scaler.transform(input_df)

    prediction = model.predict(input_scaled)[0]
    prediction_proba = model.predict_proba(input_scaled)[0]

    label_map = {
        0: "Graduate",
        1: "Dropout",
        2: "Enrolled"
    }

    st.success(f"**Predicted Student Status:** {label_map[prediction]}")

    st.markdown("### 📊 Prediction Probability")
    for idx, label in label_map.items():
        st.write(f"- **{label}:** {prediction_proba[idx]:.4f}")

st.markdown("<hr>", unsafe_allow_html=True)
st.caption("Developed by Samuel Nathanael")