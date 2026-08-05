export type ActivityType = "theory" | "code" | "simulator" | "quiz" | "poll" | "challenge" | "leaderboard";

export type Student = {
  id: string;
  usn: string;
  name: string;
  email: string;
  password?: string;
  coins: number;
  xp: number;
  rank: number;
  completedChallenges: number;
  completedChallengeIds: string[];
  completedSimulatorIds: string[];
  pollIds: string[];
  quizIds: string[];
  quizScore: number;
  currentLesson: string;
  participation: number;
  rewardEligible: boolean;
  rewardStatus: "none" | "pending" | "rewarded";
  joinedAt: string;
  lastSeenAt: string;
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  eyebrow: string;
  summary: string;
  analogy: string;
  technicalIdea: string;
  icon: string;
  color: string;
  question: string;
  options: string[];
  correctAnswer: number;
  keyTakeaways?: string[];
  architectureStep?: string;
  industryExample?: string;
  detailedContent?: string;
};

export type Feedback = {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  email: string;
  rating: number;
  favoriteLesson: string;
  understandability: number;
  comments: string;
  submittedAt: string;
};

export type CodeStep = {
  id: string;
  lessonId: string;
  order: number;
  code: string;
  explanation: string;
  why: string;
  analogy: string;
  concept: string;
  icon: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type Quiz = {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
  reward: number;
  speedRewards: number[];
};

export type Poll = {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  reward: number;
  correctAnswer?: number;
  explanation?: string;
};

export type Challenge = {
  id: string;
  lessonId: string;
  type: "code" | "debug" | "final";
  title: string;
  prompt: string;
  starterCode: string;
  expectedPattern: string;
  testCode: string;
  reward: number;
  firstReward: number;
  timeLimit: number;
};

export type AnswerRecord = {
  studentId: string;
  answer: number;
  correct?: boolean;
  respondedAt: string;
  responseMs: number;
  reward: number;
  questionIndex?: number;
};

export type Celebration = {
  studentName: string;
  reward: number;
  kind: "quiz" | "challenge";
  createdAt: string;
};

export type WorkshopSession = {
  id: string;
  title: string;
  isLive: boolean;
  lessonId: string;
  codeStep: number;
  liveCode: string;
  activity: ActivityType;
  activeQuizId: string | null;
  quizQuestionIndex: number;
  activePollId: string | null;
  activeChallengeId: string | null;
  activityStartedAt: string | null;
  timerEndsAt: string | null;
  quizAnswers: AnswerRecord[];
  pollAnswers: AnswerRecord[];
  challengeAnswers: AnswerRecord[];
  codeOutput: { stdout: string; stderr: string; durationMs: number; status: string } | null;
  winnerMessage: string | null;
  celebration: Celebration | null;
  broadcastVersion?: number;
  scrollPosition?: number;
  lastEvent?: string | null;
  lastPayload?: Record<string, unknown> | null;
  updatedAt: string;
};

export type RewardConfig = { rank: number; label: string };

export type Snapshot = {
  session: WorkshopSession;
  lessons: Lesson[];
  codeSteps: CodeStep[];
  quizzes: Quiz[];
  polls: Poll[];
  challenges: Challenge[];
  students: Student[];
  feedbacks: Feedback[];
  rewards: RewardConfig[];
  viewer: { role: "trainer" | "student" | "public"; studentId?: string };
};
