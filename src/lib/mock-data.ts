// Demo/mock data for CampusAI. Replace with real backend data via admin panel later.

export const SUBJECTS = [
  { code: "CS301", name: "Database Management Systems", faculty: "Prof. Mittal Patne", credits: 4, semester: "5", attended: 21, total: 24 },
  { code: "CS302", name: "Machine Learning", faculty: "Prof. Aachal Wani", credits: 4, semester: "5", attended: 18, total: 22 },
  { code: "CS303", name: "PEC-1 Interactive Graphics", faculty: "Dr. Supriya Sawwashere", credits: 3, semester: "5", attended: 15, total: 20 },
  { code: "CS304", name: "PEC-2 Computer Forensic", faculty: "Dr. Pravin Kulurkar", credits: 3, semester: "5", attended: 15, total: 20 },
  { code: "CS305", name: "Open Elective", faculty: "Prof. Praful Misal", credits: 3, semester: "5", attended: 19, total: 21 },
  { code: "CS306", name: "Machine Learning Lab", faculty: "Prof. Om Butle", credits: 4, semester: "5", attended: 12, total: 20 },
  { code: "CS307", name: "MDM-III Prompt Engineering", faculty: "Prof. Karishma Bobde", credits: 2, semester: "5", attended: 10, total: 10 },
  { code: "CS308", name: "MDM-IV EBS LLM", faculty: "Prof. Namita Gahukar", credits: 2, semester: "5", attended: 10, total: 10 },
  { code: "CS309", name: "IOT - Internet of Things", faculty: "Prof. Siddharth Ghosh", credits: 2, semester: "5", attended: 10, total: 10 },
];

export const TIMETABLE: Record<string, Array<{ start: string; end: string; subject: string; code: string; room: string; faculty: string }>> = {
  Monday: [
    { start: "10:20", end: "11:20", subject: "IOT - Internet of Things", code: "CS309", room: "Room VS-009", faculty: "Prof. Siddharth Ghosh" },
    { start: "11:20", end: "12:20", subject: "Machine Learning", code: "CS302", room: "Room VS-009", faculty: "Prof. Aachal Wani" },
    { start: "12:20", end: "01:00", subject: "Break", code: "", room: "", faculty: "" },
    { start: "01:00", end: "02:00", subject: "PEC-1 Interactive Graphics", code: "CS303", room: "Room VS-205", faculty: "Dr. Supriya Sawwashere" },
    { start: "02:00", end: "03:00", subject: "MDM-IV EBS LLM", code: "CS308", room: "Room VS-009", faculty: "Prof. Namita Gahukar" },
    { start: "03:00", end: "03:15", subject: "Break", code: "", room: "", faculty: "" },
    { start: "03:15", end: "04:15", subject: "PEC-2 Computer Forensic", code: "CS304", room: "Room VS-009", faculty: "Dr. Pravin Kulurkar" },
    { start: "04:15", end: "05:15", subject: "TG - Lecture", code: "", room: "", faculty: "" },
  ],
  Tuesday: [
    { start: "10:20", end: "12:20", subject: "Machine Learning Lab", code: "CS306", room: "Lab VS-214", faculty: "Prof. Om Butle" },
    { start: "12:20", end: "01:00", subject: "Break", code: "", room: "", faculty: "" },
    { start: "01:00", end: "02:00", subject: "Open Elective", code: "CS305", room: "", faculty: "Prof. Praful Misal" },
    { start: "02:00", end: "03:00", subject: "PEC-2 Computer Forensic", code: "CS304", room: "Room VS-009", faculty: "Dr. Pravin Kulurkar" },
    { start: "03:00", end: "03:15", subject: "Break", code: "", room: "", faculty: "" },
    { start: "03:15", end: "05:15", subject: "Sports", code: "", room: "", faculty: "" },
  ],
  Wednesday: [
    { start: "10:20", end: "11:20", subject: "Database Management System", code: "CS301", room: "Room VS-009", faculty: "Prof. Mittal Patne" },
    { start: "11:20", end: "12:20", subject: "PEC-1 Interactive Graphics", code: "CS303", room: "Room VS-205", faculty: "Dr. Supriya Sawwashere" },
    { start: "12:20", end: "01:00", subject: "Break", code: "", room: "", faculty: "" },
    { start: "01:00", end: "02:00", subject: "Open Elective", code: "CS305", room: "", faculty: "Prof. Praful Misal" },
    { start: "02:00", end: "03:00", subject: "PEC-2 Computer Forensic", code: "CS304", room: "Room VS-009", faculty: "Dr. Pravin Kulurkar" },
    { start: "03:00", end: "03:15", subject: "Break", code: "", room: "", faculty: "" },
    { start: "03:15", end: "04:15", subject: "IOT - Internet of Things", code: "CS309", room: "Room VS-009", faculty: "Prof. Siddharth Ghosh" },
    { start: "04:15", end: "05:15", subject: "MDM-III Prompt Engineering", code: "CS307", room: "Room VS-009", faculty: "Prof. Karishma Bobde" },
  ],
  Thursday: [
    { start: "10:20", end: "11:20", subject: "MDM-III Prompt Engineering", code: "CS307", room: "Room VS-009", faculty: "Prof. Karishma Bobde" },
    { start: "11:20", end: "12:20", subject: "Machine Learning", code: "CS302", room: "Room VS-009", faculty: "Prof. Aachal Wani" },
    { start: "12:20", end: "01:00", subject: "Break", code: "", room: "", faculty: "" },
    { start: "01:00", end: "03:00", subject: "Cluster", code: "", room: "Lab NL-110", faculty: ""},
    { start: "03:00", end: "03:15", subject: "Break", code: "", room: "", faculty: "" },
    { start: "03:15", end: "04:15", subject: "Database Management System", code: "CS301", room: "Room VS-009", faculty: "Prof. Mittal Patne" },
    { start: "04:15", end: "05:15", subject: "MDM-IV EBS LLM", code: "CS308", room: "Room VS-009", faculty: "Prof. Namita Gahukar" },
  ],
  Friday: [
    { start: "10:20", end: "12:20", subject: "Database Management System Lab", code: "", room: "Lab NL-110", faculty: "Prof. Yogita Mhaske" },
    { start: "12:20", end: "01:00", subject: "Break", code: "", room: "", faculty: "" },
    { start: "01:00", end: "03:00", subject: "JDCAP-III PPT", code: "", room: "Lab NL-110", faculty: "Ms. Aasawari Bhaisare" },
    { start: "03:00", end: "03:15", subject: "Break", code: "", room: "", faculty: "" },
    { start: "03:15", end: "04:15", subject: "Database Management System", code: "CS301", room: "Room VS-009", faculty: "Prof. Mittal Patne" },
    { start: "04:15", end: "05:15", subject: "Mini - Project", code: "", room: "Room VS-009", faculty: "" },
  ],
  Saturday: [],
  Sunday: [],
};


export const FACULTY = [

  { 
    name: "Prof. Mittal Patne", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["Database Management Systems"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Aachal Wani", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["Machine Learning"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Dr. Supriya Sawwashere", 
    department: "Computer Science and Engineering", 
    designation: "Head of the Department", 
    subjects: ["PEC-1 Interactive Graphics"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Dr. Pravin Kulurkar", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["PEC-2 Computer Forensic"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Praful Misal", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["Open Elective"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Om Butle", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["Machine Learning Lab"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Karishma Bobde", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["MDM-III Prompt Engineering"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Namita Gahukar", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["MDM-IV EBS LLM"], 
    email: "", 
    office: "", 
    initials: "" 
  },

  { 
    name: "Prof. Siddharth Ghosh", 
    department: "Computer Science and Engineering", 
    designation: "Professor", 
    subjects: ["IOT - Internet of Things"], 
    email: "", 
    office: "", 
    initials: "" 
  },

];

export const NOTICES = [
  { id: 1, title: "Mid-semester exam schedule released", category: "Examination", date: "2026-07-24", description: "Mid-sem examinations for all 5th semester CSE subjects begin from 2 August. Check individual dates on the exams page.", attachments: 1 },
  { id: 2, title: "TCS campus drive open for registration", category: "Placement", date: "2026-07-22", description: "TCS Digital hiring drive opens on 5 August. Eligible: 60% throughout, no active backlogs. Register by 30 July.", attachments: 2 },
  { id: 3, title: "Annual Techfest 'Nexus 2026' announced", category: "Events", date: "2026-07-20", description: "Nexus 2026 will run 12–14 September with 24+ events, workshops and keynote by industry leaders.", attachments: 1 },
  { id: 4, title: "Library timings extended during exams", category: "Academic", date: "2026-07-18", description: "The central library will remain open until 11 PM from 25 July to 20 August.", attachments: 0 },
  { id: 5, title: "Guest lecture on Distributed Systems", category: "Academic", date: "2026-07-16", description: "Guest lecture by Dr. Anand Rao (ex-Google) on distributed consensus, 29 July at 3 PM, Auditorium B.", attachments: 0 },
  { id: 6, title: "Google Summer of Code 2026 orientation", category: "Placement", date: "2026-07-15", description: "Orientation session for GSoC 2026 aspirants by senior open-source contributors.", attachments: 1 },
  { id: 7, title: "Sports day registration", category: "Events", date: "2026-07-12", description: "Register for the annual inter-department sports meet by 5 August.", attachments: 0 },
];

export const EVENTS = [
  { id: 1, title: "Nexus 2026 — Annual Techfest", date: "2026-09-12", time: "10:00", venue: "Main Auditorium", description: "24+ events across coding, robotics, quiz, gaming and design. Guest keynote by industry leaders.", banner: "linear-gradient(135deg, oklch(0.58 0.22 285), oklch(0.72 0.18 195))" },
  { id: 2, title: "Hackathon 'CodeStorm'", date: "2026-08-15", time: "09:00", venue: "Innovation Lab", description: "24-hour hackathon with ₹1L prize pool, mentorship and free swag.", banner: "linear-gradient(135deg, oklch(0.66 0.2 340), oklch(0.58 0.22 285))" },
  { id: 3, title: "AI/ML Workshop", date: "2026-08-05", time: "14:00", venue: "Room 302", description: "Hands-on with transformers, LangChain and building your own agents.", banner: "linear-gradient(135deg, oklch(0.72 0.18 195), oklch(0.75 0.17 85))" },
  { id: 4, title: "Guest Lecture: Distributed Systems", date: "2026-07-29", time: "15:00", venue: "Auditorium B", description: "By Dr. Anand Rao (ex-Google) on real-world consensus and CAP tradeoffs.", banner: "linear-gradient(135deg, oklch(0.58 0.22 285), oklch(0.66 0.2 340))" },
  { id: 5, title: "Inter-Dept Sports Meet", date: "2026-08-22", time: "08:00", venue: "Sports Complex", description: "Cricket, football, basketball, athletics — represent your department!", banner: "linear-gradient(135deg, oklch(0.75 0.17 85), oklch(0.62 0.2 25))" },
  { id: 6, title: "Cultural Night 'Verve'", date: "2026-09-14", time: "18:00", venue: "Open Air Theatre", description: "Music, dance and DJ night — the closing act of Nexus 2026.", banner: "linear-gradient(135deg, oklch(0.62 0.2 25), oklch(0.66 0.2 340))" },
];

export const EXAMS = [
  { id: "", subject: "Database Management System (DBMS)", code: "", date: "2026-08-10", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "Machine Learning (ML)", code: "", date: "2026-08-11", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "Internet of Things (IOT)", code: "", date: "2026-08-12", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "JDCAP-III: Placement Preparation Training", code: "", date: "2026-08-13", time: "Timely Schedule - Given by TnP", duration: "1h", room: "", status: "" },
  { id: "", subject: "PEC-I (BT/CC/IG)", code: "", date: "2026-08-14", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "PEC-II (BDAT/RJS/CF)", code: "", date: "2026-08-17", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "MDM-III (Prompt Engineering)", code: "", date: "2026-08-18", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "Open Elective - III", code: "", date: "2026-08-19", time: "10:20", duration: "1h", room: "", status: "" },
  { id: "", subject: "MDM-IV (Ethics, Bias & Safety in LLM)", code: "", date: "2026-08-20", time: "10:20", duration: "1h", room: "", status: "" },
];

export const RESULTS = [
  { semester: "Semester 4", sgpa: 8.72, results: [
    { subject: "Data Structures", grade: "A", marks: 82 },
    { subject: "Discrete Math", grade: "A+", marks: 89 },
    { subject: "Digital Logic", grade: "A", marks: 78 },
    { subject: "Object-Oriented Programming", grade: "A+", marks: 91 },
    { subject: "Probability & Statistics", grade: "B+", marks: 74 },
  ]},
  { semester: "Semester 3", sgpa: 8.45, results: [
    { subject: "Calculus III", grade: "A", marks: 80 },
    { subject: "Computer Organization", grade: "A", marks: 83 },
    { subject: "Data Communication", grade: "B+", marks: 75 },
    { subject: "Discrete Structures", grade: "A+", marks: 88 },
  ]},
];

export const MONTHLY_ATTENDANCE = [
  { month: "Feb", percent: 92 },
  { month: "Mar", percent: 88 },
  { month: "Apr", percent: 85 },
  { month: "May", percent: 79 },
  { month: "Jun", percent: 82 },
  { month: "Jul", percent: 87 },
];

export const WEEKLY_ACTIVITY = [
  { day: "Mon", hours: 6 },
  { day: "Tue", hours: 4 },
  { day: "Wed", hours: 7 },
  { day: "Thu", hours: 5 },
  { day: "Fri", hours: 6 },
  { day: "Sat", hours: 2 },
  { day: "Sun", hours: 1 },
];

export function getAttendanceSummary() {
  const totalAttended = SUBJECTS.reduce((a, s) => a + s.attended, 0);
  const total = SUBJECTS.reduce((a, s) => a + s.total, 0);
  return { attended: totalAttended, total, percent: Math.round((totalAttended / total) * 100) };
}

export function dayName(d: Date) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
}
