CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"amount" integer NOT NULL,
	"stripe_checkout_session_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"raw_event_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
