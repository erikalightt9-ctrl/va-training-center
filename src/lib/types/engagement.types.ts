export interface CourseEngagementMetrics {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly totalEnrolled: number;
  readonly lessonCompletionRate: number;
  readonly averageQuizScore: number;
  readonly assignmentSubmissionRate: number;
  readonly activeStudents: number;
  readonly forumPostCount: number;
}

export type EngagementStatus = "active" | "at_risk" | "inactive";

export interface StudentEngagementRow {
  readonly studentId: string;
  readonly studentName: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly lessonsCompleted: number;
  readonly totalLessons: number;
  readonly quizAvgScore: number | null;
  readonly assignmentsSubmitted: number;
  readonly totalAssignments: number;
  readonly forumPosts: number;
  readonly lastActiveAt: Date | null;
  readonly totalPoints: number;
  readonly engagementStatus: EngagementStatus;
}

export interface StudentEngagementResponse {
  readonly students: ReadonlyArray<StudentEngagementRow>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export type StudentSortField =
  | "studentName"
  | "lessonsCompleted"
  | "quizAvgScore"
  | "assignmentsSubmitted"
  | "forumPosts"
  | "lastActiveAt"
  | "totalPoints";

export type SortOrder = "asc" | "desc";

export interface EngagementQueryParams {
  readonly courseId?: string;
  readonly search?: string;
  readonly sortBy: StudentSortField;
  readonly sortOrder: SortOrder;
  readonly page: number;
  readonly limit: number;
}
