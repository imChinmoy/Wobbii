CREATE TYPE "public"."user_role" AS ENUM('CUSTOMER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"location" varchar(255),
	"status" "resource_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"capacity" integer NOT NULL,
	"allocated_count" integer DEFAULT 0 NOT NULL,
	"status" "slot_status" DEFAULT 'OPEN' NOT NULL,
	CONSTRAINT "slots_capacity_positive" CHECK ("slots"."capacity" > 0),
	CONSTRAINT "slots_allocated_valid" CHECK ("slots"."allocated_count" >= 0 AND "slots"."allocated_count" <= "slots"."capacity"),
	CONSTRAINT "slots_valid_time_range" CHECK ("slots"."end_at" > "slots"."start_at")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"status" "reservation_status" DEFAULT 'HELD' NOT NULL,
	"expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "slots_resource_id_idx" ON "slots" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "reservations_slot_id_idx" ON "reservations" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "reservations_user_id_idx" ON "reservations" USING btree ("user_id");