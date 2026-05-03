export interface SampleDataset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  question: string;
  csv: string;
}

const salesCsv = `month,channel,units,revenue,marketing_spend
Jan,Online,1240,49600,8200
Jan,Retail,820,32800,4100
Feb,Online,1410,56400,9000
Feb,Retail,790,31600,4400
Mar,Online,1655,66200,11200
Mar,Retail,910,36400,4900
Apr,Online,1820,72800,12400
Apr,Retail,860,34400,5100
May,Online,2105,84200,15800
May,Retail,1010,40400,6000
Jun,Online,2480,99200,18900
Jun,Retail,1180,47200,7100
Jul,Online,2390,95600,17400
Jul,Retail,1090,43600,6500
Aug,Online,2730,109200,21300
Aug,Retail,1240,49600,7900
Sep,Online,3010,120400,23400
Sep,Retail,1310,52400,8400
Oct,Online,3220,128800,25100
Oct,Retail,1450,58000,9100
Nov,Online,3895,155800,29900
Nov,Retail,1820,72800,11400
Dec,Online,4710,188400,34800
Dec,Retail,2240,89600,13900`;

const irisCsv = `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
5.4,3.9,1.7,0.4,setosa
4.6,3.4,1.4,0.3,setosa
5.0,3.4,1.5,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
5.5,2.3,4.0,1.3,versicolor
6.5,2.8,4.6,1.5,versicolor
5.7,2.8,4.5,1.3,versicolor
6.3,3.3,4.7,1.6,versicolor
4.9,2.4,3.3,1.0,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica
6.3,2.9,5.6,1.8,virginica
6.5,3.0,5.8,2.2,virginica
7.6,3.0,6.6,2.1,virginica
4.9,2.5,4.5,1.7,virginica
7.3,2.9,6.3,1.8,virginica`;

const studyCsv = `student_id,hours_studied,sleep_hours,attendance_pct,prior_gpa,exam_score
1,2,5.5,72,2.8,58
2,3,6.0,80,3.0,64
3,4,6.5,86,3.1,70
4,5,7.0,90,3.2,74
5,6,7.5,94,3.4,79
6,7,8.0,96,3.5,84
7,1,4.5,60,2.4,48
8,2.5,5.0,70,2.7,55
9,4.5,6.5,84,3.0,71
10,5.5,7.0,88,3.2,76
11,6.5,7.5,93,3.4,82
12,8,8.5,98,3.6,91
13,3.5,6.0,78,2.9,66
14,4,6.5,82,3.0,69
15,5,7.0,90,3.3,77
16,2,5.0,68,2.6,54
17,7.5,8.0,95,3.5,87
18,6,7.5,92,3.3,80
19,3,5.5,76,2.8,62
20,4.5,7.0,87,3.1,73
21,5,6.5,85,3.0,72
22,8,8.0,99,3.7,93
23,1.5,5.0,64,2.5,50
24,6,7.5,91,3.4,81
25,7,8.0,94,3.5,86`;

const churnCsv = `customer_id,plan,tenure_months,monthly_spend,support_tickets,churned
1,Basic,2,29,4,1
2,Pro,18,79,1,0
3,Pro,24,89,0,0
4,Basic,4,29,5,1
5,Premium,36,149,0,0
6,Basic,1,29,6,1
7,Pro,12,79,2,0
8,Pro,8,79,3,1
9,Premium,30,149,1,0
10,Basic,3,29,4,1
11,Pro,20,89,1,0
12,Premium,28,149,0,0
13,Basic,2,29,5,1
14,Pro,16,79,2,0
15,Pro,6,79,4,1
16,Premium,40,149,0,0
17,Basic,5,29,3,0
18,Basic,1,29,7,1
19,Pro,22,89,1,0
20,Premium,32,149,1,0
21,Basic,3,29,5,1
22,Pro,14,79,2,0
23,Premium,26,149,0,0
24,Basic,2,29,6,1
25,Pro,10,79,3,1
26,Pro,18,89,1,0
27,Premium,38,149,0,0
28,Basic,4,29,4,1
29,Pro,12,79,2,0
30,Premium,30,149,0,0`;

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "sales",
    name: "E-commerce Sales (24 rows)",
    emoji: "💰",
    description:
      "Monthly online & retail sales with revenue and marketing spend. Great for trend & ROI questions.",
    question:
      "What's driving revenue growth, and is marketing spend producing diminishing returns?",
    csv: salesCsv,
  },
  {
    id: "iris",
    name: "Iris Flowers (24 rows)",
    emoji: "🌸",
    description:
      "Classic iris dataset with petal/sepal measurements across three species.",
    question:
      "Which features best separate the three species, and is petal length a stronger signal than sepal length?",
    csv: irisCsv,
  },
  {
    id: "study",
    name: "Student Performance (25 rows)",
    emoji: "🎓",
    description:
      "Study hours, sleep, attendance and exam scores from a small cohort.",
    question:
      "Which factor most strongly predicts exam performance — study hours, sleep, or attendance?",
    csv: studyCsv,
  },
  {
    id: "churn",
    name: "SaaS Customer Churn (30 rows)",
    emoji: "📉",
    description:
      "Subscription tenure, plan, support tickets and churn label.",
    question:
      "What's the strongest predictor of churn, and which plan is most at risk?",
    csv: churnCsv,
  },
];
