import userModel from "../models/userModel.js";
import formData from "form-data";
import axios from "axios";

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing details: userId or prompt",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.creditBalance <= 0) {
      return res.status(403).json({
        success: false,
        message: "No credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "ClipDrop API key is not configured",
      });
    }

    const form = new formData();
    form.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "x-api-key": apiKey,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = "data:image/png;base64," + base64Image;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { creditBalance: user.creditBalance - 1 },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Image Generated",
      credits: updatedUser.creditBalance,
      resultImage,
    });
  } catch (error) {
    console.error("Error in generateImage:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
