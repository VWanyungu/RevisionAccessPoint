const units = [
  {
    name: "Mathematics",
    description: "Algebra and Geometry basics",
    level: "Beginner",
    hardness: 6,
  },
  {
    name: "Physics",
    description: "Newtonian Mechanics",
    level: "Intermediate",
    hardness: 7,
  },
  {
    name: "Chemistry",
    description: "Periodic Table and Bonding",
    level: "Beginner",
    hardness: 5,
  },
  {
    name: "Biology",
    description: "Cell Structure and Function",
    level: "Beginner",
    hardness: 4,
  },
  {
    name: "History",
    description: "World War II Overview",
    level: "Intermediate",
    hardness: 6,
  },
  {
    name: "Literature",
    description: "Shakespeare's Works",
    level: "Advanced",
    hardness: 8,
  },
  {
    name: "Computer Science",
    description: "Introduction to Algorithms",
    level: "Intermediate",
    hardness: 7,
  },
  {
    name: "Art",
    description: "Renaissance Art History",
    level: "Beginner",
    hardness: 3,
  },
];

const timeSlots = [
  {
    start_time: "2025-05-16T05:30:00.000Z",
    end_time: "2025-05-16T08:30:00.000Z",
  },
  {
    start_time: "2025-05-16T09:00:00.000Z",
    end_time: "2025-05-16T12:00:00.000Z",
  },
  {
    start_time: "2025-05-16T12:30:00.000Z",
    end_time: "2025-05-16T15:30:00.000Z",
  },
  {
    start_time: "2025-05-16T16:00:00.000Z",
    end_time: "2025-05-16T19:00:00.000Z",
  },
  {
    start_time: "2025-05-16T19:30:00.000Z",
    end_time: "2025-05-16T22:30:00.000Z",
  },
  {
    start_time: "2025-05-17T05:30:00.000Z",
    end_time: "2025-05-17T08:30:00.000Z",
  },
  {
    start_time: "2025-05-17T09:00:00.000Z",
    end_time: "2025-05-17T12:00:00.000Z",
  },
  {
    start_time: "2025-05-17T12:30:00.000Z",
    end_time: "2025-05-17T15:30:00.000Z",
  },
  {
    start_time: "2025-05-17T16:00:00.000Z",
    end_time: "2025-05-17T19:00:00.000Z",
  },
  {
    start_time: "2025-05-17T19:30:00.000Z",
    end_time: "2025-05-17T22:30:00.000Z",
  },
  {
    start_time: "2025-05-18T05:30:00.000Z",
    end_time: "2025-05-18T08:30:00.000Z",
  },
  {
    start_time: "2025-05-18T09:00:00.000Z",
    end_time: "2025-05-18T12:00:00.000Z",
  },
  {
    start_time: "2025-05-18T12:30:00.000Z",
    end_time: "2025-05-18T15:30:00.000Z",
  },
  {
    start_time: "2025-05-18T16:00:00.000Z",
    end_time: "2025-05-18T19:00:00.000Z",
  },
];

// Function to assign time slots to units
export function assign(units, slots) {
  const pairs = pair(units);
  const assignments = [];
  pairs.forEach((pair, index) => {
    const slotsForPair = pomodoro(slots[index]);
    const pairArray = Object.values(pair);
    pairArray.sort((a, b) => a.hardness - b.hardness);
    slotsForPair.forEach((slot) => {
      let arrayPos = 0;
      assignments.push({
        ...pairArray[arrayPos],
        ...slot,
      });
      arrayPos++;
      if (arrayPos > 1) {
        arrayPos = 0;
      }
      console.log({
        ...pairArray[arrayPos],
        ...slot,
      });
    });
  });
  return assignments;
  // [
  // {
  //   name: 'Art',
  //   description: 'Renaissance Art History',
  //   level: 'Beginner',
  //   hardness: 3,
  //   date: '2025-05-16',
  //   start_time: '05:30:00',
  //   end_time: '06:15:00'
  // }]
}

// Function to implement the Pomodoro Technique on a time slot
function pomodoro(timeSlot) {
  const workDuration = 45 * 60; // 45 minutes in seconds
  const breakDuration = 15 * 60; // 15 minutes in seconds
  const totalDuration = workDuration + breakDuration;
  const date = new Date(timeSlot.start_time).toISOString().split("T")[0];
  const startTime = new Date(timeSlot.start_time).getTime() / 1000;
  const endTime = new Date(timeSlot.end_time).getTime() / 1000;
  const availableSlots = (endTime - startTime) / totalDuration;
  const slots = [];

  let start = startTime;
  for (let i = 0; i < availableSlots; i++) {
    let end = start + workDuration; // Add work duration
    slots.push({
      date: date,
      start_time: new Date(start * 1000)
        .toISOString()
        .split("T")[1]
        .split(".")[0],
      end_time: new Date(end * 1000).toISOString().split("T")[1].split(".")[0],
    });
    start = end + breakDuration; // Add break duration
  }
  return slots;
}

// Function to determine pairs to share a time slot
function pair(units) {
  const pairs = [];
  units.sort((a, b) => a.hardness - b.hardness);
  const spare = units[0];
  while (units.length > 0) {
    let unit = units[0];
    if (units.length === 1) {
      pairs.push({
        unit1: unit,
        unit2: spare,
      });
      break;
    }
    if (units.length === 2) {
      pairs.push({
        unit1: units[0],
        unit2: units[1],
      });
      break;
    }
    let difference = 0;
    let pos;
    for (let i = 0; i < units.length; i++) {
      if (i == 0) continue;
      if (Math.abs(unit.hardness - units[i].hardness) > difference) {
        difference = Math.abs(unit.hardness - units[i].hardness);
        pos = i;
      }
    }
    pairs.push({
      unit1: unit,
      unit2: units[pos],
    });
    units.splice(pos, 1);
    units.shift();
  }
  return pairs;
  // [{
  // unit1: {
  //   name: 'History',
  //   description: 'World War II Overview',
  //   level: 'Intermediate',
  //   hardness: 6
  // },
  // unit2: {
  //   name: 'Computer Science',
  //   description: 'Introduction to Algorithms',
  //   level: 'Intermediate',
  //   hardness: 7
  // }]
}
