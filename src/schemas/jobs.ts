import * as z from 'zod'

const preprocessSalary = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().nonnegative().nullable().optional()
)

export const jobFormSchema = z.object({
  institutionId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  department: z.string().min(2, 'Department is required.'),
  subjectArea: z.string().min(2, 'Subject area is required.'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'adjunct', 'temporary']),
  workMode: z.enum(['on-site', 'hybrid', 'remote']),
  location: z.string().min(3, 'Location is required.'),
  salaryRangeMin: preprocessSalary,
  salaryRangeMax: preprocessSalary,
  salaryCurrency: z.string().min(1).default('USD'),
  vacancies: z.number().int().min(1).default(1),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters.'),
  requiredQualification: z.string().min(5, 'Required qualification is required.'),
  preferredQualification: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'closed', 'archived']).default('draft'),
})

export type JobFormInput = z.infer<typeof jobFormSchema>
