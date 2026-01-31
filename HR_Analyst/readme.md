# Final Project: Employee Attrition Prediction System

## Business Understanding

This HR analytics project addresses the critical issue of employee attrition within an organization. High attrition rates negatively impact recruitment costs, team productivity, and organizational knowledge retention. Understanding the factors driving employee turnover is essential for developing effective retention strategies and maintaining a stable, experienced workforce.

The HR department requires a data-driven solution to identify key factors influencing attrition and predict which employees are at risk of leaving, enabling proactive intervention and strategic workforce planning.

### Business Problems

- High attrition rates, particularly among younger employees (average age ~34 years for those who left vs. ~37 for retained employees)
- Lower monthly income levels strongly associated with attrition (avg. $4,800 for leavers vs. $6,500 for stayers)
- Shorter tenure correlating with higher turnover risk (5 years vs. 7 years average)
- Single employees showing higher attrition rates compared to married employees
- Employees living farther from the workplace more likely to leave
- Income inequality per job level contributing to dissatisfaction

### Project Scope

- Conduct comprehensive HR data analysis to identify attrition patterns across categorical and numerical variables
- Perform feature engineering to create meaningful predictors (PromotionGap, BalanceEngagement, ManagerDependency, etc.)
- Build and compare multiple machine learning models (Logistic Regression, Random Forest, XGBoost, SVM)
- Select optimal model based on ROC-AUC, precision, recall, and F1-score metrics
- Provide actionable recommendations based on data-driven insights

### Preparation

1. **Data Source**: HR Analytics Dataset (employee attrition data with demographic, job-related, and performance features)

2. **Create and Activate Virtual Environment**

   Linux / MacOS:
```bash
   python3 -m venv venv
   source venv/bin/activate
```

   Windows (PowerShell):
```bash
   python -m venv venv
   venv\Scripts\activate
```

3. **Install Dependencies**
```bash
   pip install -r requirements.txt
```

## How to Run the Application

Execute the Streamlit application:
```bash
streamlit run hr_classification.py
```

## Model Development

### Feature Engineering

Created advanced features to capture complex employment dynamics:
- **PromotionGap**: Time since last promotion relative to tenure
- **BalanceEngagement**: Composite score of work-life balance and job involvement
- **ManagerDependency**: Relationship between years with current manager and total tenure
- **TenureRatio**: Years at company relative to age
- **IncomePerLevel**: Monthly income normalized by job level

### Feature Selection

The optimal number of features identified is **15**, which includes a balanced mix of demographic, job-related, compensation, satisfaction, performance, and engineered features such as Gender, JobLevel, MonthlyIncome, OverTime, JobSatisfaction, WorkLifeBalance, YearsAtCompany, PromotionGap, BalanceEngagement, and ManagerDependency. This selection provides the best trade-off between model complexity and predictive performance for attrition prediction.

### Model Comparison

Four models were evaluated:

1. **Logistic Regression**
   - Accuracy: 69.34%
   - Precision: 0.32 | Recall: 0.69 | F1-Score: 0.43
   - ROC-AUC: 0.7532

2. **Random Forest**
   - Accuracy: 83.02%
   - Precision: 0.50 | Recall: 0.36 | F1-Score: 0.42
   - ROC-AUC: 0.7585

3. **XGBoost** ✓ Selected Model
   - Accuracy: 76.42%
   - Precision: 0.38 | Recall: 0.58 | F1-Score: 0.46
   - ROC-AUC: **0.7808**

4. **SVM**
   - Accuracy: 75.00%
   - Precision: 0.34 | Recall: 0.50 | F1-Score: 0.40
   - ROC-AUC: 0.7260

### Final Model Selection: XGBoost

Based on comprehensive evaluation results, **XGBoost** is selected as the best model for employee attrition prediction because:

- It achieves the **highest ROC-AUC score (0.7808)**, demonstrating superior ability to discriminate between attrition and non-attrition cases across all threshold values
- It delivers the best balance between precision and recall for the minority class (attrition), with a recall of 58.33%
- It records the highest F1-score (0.4565) for the positive class, indicating more balanced performance in identifying employees at risk of leaving
- XGBoost's superior ROC-AUC score and balanced metrics make it the most reliable choice for identifying employees at genuine risk while minimizing false alarms, enabling more effective and targeted retention interventions

## Key Findings

### Categorical Variables Analysis

**Department**
- Research & Development shows the highest attrition count but also dominates overall, indicating it's the largest department
- Sales has moderate attrition levels
- Human Resources shows minimal attrition due to smaller size

**Education Field**
- Life Sciences shows the highest representation in both attrition and retention groups
- Medical and Marketing fields show moderate patterns
- Technical Degree, Human Resources, and Other fields have relatively lower counts

**Gender**
- Male employees show higher attrition counts and also dominate the workforce overall
- Proportional attrition rates suggest gender itself is not a primary driver

**Job Role**
- Laboratory Technician and Sales Executive show notable attrition levels
- Research Scientist, Sales Representative, and Manager roles show better retention
- Manufacturing Director and Research Director show minimal attrition

**Marital Status**
- Single employees show significantly higher attrition rates
- Married employees dominate the retention category, suggesting marital status correlates with job stability
- Divorced employees show the lowest counts overall

### Numerical Variables Analysis

**Age**
- Employees who left average ~34 years vs. ~37 years for those who stayed
- Younger employees are more likely to leave, possibly seeking career growth

**Monthly Income**
- Strong differentiator: leavers earn ~$4,800 vs. ~$6,500 for stayers
- Lower income is strongly associated with higher attrition risk

**Years at Company**
- Leavers average 5 years vs. 7 years for stayers
- Shorter tenure correlates with higher attrition; retention improves with time

**Distance From Home**
- Employees who left live slightly farther from workplace (~10 units vs. ~9 units)
- Longer commutes may contribute to attrition decisions

**Income Per Level**
- Stayers have higher income per level (~$1,900 vs. ~$1,600)
- Employees who feel fairly compensated for their level are more likely to stay

**Salary Growth**
- Paradoxically, leavers show higher average salary growth (~5 vs. ~3)
- Recent raises may have been insufficient to retain high-performing employees seeking better opportunities

## Conclusion

The analysis reveals several critical factors driving employee attrition:

- **Compensation is a primary driver**: Employees with lower monthly income and lower income-per-level ratios are significantly more likely to leave
- **Tenure matters**: Shorter tenure (< 5-7 years) correlates with higher attrition risk, emphasizing the importance of early retention efforts
- **Age and life stage**: Younger employees (~34 years) and single employees show higher turnover rates
- **Commute distance**: Even small differences in distance from home contribute to attrition decisions
- **Perceived fairness**: Despite higher salary growth, employees still left, suggesting pay increases alone are insufficient without addressing compensation equity

### Actionable Recommendations

**1. Compensation Strategy**
- Conduct comprehensive salary benchmarking against industry standards, particularly for employees with < 5 years tenure
- Address income-per-level disparities to ensure fair compensation relative to job responsibilities
- Implement retention bonuses for high-risk groups (single employees, those with lower income, shorter tenure)

**2. Early Career Retention Programs**
- Develop robust onboarding and mentorship programs for new hires (0-2 years)
- Create clear career progression pathways with transparent promotion criteria
- Establish regular check-ins at 6, 12, and 24-month milestones to address concerns early

**3. Work-Life Balance Initiatives**
- Explore flexible work arrangements or remote work options to reduce commute burden
- Implement programs specifically targeting single employees (social events, community building)
- Monitor and improve work-life balance metrics, especially for high-attrition roles

**4. Predictive Retention Management**
- Deploy the XGBoost model to generate monthly attrition risk scores for all employees
- Create intervention protocols for employees flagged as high-risk (score > 0.5)
- Conduct stay interviews with at-risk employees to understand specific concerns

**5. Data-Driven Decision Making**
- Establish quarterly reviews of attrition patterns by department, role, and demographic groups
- Track effectiveness of retention initiatives through continuous monitoring
- Refine model periodically with new data to maintain prediction accuracy

**6. Targeted Department Interventions**
- Focus retention efforts on R&D and Sales departments showing highest attrition
- Analyze role-specific factors for Laboratory Technicians and Sales Executives
- Improve manager training and support in high-turnover areas

By implementing these evidence-based recommendations and leveraging the predictive model, the organization can proactively identify at-risk employees, address root causes of dissatisfaction, and significantly reduce attrition rates while improving overall employee satisfaction and organizational stability.
