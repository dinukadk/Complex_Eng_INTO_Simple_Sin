# I know absolutely nothing about Next.js or Nest.js, but I built this Full-Stack "Complex ENGLISH into Simple SINHALA" Document Analyzer System! 🤯🚀

> **Disclaimer: I built this entire Full-Stack application knowing absolutely ZERO about Next.js or Nest.js!** 
> Yes, you read that right. This project was developed 100% through AI collaboration (Prompt Engineering). It showcases how modern AI tools can empower individuals to build complex, industry-level software solutions from scratch, without prior framework-specific knowledge.

🔗 **See it in action:**  https://www.linkedin.com/posts/dinukadk_artificialintelligence-promptengineering-ugcPost-7473188508069752833-OqdH/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAELhA4EBO3YXnutrX_4krLaNtKOQRZ8k1EU

---

## 🎯 What is this project?
This is an AI-powered Document Analyzer designed to break down language barriers. It takes complex English or Sinhala documents (PDF, DOCX, TXT) and instantly generates a highly structured, easy-to-understand **Sinhala summary**. 

### ✨ Core Features:
* **Drag & Drop Upload:** Easily upload your documents.
* **Smart Summarization:** Categorized, bullet-point summaries in Sinhala.
* **Interactive Magic Highlight:** Click any summarized bullet point, and the system automatically scrolls and **highlights the exact original English/Sinhala sentence** in the source document!
* **Native PDF Export:** Download the summarized results as a beautifully formatted PDF with a single click.
* **Progressive Wait System:** Intelligently handles server traffic limits by progressively waiting and retrying when the AI API gets busy.

---

## 🛠️ Technology Stack (Explained Simply)
Even though I didn't write the code manually, here is the amazing technology running behind the scenes:

* **Frontend (Next.js & Tailwind CSS):** The user interface. It handles the smooth drag-and-drop animations, the clicking mechanism, and the dark-themed UI.
* **Backend (Nest.js):** The server that does the heavy lifting. It safely receives your files and extracts the text from them.
* **File Parsers (`mammoth` & `pdf-extraction`):** Specialized tools in the backend that can "read" text inside Word documents and PDFs.
* **Google Gemini AI (`@google/genai`):** The "Brain" of the project. It reads the extracted text and magically converts it into the categorized Sinhala summary.
* **React Markdown:** Renders the AI's response into beautiful formatting (bold text, lists, and headers) on the screen.

---

## ⚙️ How to Run This Project on Your Machine
I want anyone to be able to download and test this project. Just follow these simple, step-by-step instructions.

### Prerequisites:
Before you begin, make sure you have installed:
1. [Node.js](https://nodejs.org/) (Download and install the LTS version)
2. [Git](https://git-scm.com/downloads)

### Step 1: Clone the Repository
Open your computer's terminal (or command prompt) and run:
```bash
git clone https://github.com/dinukadk/Complex_Eng_INTO_Simple_Sin.git
cd Complex_Eng_INTO_Simple_Sin
```

### Step 2: Setup the Backend (The Engine)
1. Open a new terminal inside the `backend` folder:
   ```bash
   cd backend
   ```
2. Install all the required packages (this might take a minute):
   ```bash
   npm install
   ```
3. **Get your AI Keys:** Go to [Google AI Studio](https://aistudio.google.com/), sign in with your Google account, and generate a free API Key.
4. **Create the secret file:** Inside the `backend` folder, create a new file and name it exactly `.env`
5. Open the `.env` file and paste your API key like this:
   ```env
   GEMINI_API_KEY=paste_your_first_api_key_here
   GEMINI_API_KEY_2=paste_your_second_api_key_here_if_you_have_one
   ```
   *(Note: You can use the same key for both, or just add one. The system uses a fallback mechanism).*
6. Start the backend server:
   ```bash
   npm run start:dev
   ```
   *Keep this terminal running in the background.*

### Step 3: Setup the Frontend (The User Interface)
1. Open a **second, brand new terminal** and go inside the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

### Step 4: Test the Application! 🎉
* Open your web browser and go to: **http://localhost:3000** (or `http://localhost:3001` if port 3000 is busy).
* Drag and drop an English PDF or Word file.
* Click **"✨ Analyze with AI"** and watch the magic happen!

---
*Built with ❤️ and Artificial Intelligence.*
