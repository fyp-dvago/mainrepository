const DoseLog = require("../models/DoseLog");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "week";

    const now = new Date();
    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "year") {
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    console.log("[analytics] request", {
      userId,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    });

    const isWithinAnalyticsRange = (date) => {
      if (!date) return false;
      const value = new Date(date);
      return value >= startDate && value <= now;
    };

    const getAnalyticsDate = (log) =>
      log.status === "taken" && log.takenAt ? log.takenAt : log.scheduledAt;

    const logs = await DoseLog.find({
      user: userId,
      $or: [
        { scheduledAt: { $gte: startDate, $lte: now } },
        { takenAt: { $gte: startDate, $lte: now } }
      ]
    }).populate("medicine");

    const analyticsLogs = logs.filter((log) => {
      if (log.status === "taken") {
        return (
          isWithinAnalyticsRange(log.takenAt) ||
          isWithinAnalyticsRange(log.scheduledAt)
        );
      }

      if (log.status === "missed") {
        return isWithinAnalyticsRange(log.scheduledAt);
      }

      if (log.status === "pending") {
        return (
          new Date(log.scheduledAt) <= now &&
          isWithinAnalyticsRange(log.scheduledAt)
        );
      }

      return false;
    });

    const totalDoses = analyticsLogs.length;
    const takenDoses = analyticsLogs.filter(log => log.status === "taken").length;
    const missedDoses = analyticsLogs.filter(log => log.status === "missed").length;

    console.log("[analytics] dose counts", {
      userId,
      period,
      totalDoses,
      takenDoses,
      missedDoses
    });

    const adherenceRate =
      totalDoses === 0 ? 0 : Math.round((takenDoses / totalDoses) * 100);

    const onTimeDoses = analyticsLogs.filter(log => {
      if (!log.takenAt) return false;
      const diffMinutes =
        Math.abs(new Date(log.takenAt) - new Date(log.scheduledAt)) / 60000;
      return diffMinutes <= 30;
    }).length;

    const onTimeRate =
      takenDoses === 0 ? 0 : Math.round((onTimeDoses / takenDoses) * 100);

    // simple streak calculation
    let streak = 0;
    const groupedByDay = {};

    analyticsLogs.forEach(log => {
      const day = new Date(getAnalyticsDate(log)).toISOString().split("T")[0];
      if (!groupedByDay[day]) groupedByDay[day] = [];
      groupedByDay[day].push(log);
    });

    const sortedDays = Object.keys(groupedByDay).sort().reverse();

    for (const day of sortedDays) {
      const dayLogs = groupedByDay[day];
      const allTaken = dayLogs.every(log => log.status === "taken");
      if (allTaken) streak++;
      else break;
    }

    // chart data
    const adherenceMap = {};

    analyticsLogs.forEach(log => {
      const day = new Date(getAnalyticsDate(log)).toLocaleDateString("en-US", {
        weekday: "short"
      });

      if (!adherenceMap[day]) {
        adherenceMap[day] = { day, taken: 0, total: 0 };
      }

      adherenceMap[day].total += 1;
      if (log.status === "taken") adherenceMap[day].taken += 1;
    });

    const adherenceData = Object.values(adherenceMap).map(item => ({
      day: item.day,
      taken: item.taken,
      total: item.total,
      percentage:
        item.total === 0 ? 0 : Math.round((item.taken / item.total) * 100)
    }));

    // medicine breakdown
    const medicineMap = {};

    analyticsLogs.forEach(log => {
      const medName = log.medicine?.name || "Unknown";

      if (!medicineMap[medName]) {
        medicineMap[medName] = {
          name: medName,
          taken: 0,
          total: 0
        };
      }

      medicineMap[medName].total += 1;
      if (log.status === "taken") medicineMap[medName].taken += 1;
    });

    const medicineStats = Object.values(medicineMap).map(item => ({
      name: item.name,
      taken: item.taken,
      total: item.total,
      adherence:
        item.total === 0 ? 0 : Math.round((item.taken / item.total) * 100)
    }));

    // best time slot
    const timeBuckets = {
      Morning: { taken: 0, total: 0 },
      Afternoon: { taken: 0, total: 0 },
      Evening: { taken: 0, total: 0 },
      Night: { taken: 0, total: 0 }
    };

    analyticsLogs.forEach(log => {
      const hour = new Date(getAnalyticsDate(log)).getHours();

      let bucket = "Morning";
      if (hour >= 12 && hour < 17) bucket = "Afternoon";
      else if (hour >= 17 && hour < 21) bucket = "Evening";
      else if (hour >= 21 || hour < 5) bucket = "Night";

      timeBuckets[bucket].total += 1;
      if (log.status === "taken") timeBuckets[bucket].taken += 1;
    });

    let bestTime = "Morning";
    let bestRate = 0;

    Object.entries(timeBuckets).forEach(([bucket, data]) => {
      const rate = data.total === 0 ? 0 : Math.round((data.taken / data.total) * 100);
      if (rate > bestRate) {
        bestRate = rate;
        bestTime = bucket;
      }
    });

    res.json({
      period,
      stats: {
        adherenceRate,
        dosesTaken: `${takenDoses}/${totalDoses}`,
        onTimeRate,
        streak: `${streak} days`
      },
      adherenceData,
      medicineStats,
      bestTime: {
        slot: bestTime,
        rate: `${bestRate}%`
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAnalytics
};
