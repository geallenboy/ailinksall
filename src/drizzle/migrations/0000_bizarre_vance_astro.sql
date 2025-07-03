CREATE TABLE "action_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer,
	"user_role" varchar(100) NOT NULL,
	"title" varchar(300) NOT NULL,
	"steps" jsonb NOT NULL,
	"difficulty" varchar(50),
	"time_commitment" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"source_url" varchar(1000),
	"author" varchar(200),
	"published_at" timestamp,
	"core_insight" text,
	"impact_analysis" jsonb,
	"trend_tag" varchar(200),
	"is_processed" boolean DEFAULT false,
	"ai_score" integer,
	"category" varchar(100),
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "future_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"trend_tag" varchar(200) NOT NULL,
	"title" varchar(300) NOT NULL,
	"scenario" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"impact_level" integer,
	"timeframe" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(200) NOT NULL,
	"role" varchar(100) NOT NULL,
	"interests" jsonb,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"bio" text,
	"skill_level" text DEFAULT 'beginner',
	"preferences" jsonb,
	"total_learning_time" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;