
declare const mammoth: any;
declare const pdfjsLib: any;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return await file.text();
    
    case 'docx':
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (err) {
            reject(new Error("Failed to parse .docx file"));
          }
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsArrayBuffer(file);
      });

    case 'pdf':
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(" ");
              fullText += pageText + "\n";
            }
            resolve(fullText);
          } catch (err) {
            reject(new Error("Failed to parse .pdf file"));
          }
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsArrayBuffer(file);
      });

    default:
      throw new Error("Unsupported file format. Please upload .txt, .docx, or .pdf");
  }
};
