import { Filter } from "mongodb";
import { getDb } from "../config/mongodb";

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

export default class ProjectModel {
  static getCollection(){
    return getDb().collection<Project>("projects");
  }

  static async findAll(filter: Filter<Project> = {}) {
    const collection = this.getCollection();
    return collection.find(filter).toArray();
  }

  static async searchByProjectName(projectName: string) {
    const collection = this.getCollection();
    return collection.find({ name: { $regex: projectName, $options: "i" } }).toArray();
  }
  
  static async findWithPagination(
        search?: string | null,
        page: number = 1,
        limit: number = 1
    ) {
        const collection = this.getCollection();
        const skip = (page - 1) * limit;

        let query: Filter<Project> = {};
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            query = {
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { location: searchRegex }
                ],
            };
        }

        return collection.find(query).skip(skip).limit(limit).toArray();
    }

  static async findTrendingProjects(limit: number = 8) {
    const collection = this.getCollection();
    return collection.find({ 
      isFundingComplete: false,
      fundraisingEndDate: { $gt: new Date() }
    })
    .sort({ currentFunding: -1 })
    .limit(limit)
    .toArray();
  }

  static async findEndingSoon(days: number = 7, limit?: number) {
    const collection = this.getCollection();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const query = {
      isFundingComplete: false,
      fundraisingEndDate: { 
        $gt: new Date(),
        $lte: endDate
      }
    };
    return limit 
      ? collection.find(query).sort({ fundraisingEndDate: 1 }).limit(limit).toArray()
      : collection.find(query).sort({ fundraisingEndDate: 1 }).toArray();
  }
}