const { ocrSpace } = require("ocr-space-api-wrapper");
const fs = require("fs");

const parseOcrText = (text) => {
  const dosageMatch = text.match(/\b\d+(\.\d+)?\s?(mg|ml|iu|mcg|g)\b/i);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    name: lines.length > 0 ? lines[0] : "",
    dosage: dosageMatch ? dosageMatch[0] : "",
    category: "",
  };
};

const extractOcrText = (result) => {
  if (result?.IsErroredOnProcessing) {
    const errorMessage = Array.isArray(result.ErrorMessage)
      ? result.ErrorMessage.join(", ")
      : result.ErrorMessage;

    throw new Error(errorMessage || "OCR.space failed to process image");
  }

  const parsedResults = Array.isArray(result?.ParsedResults)
    ? result.ParsedResults
    : [];

  return parsedResults
    .map((item) => item?.ParsedText || "")
    .join("\n")
    .trim();
};

const scanMedicine = async (req, res) => {
  let imagePath = null;

  try {
    if (!process.env.OCR_SPACE_API_KEY) {
      return res.status(500).json({
        message: "OCR_SPACE_API_KEY is not configured",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    imagePath = req.file.path;

    const result = await ocrSpace(imagePath, {
      apiKey: process.env.OCR_SPACE_API_KEY,
      language: "eng",
    });

    const text = extractOcrText(result);

    if (!text) {
      return res.json({
        parsed: {
          name: "",
          dosage: "",
          category: "",
        },
      });
    }

    res.json({
      parsed: parseOcrText(text),
    });

  } catch (error) {
    res.status(502).json({
      message: error.message || "Failed to scan medicine",
    });
  } finally {
    // Always delete uploaded image
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlink(imagePath, () => {});
    }
  }
};

module.exports = {
  scanMedicine,
};
