# 🧩 HL7 Middleware: v2 ↔ v3 Converter

A lightweight middleware built with **Node.js** and **ExpressJS** that enables **bi-directional conversion between HL7 v2 and HL7 v3** messages. Designed as part of the *Computing for Medicine* course project, this tool helps bridge legacy healthcare systems with modern infrastructures by improving interoperability.

## 🚀 Project Goal

Healthcare organizations often struggle with data interoperability due to the coexistence of different HL7 standards. This middleware aims to:

* Convert HL7 v2 messages into HL7 v3 format
* Convert HL7 v3 messages back into HL7 v2
* Provide a simple REST API for sending and receiving converted messages
* Serve as a base for future integrations with EHR systems or health information exchanges (HIEs)

## ⚙️ Tech Stack

* **JavaScript (ES6+)**
* **Node.js**
* **ExpressJS**
* Custom parsing and transformation logic for HL7 message structures

## 📦 Features

* 🚑 Converts HL7 v2 <-> HL7 v3
* 📤 API endpoints for sending HL7 messages
* ⚡ Fast and lightweight server
* 🧪 Easy to test and extend with additional message types


## 🔧 Installation

```bash
git clone https://github.com/Ahmet-Tolga/HL7-converter-middleware.git
cd HL7-converter-middleware
npm install
```

## 🛠️ Usage

Start the development server:

```bash
npm run dev
```

Example API usage:

* `POST /v2/createHlv3` — Accepts HL7 v2 message and returns HL7 v3
* `POST /v3/createHlv2` — Accepts HL7 v3 message and returns HL7 v2

## 🌍 Real-World Application

This middleware is ideal for:

* Hospitals and labs with mixed systems
* Healthcare startups developing interoperable solutions
* Researchers working on healthcare data integration

It provides a **low-cost, scalable** bridge between older and newer standards — reducing integration complexity and ensuring data consistency across platforms.

## 🤝 Team

* **Ahmet Tolgahan Senli**
* **Esat Aydin**

## 📜 License

This project is for educational purposes. You may adapt or build upon it as needed, but please cite appropriately.
