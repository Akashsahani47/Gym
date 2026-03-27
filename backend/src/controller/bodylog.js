import { BodyLog } from "../model/BodyLog.js";

// ─── Save / Update body log for a date ───────────────────────────────────────
export const saveBodyLog = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { date, weight, height, bodyFat, notes } = req.body;

    const logDate = date || new Date().toISOString().split("T")[0];

    if (!weight && !height && !bodyFat) {
      return res.status(400).json({ success: false, error: "At least one measurement is required" });
    }

    // Calculate BMI
    let bmi = null;
    const h = height || req.user.healthMetrics?.height;
    const w = weight;
    if (w && h) {
      const hm = h / 100;
      bmi = parseFloat((w / (hm * hm)).toFixed(1));
    }

    const log = await BodyLog.findOneAndUpdate(
      { memberId, date: logDate },
      {
        memberId,
        date: logDate,
        weight,
        height: height || req.user.healthMetrics?.height,
        bodyFat,
        bmi,
        notes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, log });
  } catch (error) {
    console.error("saveBodyLog error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Get body log history ────────────────────────────────────────────────────
export const getBodyLogs = async (req, res) => {
  try {
    const memberId = req.user._id;
    const months = parseInt(req.query.months) || 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startStr = startDate.toISOString().split("T")[0];

    const logs = await BodyLog.find({
      memberId,
      date: { $gte: startStr },
    })
      .sort({ date: 1 })
      .lean();

    // Calculate current BMI status
    const latest = logs.length > 0 ? logs[logs.length - 1] : null;

    let bmiCategory = null;
    if (latest?.bmi) {
      if (latest.bmi < 18.5) bmiCategory = "Underweight";
      else if (latest.bmi < 25) bmiCategory = "Normal";
      else if (latest.bmi < 30) bmiCategory = "Overweight";
      else bmiCategory = "Obese";
    }

    return res.json({
      success: true,
      logs,
      latest,
      bmiCategory,
    });
  } catch (error) {
    console.error("getBodyLogs error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ─── Delete body log ─────────────────────────────────────────────────────────
export const deleteBodyLog = async (req, res) => {
  try {
    const memberId = req.user._id;
    const { date } = req.params;

    await BodyLog.findOneAndDelete({ memberId, date });

    return res.json({ success: true });
  } catch (error) {
    console.error("deleteBodyLog error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
