import { randomUUID } from "node:crypto";
import { readJson, updateJson, writeJson } from "@/lib/db";
import type { Challenge, CodeStep, Feedback, Lesson, Poll, Quiz, RewardConfig, Snapshot, Student, WorkshopSession } from "@/lib/types";

let staticCache: {
  lessons: Lesson[];
  codeSteps: CodeStep[];
  quizzes: Quiz[];
  polls: Poll[];
  challenges: Challenge[];
  rewards: RewardConfig[];
  timestamp: number;
} | null = null;

async function getStaticData() {
  const now = Date.now();
  if (staticCache && now - staticCache.timestamp < 10000) {
    return staticCache;
  }
  const [lessons, codeSteps, quizzes, polls, challenges, rewards] = await Promise.all([
    readJson<Lesson[]>("lessons.json"),
    readJson<CodeStep[]>("codeSteps.json"),
    readJson<Quiz[]>("quizzes.json"),
    readJson<Poll[]>("polls.json"),
    readJson<Challenge[]>("challenges.json"),
    readJson<RewardConfig[]>("rewards.json"),
  ]);
  staticCache = { lessons, codeSteps, quizzes, polls, challenges, rewards, timestamp: now };
  return staticCache;
}

export async function getSnapshot(viewer: Snapshot["viewer"]): Promise<Snapshot> {
  const [staticData, sessions, students, feedbacks] = await Promise.all([
    getStaticData(),
    readJson<WorkshopSession[]>("sessions.json"),
    readJson<Student[]>("students.json"),
    readJson<Feedback[]>("feedback.json"),
  ]);

  const { lessons, codeSteps, quizzes, polls, challenges, rewards } = staticData;
  const ranked = rankStudents(students);
  const visibleStudents = viewer.role === "trainer" ? ranked : ranked.map((student) => ({
    ...student,
    email: viewer.role === "student" && viewer.studentId === student.id ? student.email : "",
    usn: viewer.role === "student" && viewer.studentId === student.id ? student.usn : "",
  }));

  return {
    session: sessions[0],
    lessons,
    codeSteps,
    quizzes,
    polls,
    challenges,
    students: visibleStudents,
    feedbacks: feedbacks || [],
    rewards,
    viewer,
  };
}

export async function updateSession(change: (session: WorkshopSession) => WorkshopSession | Promise<WorkshopSession>) {
  return updateJson<WorkshopSession[]>("sessions.json", async (sessions) => {
    const updated = await change(sessions[0]);
    return [updated];
  });
}

export async function broadcast(event: string, payload?: Record<string, unknown>) {
  return updateSession((session) => ({
    ...session,
    broadcastVersion: (session.broadcastVersion || 0) + 1,
    lastEvent: event,
    lastPayload: payload ?? null,
  }));
}

export async function saveRankedStudents(students: Student[]) {
  const ranked = rankStudents(students);
  await writeJson("students.json", ranked);
  return ranked;
}

export async function upsertStudent(data: { name: string; usn: string; email: string; password?: string }) {
  const usn = data.usn.trim().toUpperCase();
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  const password = data.password?.trim() || "workshop123";

  const students = await readJson<Student[]>("students.json");
  const existing = students.find((s) => s.usn.toUpperCase() === usn);

  if (existing) {
    const updated = students.map((s) => (s.usn.toUpperCase() === usn ? { ...s, name, email, password } : s));
    await saveRankedStudents(updated);
    return existing;
  }

  const now = new Date().toISOString();
  const newStudent: Student = {
    id: `std_${randomUUID().slice(0, 8)}`,
    name,
    usn,
    email,
    password,
    coins: 100,
    xp: 100,
    rank: students.length + 1,
    currentLesson: "lesson_01",
    quizScore: 0,
    completedChallenges: 0,
    completedSimulatorIds: [],
    completedChallengeIds: [],
    quizIds: [],
    pollIds: [],
    participation: 1,
    joinedAt: now,
    lastSeenAt: now,
    rewardEligible: false,
    rewardStatus: "pending",
  };

  await saveRankedStudents([...students, newStudent]);
  return newStudent;
}

export async function submitFeedback(input: {
  studentId: string;
  rating: number;
  favoriteLesson: string;
  understandability: number;
  comments: string;
}) {
  const now = new Date().toISOString();
  const students = await readJson<Student[]>("students.json");
  const student = students.find((item) => item.id === input.studentId);
  if (!student) throw new Error("Student not found.");

  const feedbackRecord: Feedback = {
    id: `fb_${randomUUID().slice(0, 8)}`,
    studentId: student.id,
    studentName: student.name,
    usn: student.usn,
    email: student.email,
    rating: input.rating,
    favoriteLesson: input.favoriteLesson,
    understandability: input.understandability,
    comments: input.comments,
    submittedAt: now,
  };

  await updateJson<Feedback[]>("feedback.json", (current) => [...(current || []), feedbackRecord]);
  await awardCoins(student.id, 50, 2);
  return feedbackRecord;
}

export function rankStudents(students: Student[]) {
  return [...students]
    .sort((a, b) => b.coins - a.coins || b.xp - a.xp || a.name.localeCompare(b.name))
    .map((student, index) => ({ ...student, rank: index + 1 }));
}

export async function authenticateStudent(usnInput: string, passInput: string) {
  const usn = usnInput.trim().toUpperCase();
  const password = passInput.trim();
  const students = await readJson<Student[]>("students.json");
  const student = students.find((item) => item.usn.toUpperCase() === usn);
  if (!student) throw new Error("Student USN not registered.");
  if (student.password !== password) throw new Error("Incorrect password.");
  return student;
}

export async function awardCoins(studentId: string, amount: number, xpAmount: number = 0) {
  return updateJson<Student[]>("students.json", (students) =>
    students.map((student) => {
      if (student.id !== studentId) return student;
      return { ...student, coins: student.coins + amount, xp: student.xp + xpAmount };
    })
  );
}
