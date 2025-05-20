// Round timestamp to nearest 5 minutes
function roundTo5Minutes(timestamp) {
  const date = new Date(timestamp * 1000);
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  date.setMinutes(roundedMinutes, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

// Get current time in EAT and round it
const now = new Date();
const eatOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
const currentEatTime = new Date(now.getTime() + eatOffset);
const startTime = roundTo5Minutes(currentEatTime.getTime() / 1000);
const endTime = startTime + 21 * 24 * 60 * 60;

export async function availability() {
  const response = await fetch(
    "https://api.us.nylas.com/v3/calendars/availability",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NYLAS_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        duration_minutes: 180,
        start_time: startTime,
        end_time: endTime,
        participants: [{ email: "vwanyungu254@gmail.com" }],
        open_hours: [
          {
            emails: ["vwanyungu254@gmail.com"], // Note: "emails" → "emails"
            days: [1, 2, 3, 4, 5], // Monday-Friday
            timezone: "Africa/Nairobi",
            start: "08:00",
            end: "18:00",
          },
        ],
      }),
    }
  );
  const data = await response.json();
  let slots = [];
  data.data.time_slots.forEach((slot) => {
    let start_time = new Date(slot.start_time * 1000).toISOString();
    let end_time = new Date(slot.end_time * 1000).toISOString();
    slots.push({
      start_time: start_time,
      end_time: end_time,
    });
  });
  return slots;
}
