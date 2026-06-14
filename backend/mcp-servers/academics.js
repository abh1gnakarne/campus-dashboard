// MCP Server: Academics
// Handles timetables, exam schedules, deadlines, faculty info

const TIMETABLE = {
  Monday: [
    { time: "9:00 - 10:00", subject: "Data Structures", faculty: "Dr. Sharma", room: "101" },
    { time: "10:00 - 11:00", subject: "Operating Systems", faculty: "Prof. Rao", room: "203" },
    { time: "11:15 - 12:15", subject: "DBMS", faculty: "Dr. Mehta", room: "Lab 2" },
    { time: "2:00 - 3:00", subject: "Computer Networks", faculty: "Prof. Kumar", room: "105" },
    { time: "3:00 - 4:00", subject: "Software Engineering", faculty: "Dr. Nair", room: "204" },
  ],
  Tuesday: [
    { time: "9:00 - 10:00", subject: "Algorithms", faculty: "Dr. Sharma", room: "102" },
    { time: "10:00 - 12:00", subject: "OS Lab", faculty: "Prof. Rao", room: "Lab 1" },
    { time: "2:00 - 3:00", subject: "DBMS", faculty: "Dr. Mehta", room: "201" },
    { time: "3:00 - 4:00", subject: "Computer Networks", faculty: "Prof. Kumar", room: "105" },
  ],
  Wednesday: [
    { time: "9:00 - 10:00", subject: "Software Engineering", faculty: "Dr. Nair", room: "204" },
    { time: "10:00 - 11:00", subject: "Data Structures", faculty: "Dr. Sharma", room: "101" },
    { time: "11:15 - 1:15", subject: "Networks Lab", faculty: "Prof. Kumar", room: "Lab 3" },
    { time: "2:00 - 3:00", subject: "Algorithms", faculty: "Dr. Sharma", room: "102" },
  ],
  Thursday: [
    { time: "9:00 - 10:00", subject: "Operating Systems", faculty: "Prof. Rao", room: "203" },
    { time: "10:00 - 11:00", subject: "DBMS", faculty: "Dr. Mehta", room: "201" },
    { time: "11:15 - 12:15", subject: "Computer Networks", faculty: "Prof. Kumar", room: "105" },
    { time: "2:00 - 4:00", subject: "DS Lab", faculty: "Dr. Sharma", room: "Lab 2" },
  ],
  Friday: [
    { time: "9:00 - 10:00", subject: "Algorithms", faculty: "Dr. Sharma", room: "102" },
    { time: "10:00 - 11:00", subject: "Software Engineering", faculty: "Dr. Nair", room: "204" },
    { time: "11:15 - 12:15", subject: "Operating Systems", faculty: "Prof. Rao", room: "203" },
    { time: "2:00 - 3:00", subject: "DBMS", faculty: "Dr. Mehta", room: "201" },
  ],
  Saturday: [
    { time: "9:00 - 11:00", subject: "DBMS Lab", faculty: "Dr. Mehta", room: "Lab 2" },
    { time: "11:15 - 12:15", subject: "Elective", faculty: "TBD", room: "Elective Hall" },
  ],
};

const EXAM_SCHEDULE = [
  {
    subject: "Data Structures",
    date: "2026-07-10",
    time: "10:00 AM - 1:00 PM",
    hall: "Exam Hall A",
    type: "End Semester",
  },
  {
    subject: "Operating Systems",
    date: "2026-07-12",
    time: "10:00 AM - 1:00 PM",
    hall: "Exam Hall B",
    type: "End Semester",
  },
  {
    subject: "DBMS",
    date: "2026-07-14",
    time: "2:00 PM - 5:00 PM",
    hall: "Exam Hall A",
    type: "End Semester",
  },
  {
    subject: "Computer Networks",
    date: "2026-07-16",
    time: "10:00 AM - 1:00 PM",
    hall: "Exam Hall C",
    type: "End Semester",
  },
  {
    subject: "Algorithms",
    date: "2026-07-18",
    time: "10:00 AM - 1:00 PM",
    hall: "Exam Hall B",
    type: "End Semester",
  },
  {
    subject: "Software Engineering",
    date: "2026-07-20",
    time: "2:00 PM - 5:00 PM",
    hall: "Exam Hall A",
    type: "End Semester",
  },
];

const DEADLINES = [
  { title: "MARS Open Project Submission", subject: "All", date: "2026-07-01", type: "Project" },
  { title: "Software Engineering Term Paper", subject: "Software Engineering", date: "2026-06-25", type: "Assignment" },
  { title: "DBMS Mini Project Demo", subject: "DBMS", date: "2026-06-28", type: "Lab" },
  { title: "Network Assignment 3", subject: "Computer Networks", date: "2026-06-20", type: "Assignment" },
  { title: "Internal Assessment 3", subject: "All", date: "2026-06-30", type: "Internal" },
];

export const academicsMCP = {
  name: "academics",
  description: "Timetables, exam schedules, deadlines, and faculty info",

  tools: [
    {
      name: "get_todays_timetable",
      description: "Get today's class schedule",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_timetable_by_day",
      description: "Get class schedule for a specific day",
      inputSchema: {
        type: "object",
        properties: { day: { type: "string" } },
        required: ["day"],
      },
    },
    {
      name: "get_exam_schedule",
      description: "Get upcoming exam dates",
      inputSchema: { type: "object", properties: { subject: { type: "string" } } },
    },
    {
      name: "get_deadlines",
      description: "Get upcoming assignment and project deadlines",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_next_class",
      description: "Get the next class happening today",
      inputSchema: { type: "object", properties: {} },
    },
  ],

  async executeTool(toolName, args) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    switch (toolName) {
      case "get_todays_timetable":
        return {
          day: today,
          classes: TIMETABLE[today] || [],
          total: (TIMETABLE[today] || []).length,
        };

      case "get_timetable_by_day": {
        const day = args.day;
        return {
          day,
          classes: TIMETABLE[day] || [],
          total: (TIMETABLE[day] || []).length,
        };
      }

      case "get_exam_schedule": {
        let exams = EXAM_SCHEDULE;
        if (args?.subject) {
          exams = EXAM_SCHEDULE.filter((e) =>
            e.subject.toLowerCase().includes(args.subject.toLowerCase())
          );
        }
        return { exams, total: exams.length };
      }

      case "get_deadlines": {
        const todayDate = new Date().toISOString().split("T")[0];
        const upcoming = DEADLINES.filter((d) => d.date >= todayDate).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        return { deadlines: upcoming, total: upcoming.length };
      }

      case "get_next_class": {
        const todayClasses = TIMETABLE[today] || [];
        const next = todayClasses.find((cls) => {
          const startTime = cls.time.split(" - ")[0];
          const [h, m] = startTime.split(":").map(Number);
          const classTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          return classTime >= currentTime;
        });
        return next
          ? { found: true, class: next, message: `Next: ${next.subject} at ${next.time} in ${next.room}` }
          : { found: false, message: "No more classes today!" };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  },
};
