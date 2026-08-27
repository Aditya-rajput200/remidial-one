import { z } from "zod";

const subjectList = z.array(z.string().trim().min(1).max(100)).max(20);

export const updateStudentProfileSchema = z.object({
  grade: z.string().trim().max(50).optional(),
  curriculum: z.string().trim().max(100).optional(),
  subjectsOfInterest: subjectList.optional(),
  learningGoals: z.string().trim().max(2000).optional(),
  preferredTime: z.string().trim().max(200).optional(),
});

export const updateMentorProfileSchema = z.object({
  bio: z.string().trim().max(2000).optional(),
  qualifications: z.string().trim().max(1000).optional(),
  teachingStyle: z.string().trim().max(1000).optional(),
  subjectSlugs: subjectList.optional(),
  gradeSlugs: subjectList.optional(),
  languages: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  yearsExperience: z.number().int().min(0).max(80).optional(),
});
