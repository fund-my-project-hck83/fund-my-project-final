import { ObjectId } from "mongodb";

export interface IDonateForm {
  amount: number;
  donorName: string;
  projectId: string;
}

export interface IConfirmDonationForm {
  orderId: string;
  transactionId: string;
  paymentType: string;
}

export interface IProject {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  fundraisingStartDate: Date;
  fundraisingEndDate: Date;
  projectStartDate: Date;
  projectEndDate: Date;
  location: string;
  aiInsights?: {
    weakness: {
      title: string;
      description: string;
      excerpt: string;
      badge: string;
    };
    strength: {
      title: string;
      description: string;
      excerpt: string;
      badge: string;
    };
    opportunities: {
      title: string;
      description: string;
      excerpt: string;
      badge: string;
    };
    threat: {
      title: string;
      description: string;
      excerpt: string;
      badge: string;
    };
  };
  aiProposal?: string;
  proposalDocumentUrl?: string;
  impactMetrics: Array<{
    number: number;
    description: string;
  }>;
  isFundingComplete: boolean;
  completedAt?: Date;
  isLive: boolean;
  projectImage: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export interface IDonation {
  projectId: ObjectId;
  amount: number;
  midtransTransactionId: string;
  midtransToken: string;
  paymentStatus: PaymentStatus;
  isExcess: boolean;
  excessAmount: number;
  donorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMidtransPaymentResult {
  order_id: string;
  transaction_id: string;
  payment_type: string;
}

export interface IUser {
  _id: ObjectId;
  username: string;
  profilePicture?: string;
  name: string;
  email: string;
  password?: string; // Optional for Google OAuth users
  provider?: "credentials" | "google";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectOwner {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IDonationResponse {
  amount: number;
  donorName: string;
  createdAt: Date;
  isExcess: boolean;
}

export interface IProjectResponse extends Omit<IProject, "ownerId"> {
  owner: IProjectOwner | null;
  donations: IDonationResponse[];
}

// Chat interfaces
export interface IChat {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  message: string;
  timestamp: Date;
  userName: string;
  userAvatar?: string;
}

export interface IChatResponse {
  _id: string;
  projectId: string;
  userId: string;
  message: string;
  timestamp: Date;
  userName: string;
  userAvatar?: string;
}

export interface ILivestream {
  _id: ObjectId;
  projectId: ObjectId;
  title: string;
  description?: string;
  scheduledAt: Date;
  isLive: boolean;
  viewerCount: number;
  channelName: string;
  endedAt?: Date; // Added field to track when the stream ended
  createdAt: Date;
  updatedAt: Date;
}

export interface ILivestreamViewer {
  _id: ObjectId;
  livestreamId: ObjectId;
  userId?: string;
  userName: string;
  userAvatar?: string;
  joinedAt: Date;
  leftAt?: Date;
}
