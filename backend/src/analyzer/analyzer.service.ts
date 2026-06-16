import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as mammoth from 'mammoth';

const pdfExtraction = require('pdf-extraction');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class AnalyzerService {
  async processDocuments(files: Array<any>) {
    console.log(`✅ Received ${files.length} files in Backend`);

    try {
      const prompt = `පහත ලබා දී ඇති Document/Documents වල අන්තර්ගතය හොඳින් කියවා, එය ඉතා පැහැදිලිව, මාතෘකා සහ අනු-මාතෘකා (Category/Sub-topic wise) සහිතව සිංහල භාෂාවෙන් සාරාංශගත කරන්න.

      කරුණාකර පහත දැක්වෙන ආකෘතිය (Template) අනිවාර්යයෙන්ම අනුගමනය කරන්න:

      ### [මෙහි පළමු උප-මාතෘකාව ලියන්න]
      * [අදාළ වැදගත් කරුණු කෙටියෙන් හා පැහැදිලිව] \`[මුල් ගොනුවේ අදාළ වචන 4-6ක උපුටා ගැනීමක්]\`
      * [අදාළ වැදගත් කරුණු...] \`[මුල් ගොනුවේ අදාළ වචන 4-6ක උපුටා ගැනීමක්]\`

      ---
      ### කෙටි සාරාංශය (Short Summary)
      [මුළු ලියවිලි වලම අදහස කැටි කර තනි ඡේදයකින් මෙහි දක්වන්න.]

      විශේෂ සහ අනිවාර්ය උපදෙස්:
      - සෑම කරුණක් (Bullet point එකක්) හෝ ඡේදයක් අවසානයේම, එම කරුණට අදාළ මුල් ගොනුවේ (Original Document) ඇති වචන 4 සිට 6 ක් දක්වා වූ කෙටි උපුටා ගැනීමක් අනිවාර්යයෙන්ම Backticks (\`) භාවිතයෙන් Inline Code එකක් ලෙස යොදන්න.
      - උදාහරණ: * නූතන කාර්යාල පරිසරය විශාල ලෙස වෙනස් වී ඇත. \`modern workplace has undergone a massive\`
      - කිසිදු විටෙක මෙම උපුටා ගැනීම් සඳහා Links (URL) භාවිතා නොකරන්න.`;
      
      let parts: any[] = [{ text: prompt }];
      let fullExtractedText = "";

      for (const file of files) {
        console.log(`- Reading: ${file.originalname}`);
        let currentFileText = "";
        
        if (file.mimetype === 'application/pdf') {
          const pdfData = await pdfExtraction(file.buffer);
          currentFileText = pdfData.text;
          parts.push({ inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } });
        } 
        else if (file.originalname.endsWith('.docx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const extractedData = await mammoth.extractRawText({ buffer: file.buffer });
          currentFileText = extractedData.value;
          parts.push({ text: `\n\n--- Document: ${file.originalname} ---\n${currentFileText}` });
        }
        else if (file.originalname.endsWith('.txt') || file.mimetype === 'text/plain') {
          currentFileText = file.buffer.toString('utf-8');
          parts.push({ text: `\n\n--- Document: ${file.originalname} ---\n${currentFileText}` });
        }

        fullExtractedText += `\n\n--- ${file.originalname} ---\n\n${currentFileText}`;
      }

      console.log('🧠 AI is starting the analysis process...');

      const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
      const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash']; 
      
      let finalResponse = null;
      let success = false;

      for (const key of apiKeys) {
        if (success) break;
        // @ts-ignore
        const ai = new GoogleGenAI({ apiKey: key });

        for (const modelName of fallbackModels) {
          if (success) break;

          // 🔴 අලුත් Progressive Wait Logic එක (මුලින් අඩු කාලයක්, පසුව වැඩි කාලයක්)
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`🔄 Attempt ${attempt} - Trying Key: ...${key?.slice(-4)} | Model: ${modelName}`);
              const response = await ai.models.generateContent({ model: modelName, contents: parts });
              finalResponse = response.text;
              success = true;
              console.log(`✅ Success with Model: ${modelName}`);
              break; 
            } catch (error: any) {
              console.warn(`⚠️ Attempt ${attempt} Failed (Key ...${key?.slice(-4)}): ${error.message}`);
              
              if (!success) {
                if (attempt === 1) {
                  console.log(`⏳ Auto-waiting 10 seconds before retrying...`);
                  await sleep(10000); 
                } else if (attempt === 2) {
                  console.log(`⏳ Auto-waiting 25 seconds before retrying (Server is very busy)...`);
                  await sleep(25000);
                }
              }
            }
          }
        }
      }

      if (!success || !finalResponse) {
        throw new Error("සියලුම AI සේවාදායකයන් මේ මොහොතේ කාර්යබහුලයි.");
      }

      return { success: true, message: finalResponse, fullText: fullExtractedText };
      
    } catch (error) {
      console.error('❌ AI Ultimate Error:', error);
      return {
        success: false,
        message: 'කණගාටුයි! මේ මොහොතේ ඔබගේ සේවාව තාක්ෂණික ගැටලුවක් නිසා ලබා දිය නොහැකියි. ගොනු ප්‍රමාණය අඩු කර හෝ මඳ වේලාවකට පසු නැවත උත්සාහ කරන්න.',
      };
    }
  }
}