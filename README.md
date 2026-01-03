🚀 LoRaWAN & E-commerce Analytics (Node.js + MongoDB)

This project contains two independent analytics tasks built using Node.js (JavaScript) and MongoDB.
Each task can be executed separately via command-line arguments.

📂 Project Overview
🔹 Task 1 – LoRaWAN Analytics

Processes IoT sensor data to generate meaningful analytics such as device activity, signal quality, and environmental insights.

🔹 Task 2 – E-commerce Analytics

Processes order data from a CSV file to generate sales and revenue insights.

🛠 Tech Stack

Node.js

JavaScript

MongoDB

dotenv

CSV file processing

📁 Project Structure
lorawan-task/
│
├── app.js
├── package.json
├── .env
├── data/
│   └── orders.csv
├── output/
│   └── high_temperature_devices.json
├── node_modules/
└── README.md

⚙️ How to Run

Make sure Node.js and MongoDB are running.

▶️ Run Task 1 – LoRaWAN Analytics
node app.js task1


Outputs:

Top 10 devices with highest uplinks

Average RSSI & SNR per device

Average temperature & humidity per gateway

Duplicate devices

Devices with temperature > 35°C exported to:

output/high_temperature_devices.json

▶️ Run Task 2 – E-commerce Analytics
node app.js task2


Outputs:

Imports orders from data/orders.csv

Top 5 products by sales

Monthly revenue

Average sales per category & sub-category

Yearly revenue and growth percentage

⚠️ Important Note

Running the app without specifying a task will show an error:

node app.js
❌ Please specify task: node app.js task1 OR node app.js task2


Correct usage:

node app.js task1
# or
node app.js task2

🔐 Environment Configuration

The .env file is included in the repository.

No additional environment setup is required.

MongoDB connection details are already configured.

✅ Key Features

Modular task-based execution

Clean separation of analytics logic

MongoDB aggregation usage

CSV data processing

Interview-ready project structure

👤 Author

Sumit Kumar
Full Stack / Frontend Developer
