// A temporary file to test call scheduling
const callData = {
  farmerId: 1,
  specialistId: 2,
  scheduledTime: new Date().toISOString(),
  duration: 30,
  status: "scheduled",
  topic: "Test call",
  notes: null
};

console.log("Call data for API:", JSON.stringify(callData, null, 2));