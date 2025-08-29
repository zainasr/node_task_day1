ALTER TABLE "orders" ADD COLUMN "actual_amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "amount_in_cents" integer;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "amount";