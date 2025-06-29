export interface User {
  _id: string
  email: string
  name: string
  username: string
  profile_picture: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id: string
  ownerId: string
  name: string
  description: string
  fundingGoal: number
  currentFunding: number
  fundraisingStartDate: Date
  fundraisingEndDate: Date
  projectStartDate: Date
  projectEndDate: Date
  location: string
  aiInsights?: {
    weakness: {
      title: string
      description: string
      excerpt: string
      badge: string
    },
    strength: {
      title: string
      description: string
      excerpt: string
      badge: string
    },
    opportunities: {
      title: string
      description: string
      excerpt: string
      badge: string
    },
    threat: {
      title: string
      description: string
      excerpt: string
      badge: string
    }
  }
  aiProposal?: string
  proposalDocumentUrl?: string
  impactMetrics: Array<{
    number: number
    description: string
  }>;
  isFundingComplete: boolean
  completedAt?: Date
  isLive?: boolean
  projectImage: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELED = "canceled",
}

export interface Donation {
  // _id: string
  // userId: string
  projectId: string
  amount: number
  midtransTransactionId: string
  midtransToken: string
  paymentStatus: PaymentStatus
  isExcess: boolean
  excessAmount: number
  donorName: string
  createdAt: Date
  updatedAt: Date
}

interface Forum {
  userId: string
  projectId: string
  message: string
  messageDate: Date
  createdAt: Date
  updatedAt: Date
}

interface Livestream {
  projectId: string
  userId: string
  startTime: string
  streamScheduleDate: Date
  livestreamImage: string
  description: string
  createdAt: Date
  updatedAt: Date
}