import { defineSchema,defineTable } from "convex/server"
import {v} from "convex/values"
export default defineSchema({
        users: defineTable({
            userId: v.string(), //user's clerk id
            email: v.string(),
            name: v.string(),
            isPro: v.boolean(),
            proSince: v.optional(v.number()),
            lemonsqueezy_cus_id : v.optional(v.string()), 
            lemonsqueezy_ord_id : v.optional(v.string()),
        }).index("by_user_id", ["userId"]),
        
        codeExecutions: defineTable({
            userId: v.string(),
            language: v.string(),
            code: v.string(),
            output: v.optional(v.string()),
            error: v.optional(v.string()),
        }).index("by_user_id", ["userId"]),
        
        snippets: defineTable({
            userId: v.string(),
            title: v.string(),
            language: v.string(),
            code: v.string(),
            UserName:v.string(),
        }).index("by_user_id", ["userId"]),

        snippetsComments: defineTable({
            snippetId: v.id("snippets"),
            userId: v.string(),
            content: v.string(), // this is for HTML content
            UserName:v.string(), 
        }).index("by_snippet_id", ["snippetId"]),

        stars: defineTable({
            snippetId: v.id("snippets"),
            userId: v.string(),
        }).index("by_snippet_id", ["snippetId"])
        .index("by_user_id_and_snippet_id", ["userId", "snippetId"])
        .index("by_user_id", ["userId"]),
});
