import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  // Table for user subscriptions, storing payment details, status, and credit balances
  subscriptions: defineTable({
    userId: v.id("users"), // Reference to the user
    polarCustomerId: v.string(), // Customer ID from Polar payment provider
    polarSubscriptionId: v.string(), // Subscription ID from Polar
    productId: v.optional(v.string()), // Product identifier
    priceId: v.optional(v.string()), // Price identifier
    planCode: v.optional(v.string()), // Subscription plan code
    status: v.string(), // Subscription status (e.g., active, canceled)
    currentPeriodEnd: v.optional(v.number()), // End timestamp of current billing period
    cancelAtPeriodEnd: v.boolean(), // Whether to cancel at period end
    trialEndsAt: v.optional(v.number()), // Trial end timestamp
    cancelAt: v.optional(v.number()), // Scheduled cancellation timestamp
    canceledAt: v.optional(v.number()), // Actual cancellation timestamp
    seats: v.optional(v.number()), // Number of seats in subscription
    metadata: v.optional(v.any()), // Additional metadata
    creditsBalance: v.number(), // Current credits balance
    creditsGrantPerPeriod: v.number(), // Credits granted per billing period
    creditsRolloverLimit: v.number(), // Maximum credits that can rollover
    lastGrantCursor: v.optional(v.number()), // Cursor for last credit grant
  }).index("by_userId", ["userId"])
    .index("by_polarSubscriptionId", ["polarSubscriptionId"])
    .index("by_status", ["status"]),
  // Table for tracking credit transactions and ledger entries
  credits_ledger: defineTable({
    userId: v.id("users"), // Reference to the user
    subscriptionId: v.id("subscriptions"), // Reference to the subscription
    amount: v.number(), // Amount of credits added or deducted
    type: v.string(), // Type of transaction (e.g., grant, usage)
    reason: v.optional(v.string()), // Reason for the transaction
    idempotencyKey: v.optional(v.string()), // Key to prevent duplicate transactions
    meta: v.optional(v.any()), // Additional metadata
  }).index("by_subscriptionId", ["subscriptionId"])
    .index("by_userId", ["userId"])
    .index("by_idempotencyKey", ["idempotencyKey"]),
  // Table for user projects, containing design data and metadata
  projects: defineTable({
    userId: v.id("users"), // Reference to the user who owns the project
    name: v.string(), // Project name
    description: v.optional(v.string()), // Project description
    styleGuide: v.optional(v.string()), // Style guide for the project
    sketchesData: v.any(), // Data for sketches
    viewPortData: v.optional(v.any()), // Viewport configuration data
    generatedDesignData: v.optional(v.any()), // Generated design data
    thumbnailUrl: v.optional(v.string()), // URL of project thumbnail
    moodBoardImages: v.optional(v.array(v.string())), // Array of mood board image URLs
    inspirationImages: v.optional(v.array(v.string())), // Array of inspiration image URLs
    lastModified: v.number(), // Timestamp of last modification
    createdAt: v.number(), // Timestamp of creation
    isPublic: v.optional(v.boolean()), // Whether the project is public
    tags: v.optional(v.array(v.string())), // Array of tags
    projectNumber: v.number(), // Sequential project number for the user
  }).index("by_userId", ["userId"]),
  // Table for tracking project numbering counters per user
  project_counters: defineTable({
    userId: v.id("users"), // Reference to the user
    nextProjectNumber: v.number(), // Next available project number
  }).index("by_userId", ["userId"]),
});
 
export default schema;