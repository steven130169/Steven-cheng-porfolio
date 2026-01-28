CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"ticket_type_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_quantity" CHECK (quantity > 0),
	CONSTRAINT "check_status" CHECK (status IN ('ACTIVE', 'CONSUMED', 'EXPIRED'))
);
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "check_status";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "check_total_capacity";--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "check_status" CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "check_total_capacity" CHECK (total_capacity > 0);