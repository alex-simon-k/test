export interface Project {
  id: string
  title: string
  description: string
  requirements: string
  duration: string
  type: 'remote' | 'hybrid' | 'onsite'
  skills: string[]
  technologies: string[]
  companyId: string
  companyName: string
  companyLogo?: string
  status: 'open' | 'closed' | 'in-progress' | 'archived'
  startDate?: Date
  createdAt: Date
  updatedAt: Date
  applicants: string[]
}

export interface ProjectMember {
  userId: string
  role: 'company_admin' | 'mentor' | 'intern' | 'team_lead'
  name: string
  email: string
  avatar?: string
  joinedAt: Date
  status: 'invited' | 'active' | 'inactive'
}

export interface Deployment {
  id: string
  projectId: string
  status: 'building' | 'deploying' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  url?: string
  error?: string
  commitHash?: string
  branch?: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  assignedTo: string[]
  createdBy: string
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
  comments: TaskComment[]
  attachments: TaskAttachment[]
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  attachments: TaskAttachment[]
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
}

export interface Notification {
  id: string
  projectId: string
  type: 'task_assigned' | 'task_completed' | 'comment_added' | 'project_update' | 'deadline_reminder'
  title: string
  message: string
  createdAt: Date
  readAt?: Date
  recipientId: string
  data?: any
}

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  userType: 'student' | 'company'
  profile: StudentProfile | CompanyProfile
}

export interface StudentProfile {
  university?: string
  major?: string
  graduationYear?: string
  skills: string[]
  bio?: string
  resume?: string
  linkedIn?: string
  github?: string
}

export interface CompanyProfile {
  companyName: string
  industry: string
  companySize: string
  website?: string
  logo?: string | File
  description: string
  location: string
} 