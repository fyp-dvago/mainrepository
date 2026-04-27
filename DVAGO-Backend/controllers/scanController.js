const Tesseract = require("tesseract.js");
const fs = require("fs");

const scanMedicine = async (req, res) => {
  let imagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, "eng");

    const text = result?.data?.text || "";

    // Find dosage like 250mg, 10ml etc
    const dosageMatch = text.match(/\b\d+(\.\d+)?\s?(mg|ml|iu|mcg|g)\b/i);

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const guessedName = lines.length > 0 ? lines[0] : "";
    const guessedDosage = dosageMatch ? dosageMatch[0] : "";

    res.json({
      parsed: {
        name: guessedName,
        dosage: guessedDosage,
      },
    });

  } catch (error) {
    res.status(500).json({
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
