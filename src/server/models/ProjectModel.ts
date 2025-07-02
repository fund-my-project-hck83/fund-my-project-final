import { Filter } from "mongodb";
import { getDb } from "../config/mongodb";

export interface Project {
  _id: string;
  ownerId: string;
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
  isLive?: boolean;
  projectImage: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export default class ProjectModel {
  static getCollection() {
    return getDb().collection<Project>("projects");
  }

  static async findAll(filter: Filter<Project> = {}) {
    const collection = this.getCollection();
    return collection.find(filter).toArray();
  }

  static async searchByProjectName(projectName: string) {
    const collection = this.getCollection();
    return collection
      .find({ name: { $regex: projectName, $options: "i" } })
      .toArray();
  }

  // Find active projects with pagination, search by project name, sorted by closest end date
  static async findWithPagination(
    search?: string | null,
    page: number = 1,
    limit: number = 1
  ) {
    const collection = this.getCollection();
    const skip = (page - 1) * limit;

    // Base query for active projects only
    let baseQuery: Filter<Project> = {
      isFundingComplete: false,
      // Handle both Date objects and string dates for active projects
      $or: [
        { fundraisingEndDate: { $gt: new Date() } },
        {
          $and: [
            { fundraisingEndDate: { $type: "string" } },
            { fundraisingEndDate: { $exists: true } },
          ],
        },
      ],
    };

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      baseQuery = {
        ...baseQuery,
        name: searchRegex, // Search only by project name (case-insensitive)
      };
    }

    // Use aggregation pipeline for sorting by closest end date
    const pipeline: object[] = [
      {
        $match: baseQuery,
      },
      {
        $addFields: {
          // Convert string dates to Date objects for sorting
          sortDate: {
            $cond: {
              if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
              then: "$fundraisingEndDate",
              else: {
                // For string dates, use a far future date to sort them at the end
                $dateFromString: {
                  dateString: "2099-12-31",
                  onError: new Date("2099-12-31"),
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          sortDate: 1, // Sort by closest end date first (ascending)
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          sortDate: 0, // Remove the helper field
        },
      },
    ];

    return collection.aggregate(pipeline).toArray();
  }

  static async findTrendingProjects(limit: number = 15) {
    const collection = this.getCollection();

    // Use aggregation pipeline for more sophisticated trending logic
    const pipeline = [
      {
        $match: {
          isFundingComplete: false,
          fundraisingEndDate: { $gt: new Date() },
        },
      },
      {
        $addFields: {
          // Calculate funding percentage
          fundingPercentage: {
            $cond: {
              if: { $gt: ["$fundingGoal", 0] },
              then: { $divide: ["$currentFunding", "$fundingGoal"] },
              else: 0,
            },
          },
          // Calculate days since start
          daysSinceStart: {
            $divide: [
              { $subtract: [new Date(), "$fundraisingStartDate"] },
              1000 * 60 * 60 * 24,
            ],
          },
          // Calculate daily funding rate
          dailyFundingRate: {
            $cond: {
              if: {
                $gt: [
                  {
                    $divide: [
                      { $subtract: [new Date(), "$fundraisingStartDate"] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                  0,
                ],
              },
              then: {
                $divide: [
                  "$currentFunding",
                  {
                    $divide: [
                      { $subtract: [new Date(), "$fundraisingStartDate"] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $addFields: {
          // Calculate trending score based on multiple factors
          trendingScore: {
            $add: [
              // Weight: 40% - Current funding amount (normalized by dividing by 1000000)
              { $multiply: [{ $divide: ["$currentFunding", 1000000] }, 0.4] },
              // Weight: 35% - Funding percentage (closer to goal gets higher score)
              { $multiply: ["$fundingPercentage", 0.35] },
              // Weight: 25% - Daily funding rate (momentum factor, normalized)
              { $multiply: [{ $divide: ["$dailyFundingRate", 100000] }, 0.25] },
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          // Remove the calculated fields from final output
          daysSinceStart: 0,
          dailyFundingRate: 0,
          fundingPercentage: 0,
          trendingScore: 0,
        },
      },
    ];

    return collection.aggregate(pipeline).toArray();
  }

  // Method untuk urgent projects yang akan berakhir dalam 30 hari
  static async findUrgentProjects(
    limit?: number,
    includeCompleted: boolean = false
  ) {
    const collection = this.getCollection();
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Maksimal 30 hari ke depan

    // Base query - conditional filtering based on includeCompleted + 30 days filter
    let baseQuery: Filter<Project> = {};

    if (!includeCompleted) {
      // Only active projects that will end within 30 days
      baseQuery = {
        isFundingComplete: false,
        $or: [
          {
            // For Date objects within 30 days
            $and: [
              { fundraisingEndDate: { $type: "date" } },
              { fundraisingEndDate: { $gte: now } },
              { fundraisingEndDate: { $lte: maxDate } },
            ],
          },
          {
            // For string dates (include for manual verification)
            $and: [
              { fundraisingEndDate: { $type: "string" } },
              { fundraisingEndDate: { $exists: true } },
            ],
          },
        ],
      };
    } else {
      // ALL projects that will end within 30 days (no status filter)
      baseQuery = {
        $or: [
          {
            // For Date objects within 30 days
            $and: [
              { fundraisingEndDate: { $type: "date" } },
              { fundraisingEndDate: { $lte: maxDate } },
            ],
          },
          {
            // For string dates (include for manual verification)
            $and: [
              { fundraisingEndDate: { $type: "string" } },
              { fundraisingEndDate: { $exists: true } },
            ],
          },
        ],
      };
    }

    const pipeline: object[] = [
      {
        $match: baseQuery,
      },
      {
        $addFields: {
          // Convert string dates to Date objects for sorting
          sortDate: {
            $cond: {
              if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
              then: "$fundraisingEndDate",
              else: {
                $dateFromString: {
                  dateString: "$fundraisingEndDate",
                  onError: new Date("2099-12-31"), // Default for invalid dates
                },
              },
            },
          },
          // Calculate days until fundraising ends (for urgency calculation)
          daysUntilEnd: {
            $divide: [
              {
                $subtract: [
                  {
                    $cond: {
                      if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
                      then: "$fundraisingEndDate",
                      else: {
                        $dateFromString: {
                          dateString: "$fundraisingEndDate",
                          onError: new Date("2099-12-31"),
                        },
                      },
                    },
                  },
                  now,
                ],
              },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        // Additional filter untuk memastikan hanya proyek dalam 30 hari (untuk string dates yang sudah dikonversi)
        $match: {
          $or: [
            {
              // Date objects sudah difilter di base query
              fundraisingEndDate: { $type: "date" },
            },
            {
              // String dates yang dikonversi - filter maksimal 30 hari
              $and: [
                { sortDate: { $lte: new Date(maxDate) } },
                { sortDate: { $ne: new Date("2099-12-31") } }, // Exclude invalid dates
              ],
            },
          ],
        },
      },
      {
        $sort: {
          sortDate: 1, // Sort by fundraising end date (most urgent first)
        },
      },
      {
        $project: {
          sortDate: 0, // Remove the helper field
        },
      },
    ];

    if (limit) {
      pipeline.push({ $limit: limit });
    }

    return collection.aggregate(pipeline).toArray();
  }

  // Legacy method untuk backward compatibility
  static async findEndingSoon(
    days: number = 7,
    limit?: number,
    includeCompleted: boolean = false
  ) {
    const collection = this.getCollection();
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Base query - conditional filtering based on includeCompleted
    let baseQuery: Filter<Project> = {};

    if (!includeCompleted) {
      // Original behavior: only active projects
      baseQuery = {
        isFundingComplete: false,
        // Handle both Date objects and string dates
        $or: [
          {
            // For Date objects
            $and: [
              { fundraisingEndDate: { $type: "date" } },
              { fundraisingEndDate: { $gt: now } },
              { fundraisingEndDate: { $lte: endDate } },
            ],
          },
          {
            // For string dates (accept all string dates for ending soon)
            $and: [
              { fundraisingEndDate: { $type: "string" } },
              { fundraisingEndDate: { $exists: true } },
            ],
          },
        ],
      };
    } else {
      // New behavior: ALL projects (active + completed) within date range
      baseQuery = {
        // Handle both Date objects and string dates for ALL projects
        $or: [
          {
            // For Date objects within date range
            $and: [
              { fundraisingEndDate: { $type: "date" } },
              { fundraisingEndDate: { $lte: endDate } },
            ],
          },
          {
            // For string dates (accept all string dates)
            $and: [
              { fundraisingEndDate: { $type: "string" } },
              { fundraisingEndDate: { $exists: true } },
            ],
          },
        ],
      };
    }

    const pipeline: object[] = [
      {
        $match: baseQuery,
      },
      {
        $addFields: {
          // Convert string dates to Date objects for sorting
          sortDate: {
            $cond: {
              if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
              then: "$fundraisingEndDate",
              else: {
                // For string dates, use a far future date to sort them at the end
                $dateFromString: {
                  dateString: "2099-12-31",
                  onError: new Date("2099-12-31"),
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          sortDate: 1, // Sort by closest end date first
        },
      },
      {
        $project: {
          sortDate: 0, // Remove the helper field
        },
      },
    ];

    if (limit) {
      pipeline.push({ $limit: limit });
    }

    return collection.aggregate(pipeline).toArray();
  }

  // Trending method prioritizing funding amount collected
  static async findTrendingByFundingPercentage(limit: number = 8) {
    const collection = this.getCollection();

    const pipeline = [
      {
        $match: {
          isFundingComplete: false,
          // Handle both Date objects and string dates
          $or: [
            { fundraisingEndDate: { $gt: new Date() } },
            {
              $and: [
                { fundraisingEndDate: { $type: "string" } },
                { fundraisingEndDate: { $exists: true } },
              ],
            },
          ],
          fundingGoal: { $gt: 0 }, // Ensure valid funding goal
          currentFunding: { $gt: 0 }, // Must have some funding
        },
      },
      {
        $addFields: {
          fundingPercentage: {
            $multiply: [{ $divide: ["$currentFunding", "$fundingGoal"] }, 100],
          },
        },
      },
      {
        $sort: {
          fundingPercentage: -1, // Sort by highest percentage first
          currentFunding: -1, // Secondary sort by amount for ties
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          // Remove calculated fields from output
          fundingPercentage: 0,
        },
      },
    ];

    return collection.aggregate(pipeline).toArray();
  }

  // Alternative method - purely by current funding amount
  static async findTrendingByAmount(limit: number = 8) {
    const collection = this.getCollection();
    return collection
      .find({
        isFundingComplete: false,
        fundraisingEndDate: { $gt: new Date() },
      })
      .sort({ currentFunding: -1 })
      .limit(limit)
      .toArray();
  }

  // Method baru untuk semua proyek (aktif + selesai) dengan sorting
  static async findAllWithSorting(
    search?: string | null,
    page: number = 1,
    limit: number = 10,
    sortBy: "endDate" | "funding" | "created" | "name" = "endDate"
  ) {
    const collection = this.getCollection();
    const skip = (page - 1) * limit;

    // Base query - TIDAK ada filter status (semua proyek)
    const baseQuery: Filter<Project> = {};

    // Add search filter if provided (search by project name)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      baseQuery.name = searchRegex;
    }

    // Use aggregation pipeline for advanced sorting
    const pipeline: object[] = [
      {
        $match: baseQuery,
      },
    ];

    // Add sorting based on sortBy parameter
    let sortStage: Record<string, 1 | -1> = {};

    switch (sortBy) {
      case "endDate":
        // Sort by fundraising end date (closest first)
        pipeline.push({
          $addFields: {
            sortDate: {
              $cond: {
                if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
                then: "$fundraisingEndDate",
                else: {
                  $dateFromString: {
                    dateString: "2099-12-31",
                    onError: new Date("2099-12-31"),
                  },
                },
              },
            },
          },
        });
        sortStage = { sortDate: 1 }; // Ascending (closest first)
        break;

      case "funding":
        // Sort by current funding amount (highest first)
        sortStage = { currentFunding: -1 };
        break;

      case "created":
        // Sort by creation date (newest first)
        sortStage = { createdAt: -1 };
        break;

      case "name":
        // Sort by project name (alphabetical)
        sortStage = { name: 1 };
        break;

      default:
        // Default to end date sorting
        pipeline.push({
          $addFields: {
            sortDate: {
              $cond: {
                if: { $eq: [{ $type: "$fundraisingEndDate" }, "date"] },
                then: "$fundraisingEndDate",
                else: {
                  $dateFromString: {
                    dateString: "2099-12-31",
                    onError: new Date("2099-12-31"),
                  },
                },
              },
            },
          },
        });
        sortStage = { sortDate: 1 };
        break;
    }

    // Add sort stage
    pipeline.push({ $sort: sortStage });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Remove helper fields from output if they exist
    if (sortBy === "endDate") {
      pipeline.push({
        $project: {
          sortDate: 0,
        },
      });
    }

    return collection.aggregate(pipeline).toArray();
  }
}
