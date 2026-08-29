type BadgeTone = "lime" | "ink" | "outline" | "outline-dark" | "outline-lime";

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  PAUSED: "Paused",
  ENDED: "Ended",
  EVALUATION: "Evaluating",
  RESULT_READY: "Result Ready",
  ARCHIVED: "Archived",
  EVALUATION_PENDING: "Evaluation Pending",
  UNDER_REVIEW: "Under Review",
  READY_TO_PUBLISH: "Ready to Publish",
  PUBLISHED: "Published",
};

export const STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "outline",
  REVIEW: "outline",
  SCHEDULED: "outline-lime",
  LIVE: "lime",
  PAUSED: "outline",
  ENDED: "outline",
  EVALUATION: "outline-lime",
  RESULT_READY: "lime",
  ARCHIVED: "outline",
  EVALUATION_PENDING: "outline",
  UNDER_REVIEW: "outline-lime",
  READY_TO_PUBLISH: "lime",
  PUBLISHED: "ink",
};
