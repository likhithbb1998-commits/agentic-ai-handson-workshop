import { NextResponse } from "next/server";
import { z } from "zod";
import { getIdentity } from "@/lib/auth";
import { awardCoins, broadcast, getSnapshot, saveRankedStudents, submitFeedback, updateSession } from "@/lib/workshop";
import { updateJson } from "@/lib/db";
import type { Student } from "@/lib/types";
import { executePython, forbiddenPython } from "@/lib/python-runner";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("START_SESSION") }),
  z.object({ action: z.literal("SET_LESSON"), lessonId: z.string().max(40) }),
  z.object({ action: z.literal("SET_STEP"), step: z.number().int().min(0).max(100) }),
  z.object({ action: z.literal("UPDATE_LIVE_CODE"), code: z.string().max(10000) }),
  z.object({ action: z.literal("SET_ACTIVITY"), activity: z.enum(["theory", "code", "simulator", "quiz", "poll", "challenge", "leaderboard"]) }),
  z.object({ action: z.literal("START_QUIZ"), quizId: z.string().max(40) }),
  z.object({ action: z.literal("NEXT_QUIZ_QUESTION") }),
  z.object({ action: z.literal("START_POLL"), pollId: z.string().max(40) }),
  z.object({ action: z.literal("START_CHALLENGE"), challengeId: z.string().max(40) }),
  z.object({ action: z.literal("ANSWER_QUIZ"), answer: z.number().int().min(0).max(10) }),
  z.object({ action: z.literal("ANSWER_POLL"), answer: z.number().int().min(0).max(20) }),
  z.object({ action: z.literal("COMPLETE_CHALLENGE"), challengeId: z.string().max(40), code: z.string().max(10000) }),
  z.object({ action: z.literal("COMPLETE_SIMULATOR"), lessonId: z.string().max(40) }),
  z.object({ action: z.literal("AWARD_COINS"), studentId: z.string().max(80), amount: z.number().int().min(-1000).max(1000) }),
  z.object({ action: z.literal("MARK_REWARD"), studentId: z.string().max(80), status: z.enum(["pending", "rewarded"]) }),
  z.object({
    action: z.literal("SUBMIT_FEEDBACK"),
    rating: z.number().int().min(1).max(5),
    favoriteLesson: z.string().max(100),
    understandability: z.number().int().min(1).max(5),
    comments: z.string().max(2000),
  }),
]);

export async function GET() {
  const identity = await getIdentity();
  const viewer = identity?.role === "trainer" ? { role: "trainer" as const }
    : identity?.role === "student" ? { role: "student" as const, studentId: identity.studentId }
      : { role: "public" as const };
  const snapshot = await getSnapshot(viewer);
  if (viewer.role !== "trainer") {
    snapshot.quizzes = snapshot.quizzes.map((quiz) => ({ ...quiz, questions: quiz.questions.map((question, questionIndex) => {
      const answered = viewer.role === "student" && snapshot.session.activeQuizId === quiz.id && snapshot.session.quizAnswers.some((answer) => answer.studentId === viewer.studentId && answer.questionIndex === questionIndex);
      return answered ? question : { ...question, correctAnswer: -1, explanation: "" };
    }) }));
    snapshot.polls = snapshot.polls.map((poll) => ({ ...poll, correctAnswer: undefined, explanation: undefined }));
    snapshot.challenges = snapshot.challenges.map((challenge) => ({ ...challenge, expectedPattern: "", testCode: "" }));
    snapshot.codeSteps = [];
  }
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const identity = await getIdentity();
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid workshop action." }, { status: 400 });
  const input = parsed.data;
  const trainerActions = ["START_SESSION", "SET_LESSON", "SET_STEP", "UPDATE_LIVE_CODE", "SET_ACTIVITY", "START_QUIZ", "NEXT_QUIZ_QUESTION", "START_POLL", "START_CHALLENGE", "AWARD_COINS", "MARK_REWARD"];
  if (trainerActions.includes(input.action) && identity?.role !== "trainer") return NextResponse.json({ error: "Trainer access required." }, { status: 403 });
  if (["ANSWER_QUIZ", "ANSWER_POLL", "COMPLETE_CHALLENGE", "COMPLETE_SIMULATOR", "SUBMIT_FEEDBACK"].includes(input.action) && identity?.role !== "student") return NextResponse.json({ error: "Student session required." }, { status: 403 });

  const snapshot = await getSnapshot(identity?.role === "student" ? { role: "student", studentId: identity.studentId } : { role: identity?.role || "public" });
  const now = new Date();

  switch (input.action) {
    case "START_SESSION":
      await updateSession((session) => ({ ...session, isLive: !session.isLive, winnerMessage: null }));
      broadcast("LESSON_CHANGED"); break;
    case "SET_LESSON":
      if (!snapshot.lessons.some((lesson) => lesson.id === input.lessonId)) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
      await updateSession((session) => ({ ...session, lessonId: input.lessonId, codeStep: 0, liveCode: "", codeOutput: null, activity: "theory", winnerMessage: null, celebration: null }));
      await updateJson<Student[]>("students.json", (current) => current.map((student) => ({ ...student, currentLesson: input.lessonId })));
      broadcast("LESSON_CHANGED", { lessonId: input.lessonId }); break;
    case "SET_STEP":
      await updateSession((session) => ({ ...session, codeStep: input.step, activity: "code" }));
      broadcast("CODE_STEP_CHANGED", { step: input.step }); break;
    case "UPDATE_LIVE_CODE":
      await updateSession((session) => ({ ...session, liveCode: input.code, activity: "code" }));
      broadcast("LIVE_CODE_UPDATED", { code: input.code }); break;
    case "SET_ACTIVITY":
      await updateSession((session) => ({ ...session, activity: input.activity, celebration: null }));
      broadcast("ACTIVITY_CHANGED", { activity: input.activity }); break;
    case "START_QUIZ": { const quiz = snapshot.quizzes.find((item) => item.id === input.quizId); if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
      await updateSession((session) => ({ ...session, activity: "quiz", activeQuizId: quiz.id, quizQuestionIndex: 0, activePollId: null, activeChallengeId: null, activityStartedAt: now.toISOString(), timerEndsAt: new Date(now.getTime() + quiz.timeLimit * 1000).toISOString(), quizAnswers: [], winnerMessage: null, celebration: null }));
      broadcast("QUIZ_STARTED", { quizId: quiz.id }); break; }
    case "NEXT_QUIZ_QUESTION": {
      const quiz = snapshot.quizzes.find((item) => item.id === snapshot.session.activeQuizId);
      if (!quiz) return NextResponse.json({ error: "Start a quiz first." }, { status: 409 });
      const nextIndex = snapshot.session.quizQuestionIndex + 1;
      if (nextIndex >= quiz.questions.length) return NextResponse.json({ error: "This was the final question." }, { status: 409 });
      await updateSession((session) => ({ ...session, quizQuestionIndex: nextIndex, activityStartedAt: now.toISOString(), timerEndsAt: new Date(now.getTime() + quiz.timeLimit * 1000).toISOString(), winnerMessage: null, celebration: null }));
      broadcast("QUIZ_QUESTION_CHANGED", { questionIndex: nextIndex }); break;
    }
    case "START_POLL": { const poll = snapshot.polls.find((item) => item.id === input.pollId); if (!poll) return NextResponse.json({ error: "Poll not found." }, { status: 404 });
      await updateSession((session) => ({ ...session, activity: "poll", activePollId: poll.id, activeQuizId: null, activeChallengeId: null, activityStartedAt: now.toISOString(), timerEndsAt: null, pollAnswers: [], winnerMessage: null, celebration: null }));
      broadcast("POLL_STARTED", { pollId: poll.id }); break; }
    case "START_CHALLENGE": { const challenge = snapshot.challenges.find((item) => item.id === input.challengeId); if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
      await updateSession((session) => ({ ...session, activity: "challenge", activeChallengeId: challenge.id, activeQuizId: null, activePollId: null, activityStartedAt: now.toISOString(), timerEndsAt: new Date(now.getTime() + challenge.timeLimit * 1000).toISOString(), challengeAnswers: [], winnerMessage: null, celebration: null }));
      broadcast("CHALLENGE_STARTED", { challengeId: challenge.id }); break; }
    case "AWARD_COINS": await awardCoins(input.studentId, input.amount); broadcast("COINS_AWARDED", input); break;
    case "MARK_REWARD": {
      const students = await updateJson<Student[]>("students.json", (current) => current.map((student) => student.id === input.studentId ? { ...student, rewardEligible: true, rewardStatus: input.status } : student));
      await saveRankedStudents(students); broadcast("REWARD_AWARDED", input); break; }
    case "ANSWER_QUIZ": {
      const studentId = identity!.role === "student" ? identity!.studentId : "";
      const quiz = snapshot.quizzes.find((item) => item.id === snapshot.session.activeQuizId);
      const questionIndex = snapshot.session.quizQuestionIndex;
      const question = quiz?.questions[questionIndex];
      const quizOpen = snapshot.session.activity === "quiz" && (!snapshot.session.timerEndsAt || now <= new Date(snapshot.session.timerEndsAt));
      if (!quizOpen || !quiz || !question || snapshot.session.quizAnswers.some((answer) => answer.studentId === studentId && answer.questionIndex === questionIndex)) return NextResponse.json({ error: "This question is closed, unavailable, or already answered." }, { status: 409 });
      const correct = input.answer === question.correctAnswer;
      const correctBefore = snapshot.session.quizAnswers.filter((answer) => answer.questionIndex === questionIndex && answer.correct).length;
      const reward = correct ? (quiz.speedRewards[correctBefore] ?? quiz.reward) : 0;
      const responseMs = Math.max(0, now.getTime() - new Date(snapshot.session.activityStartedAt || now).getTime());
      const studentName = snapshot.students.find((s) => s.id === studentId)?.name || "A student";
      await updateSession((session) => ({ ...session, quizAnswers: [...session.quizAnswers, { studentId, answer: input.answer, correct, respondedAt: now.toISOString(), responseMs, reward, questionIndex }], winnerMessage: correctBefore === 0 && correct ? `${studentName} was the fastest correct answer!` : session.winnerMessage, celebration: correct ? { studentName, reward, kind: "quiz", createdAt: now.toISOString() } : session.celebration }));
      const students = await updateJson<Student[]>("students.json", (current) => current.map((student) => student.id === studentId ? { ...student, coins: student.coins + reward, xp: student.xp + reward, quizIds: [...new Set([...student.quizIds, quiz.id])], quizScore: student.quizScore + (correct ? 1 : 0), participation: student.participation + 1, lastSeenAt: now.toISOString() } : student));
      await saveRankedStudents(students); broadcast("QUIZ_ANSWERED", { studentId, correct, reward }); break; }
    case "ANSWER_POLL": {
      const studentId = identity!.role === "student" ? identity!.studentId : "";
      const poll = snapshot.polls.find((item) => item.id === snapshot.session.activePollId);
      if (snapshot.session.activity !== "poll" || !poll || snapshot.session.pollAnswers.some((answer) => answer.studentId === studentId)) return NextResponse.json({ error: "Poll is unavailable or already answered." }, { status: 409 });
      const responseMs = Math.max(0, now.getTime() - new Date(snapshot.session.activityStartedAt || now).getTime());
      await updateSession((session) => ({ ...session, pollAnswers: [...session.pollAnswers, { studentId, answer: input.answer, respondedAt: now.toISOString(), responseMs, reward: poll.reward }] }));
      const students = await updateJson<Student[]>("students.json", (current) => current.map((student) => student.id === studentId ? { ...student, coins: student.coins + poll.reward, xp: student.xp + poll.reward, pollIds: [...new Set([...student.pollIds, poll.id])], participation: student.participation + 1, lastSeenAt: now.toISOString() } : student));
      await saveRankedStudents(students); broadcast("POLL_UPDATED", { studentId }); break; }
    case "COMPLETE_SIMULATOR": {
      const studentId = identity!.role === "student" ? identity!.studentId : "";
      const student = snapshot.students.find((item) => item.id === studentId);
      if (snapshot.session.activity !== "simulator" || snapshot.session.lessonId !== input.lessonId || !student || student.completedSimulatorIds.includes(input.lessonId)) return NextResponse.json({ error: "The trainer has not opened this simulator, or it is already completed." }, { status: 409 });
      const students = await updateJson<Student[]>("students.json", (current) => current.map((item) => item.id === studentId ? { ...item, coins: item.coins + 50, xp: item.xp + 50, completedSimulatorIds: [...item.completedSimulatorIds, input.lessonId], participation: item.participation + 1 } : item));
      await saveRankedStudents(students); broadcast("COINS_AWARDED", { studentId, amount: 50 }); break; }
    case "COMPLETE_CHALLENGE": {
      const studentId = identity!.role === "student" ? identity!.studentId : "";
      const challenge = snapshot.challenges.find((item) => item.id === input.challengeId);
      const student = snapshot.students.find((item) => item.id === studentId);
      const challengeOpen = snapshot.session.activity === "challenge" && snapshot.session.activeChallengeId === input.challengeId && (!snapshot.session.timerEndsAt || now <= new Date(snapshot.session.timerEndsAt));
      if (!challengeOpen || !challenge || !student || student.completedChallengeIds.includes(challenge.id)) return NextResponse.json({ error: "The trainer has not opened this challenge, time has ended, or it is already completed." }, { status: 409 });
      if (forbiddenPython.test(input.code)) return NextResponse.json({ error: "Use only safe workshop Python without imports, files, network, or dynamic execution." }, { status: 400 });
      const matches = new RegExp(challenge.expectedPattern, "m").test(input.code);
      if (!matches) return NextResponse.json({ error: "Not quite. Check the required function or fix and try again." }, { status: 422 });
      const checked = await executePython(`${input.code}\n\n${challenge.testCode}`);
      if (checked.status !== "success" || checked.stderr) return NextResponse.json({ error: "The hidden checks did not pass. Run your code, fix the error or returned value, and submit again." }, { status: 422 });
      const first = snapshot.session.challengeAnswers.length === 0;
      const reward = first ? challenge.firstReward : challenge.reward;
      const responseMs = Math.max(0, now.getTime() - new Date(snapshot.session.activityStartedAt || now).getTime());
      await updateSession((session) => ({ ...session, challengeAnswers: [...session.challengeAnswers, { studentId, answer: 0, correct: true, respondedAt: now.toISOString(), responseMs, reward }], winnerMessage: first ? `${student.name} completed the challenge first!` : session.winnerMessage, celebration: { studentName: student.name, reward, kind: "challenge", createdAt: now.toISOString() } }));
      const students = await updateJson<Student[]>("students.json", (current) => current.map((item) => item.id === studentId ? { ...item, coins: item.coins + reward, xp: item.xp + reward, completedChallengeIds: [...item.completedChallengeIds, challenge.id], completedChallenges: item.completedChallenges + 1, participation: item.participation + 1 } : item));
      await saveRankedStudents(students); broadcast("CHALLENGE_COMPLETED", { studentId, reward }); break; }
    case "SUBMIT_FEEDBACK": {
      const studentId = identity!.role === "student" ? identity!.studentId : "";
      if (!studentId) return NextResponse.json({ error: "Student sign-in required." }, { status: 401 });
      const record = await submitFeedback({
        studentId,
        rating: input.rating,
        favoriteLesson: input.favoriteLesson,
        understandability: input.understandability,
        comments: input.comments,
      });
      broadcast("FEEDBACK_SUBMITTED", { studentId: record.studentId });
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
