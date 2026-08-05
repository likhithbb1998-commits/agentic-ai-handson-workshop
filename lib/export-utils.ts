import type { Feedback, Student } from "@/lib/types";

export function calculatePerformanceScore(student: Student): number {
  const quizPct = Math.min(100, (student.quizScore / 13) * 100);
  const challengePct = Math.min(100, (student.completedChallenges / 3) * 100);
  const simulatorPct = Math.min(100, ((student.completedSimulatorIds?.length || 0) / 13) * 100);
  const participationPct = Math.min(100, (student.participation / 10) * 100);

  const score = Math.round(quizPct * 0.3 + challengePct * 0.4 + simulatorPct * 0.15 + participationPct * 0.15);
  return Math.min(100, Math.max(0, score));
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPerformanceCSV(students: Student[]) {
  const headers = [
    "Rank",
    "Name",
    "USN",
    "Gmail",
    "Performance Score (%)",
    "Total Coins",
    "XP",
    "Quiz Score",
    "Completed Challenges",
    "Simulators Done",
    "Participation Score",
    "Joined At",
  ];

  const rows = students.map((student) => {
    const score = calculatePerformanceScore(student);
    return [
      student.rank,
      `"${student.name.replace(/"/g, '""')}"`,
      `"${student.usn}"`,
      `"${student.email}"`,
      `${score}%`,
      student.coins,
      student.xp,
      student.quizScore,
      student.completedChallenges,
      student.completedSimulatorIds?.length || 0,
      student.participation,
      `"${new Date(student.joinedAt).toLocaleString()}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCSV(`student_performance_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

export function exportFeedbackCSV(feedbacks: Feedback[]) {
  const headers = [
    "Feedback ID",
    "Student Name",
    "USN",
    "Gmail",
    "Rating (1-5)",
    "Understandability (1-5)",
    "Favorite Lesson",
    "Comments",
    "Submitted At",
  ];

  const rows = feedbacks.map((fb) => [
    fb.id,
    `"${fb.studentName.replace(/"/g, '""')}"`,
    `"${fb.usn}"`,
    `"${fb.email}"`,
    fb.rating,
    fb.understandability,
    `"${fb.favoriteLesson.replace(/"/g, '""')}"`,
    `"${(fb.comments || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    `"${new Date(fb.submittedAt).toLocaleString()}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCSV(`student_feedback_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

export function exportLeaderboardCSV(students: Student[]) {
  const headers = ["Rank", "USN", "Name", "Coins", "XP", "Completed Challenges", "Quiz Score"];
  const rows = students.map((s) => [
    s.rank,
    `"${s.usn}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    s.coins,
    s.xp,
    s.completedChallenges,
    s.quizScore,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCSV(`leaderboard_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}
