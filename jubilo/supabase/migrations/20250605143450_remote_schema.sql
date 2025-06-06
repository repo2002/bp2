create table "public"."carpool_passengers" (
    "id" uuid not null default gen_random_uuid(),
    "carpool_id" uuid not null,
    "user_id" uuid not null,
    "status" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."carpool_passengers" enable row level security;

create table "public"."carpool_requests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "pickup_location" text,
    "pickup_time" timestamp with time zone,
    "destination_location" text,
    "destination_time" timestamp with time zone,
    "is_private" boolean default false,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."carpool_requests" enable row level security;

create table "public"."carpools" (
    "id" uuid not null default gen_random_uuid(),
    "driver_id" uuid not null,
    "car_id" uuid not null,
    "departure_location" text,
    "departure_time" timestamp with time zone,
    "destination_location" text,
    "destination_time" timestamp with time zone,
    "max_seats" integer not null,
    "price" numeric,
    "cost" numeric,
    "description" text,
    "is_private" boolean default false,
    "is_recurring" boolean default false,
    "recurrence_rule" text,
    "status" text not null default 'scheduled'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."carpools" enable row level security;

create table "public"."cars" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "brand" text,
    "model" text,
    "color" text,
    "license_plate" text,
    "seats" integer,
    "created_at" timestamp with time zone default now()
);


alter table "public"."cars" enable row level security;

create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid not null,
    "sender_id" uuid not null,
    "type" text not null,
    "content" text,
    "metadata" jsonb,
    "reply_to" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."chat_messages" enable row level security;

create table "public"."chat_participants" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null default 'member'::text,
    "joined_at" timestamp with time zone default now(),
    "last_read_at" timestamp with time zone default now()
);


alter table "public"."chat_participants" enable row level security;

create table "public"."chat_rooms" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "is_group" boolean default false,
    "max_participants" integer default 25,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."chat_rooms" enable row level security;

create table "public"."checklist_checks" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "user_id" uuid not null,
    "checked" boolean default false,
    "checked_at" timestamp with time zone
);


alter table "public"."checklist_checks" enable row level security;

create table "public"."checklist_items" (
    "id" uuid not null default gen_random_uuid(),
    "checklist_id" uuid not null,
    "content" text not null,
    "position" integer,
    "created_at" timestamp with time zone default now()
);


alter table "public"."checklist_items" enable row level security;

create table "public"."checklists" (
    "id" uuid not null default gen_random_uuid(),
    "message_id" uuid not null,
    "title" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."checklists" enable row level security;

create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."comments" enable row level security;

create table "public"."event_answers" (
    "id" uuid not null default gen_random_uuid(),
    "question_id" uuid not null,
    "user_id" uuid not null,
    "answer" text not null,
    "created_at" timestamp with time zone default now(),
    "upvotes" integer default 0
);


alter table "public"."event_answers" enable row level security;

create table "public"."event_followers" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."event_followers" enable row level security;

create table "public"."event_images" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "image_url" text not null,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now(),
    "user_id" uuid
);


alter table "public"."event_images" enable row level security;

create table "public"."event_invites" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "message" text
);


alter table "public"."event_invites" enable row level security;

create table "public"."event_participants" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "status" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."event_participants" enable row level security;

create table "public"."event_posts" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "content" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."event_posts" enable row level security;

create table "public"."event_questions" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "question" text not null,
    "created_at" timestamp with time zone default now(),
    "upvotes" integer default 0
);


alter table "public"."event_questions" enable row level security;

create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "creator_id" uuid not null,
    "title" text not null,
    "description" text,
    "location" jsonb,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "max_participants" integer,
    "dresscode" text,
    "is_private" boolean default true,
    "allow_guests_to_post" boolean default true,
    "status" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "category" text not null default 'other'::text,
    "timezone" text
);


alter table "public"."events" enable row level security;

create table "public"."followers" (
    "id" uuid not null default gen_random_uuid(),
    "follower_id" uuid not null,
    "following_id" uuid not null,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."followers" enable row level security;

create table "public"."marketplace_favorites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "item_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."marketplace_favorites" enable row level security;

create table "public"."marketplace_images" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "image_url" text not null,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."marketplace_images" enable row level security;

create table "public"."marketplace_items" (
    "id" uuid not null default gen_random_uuid(),
    "seller_id" uuid not null,
    "event_id" uuid,
    "title" text not null,
    "description" text,
    "price" numeric not null,
    "category" text,
    "condition" text,
    "status" text not null default 'available'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."marketplace_items" enable row level security;

create table "public"."message_status" (
    "id" uuid not null default gen_random_uuid(),
    "message_id" uuid not null,
    "user_id" uuid not null,
    "is_read" boolean default false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."message_status" enable row level security;

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "sender_id" uuid,
    "category" text not null,
    "reference_type" text,
    "reference_id" uuid,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."notifications" enable row level security;

create table "public"."poll_options" (
    "id" uuid not null default gen_random_uuid(),
    "poll_id" uuid not null,
    "text" text not null,
    "position" integer,
    "created_at" timestamp with time zone default now()
);


alter table "public"."poll_options" enable row level security;

create table "public"."poll_votes" (
    "id" uuid not null default gen_random_uuid(),
    "option_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."poll_votes" enable row level security;

create table "public"."polls" (
    "id" uuid not null default gen_random_uuid(),
    "message_id" uuid not null,
    "question" text not null,
    "allow_multiple" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."polls" enable row level security;

create table "public"."post_likes" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."post_likes" enable row level security;

create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "content" text,
    "location" jsonb,
    "is_private" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "images" jsonb
);


alter table "public"."posts" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "first_name" text,
    "last_name" text,
    "email" text,
    "phone_number" text,
    "bio" text,
    "image_url" text,
    "is_private" boolean default false,
    "is_verified" boolean default false,
    "date_of_birth" date,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."profiles" enable row level security;

create table "public"."typing_status" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid not null,
    "user_id" uuid not null,
    "is_typing" boolean not null default false,
    "last_typed_at" timestamp with time zone not null default now()
);


alter table "public"."typing_status" enable row level security;

CREATE UNIQUE INDEX carpool_passengers_carpool_id_user_id_key ON public.carpool_passengers USING btree (carpool_id, user_id);

CREATE UNIQUE INDEX carpool_passengers_pkey ON public.carpool_passengers USING btree (id);

CREATE UNIQUE INDEX carpool_requests_pkey ON public.carpool_requests USING btree (id);

CREATE UNIQUE INDEX carpools_pkey ON public.carpools USING btree (id);

CREATE UNIQUE INDEX cars_pkey ON public.cars USING btree (id);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_participants_pkey ON public.chat_participants USING btree (id);

CREATE UNIQUE INDEX chat_participants_room_id_user_id_key ON public.chat_participants USING btree (room_id, user_id);

CREATE UNIQUE INDEX chat_rooms_pkey ON public.chat_rooms USING btree (id);

CREATE UNIQUE INDEX checklist_checks_item_id_user_id_key ON public.checklist_checks USING btree (item_id, user_id);

CREATE UNIQUE INDEX checklist_checks_pkey ON public.checklist_checks USING btree (id);

CREATE UNIQUE INDEX checklist_items_pkey ON public.checklist_items USING btree (id);

CREATE UNIQUE INDEX checklists_pkey ON public.checklists USING btree (id);

CREATE INDEX comments_created_at_idx ON public.comments USING btree (created_at DESC);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE INDEX comments_post_id_idx ON public.comments USING btree (post_id);

CREATE INDEX comments_user_id_idx ON public.comments USING btree (user_id);

CREATE UNIQUE INDEX event_answers_pkey ON public.event_answers USING btree (id);

CREATE INDEX event_followers_event_id_idx ON public.event_followers USING btree (event_id);

CREATE UNIQUE INDEX event_followers_event_id_user_id_key ON public.event_followers USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_followers_pkey ON public.event_followers USING btree (id);

CREATE INDEX event_followers_user_id_idx ON public.event_followers USING btree (user_id);

CREATE UNIQUE INDEX event_images_pkey ON public.event_images USING btree (id);

CREATE UNIQUE INDEX event_invites_event_id_user_id_key ON public.event_invites USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_invites_pkey ON public.event_invites USING btree (id);

CREATE INDEX event_participants_event_id_idx ON public.event_participants USING btree (event_id);

CREATE UNIQUE INDEX event_participants_event_id_user_id_key ON public.event_participants USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_participants_pkey ON public.event_participants USING btree (id);

CREATE INDEX event_participants_status_idx ON public.event_participants USING btree (status);

CREATE INDEX event_participants_user_id_idx ON public.event_participants USING btree (user_id);

CREATE UNIQUE INDEX event_posts_pkey ON public.event_posts USING btree (id);

CREATE UNIQUE INDEX event_questions_pkey ON public.event_questions USING btree (id);

CREATE INDEX events_creator_id_idx ON public.events USING btree (creator_id);

CREATE INDEX events_is_private_idx ON public.events USING btree (is_private);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE INDEX events_start_time_idx ON public.events USING btree (start_time);

CREATE INDEX events_status_idx ON public.events USING btree (status);

CREATE UNIQUE INDEX followers_follower_id_following_id_key ON public.followers USING btree (follower_id, following_id);

CREATE INDEX followers_follower_id_idx ON public.followers USING btree (follower_id);

CREATE INDEX followers_following_id_idx ON public.followers USING btree (following_id);

CREATE UNIQUE INDEX followers_pkey ON public.followers USING btree (id);

CREATE INDEX followers_status_idx ON public.followers USING btree (status);

CREATE UNIQUE INDEX marketplace_favorites_pkey ON public.marketplace_favorites USING btree (id);

CREATE UNIQUE INDEX marketplace_favorites_user_id_item_id_key ON public.marketplace_favorites USING btree (user_id, item_id);

CREATE UNIQUE INDEX marketplace_images_pkey ON public.marketplace_images USING btree (id);

CREATE INDEX marketplace_items_category_idx ON public.marketplace_items USING btree (category);

CREATE INDEX marketplace_items_event_id_idx ON public.marketplace_items USING btree (event_id);

CREATE UNIQUE INDEX marketplace_items_pkey ON public.marketplace_items USING btree (id);

CREATE INDEX marketplace_items_seller_id_idx ON public.marketplace_items USING btree (seller_id);

CREATE INDEX marketplace_items_status_idx ON public.marketplace_items USING btree (status);

CREATE UNIQUE INDEX message_status_message_id_user_id_key ON public.message_status USING btree (message_id, user_id);

CREATE UNIQUE INDEX message_status_pkey ON public.message_status USING btree (id);

CREATE INDEX notifications_category_idx ON public.notifications USING btree (category);

CREATE INDEX notifications_is_read_idx ON public.notifications USING btree (is_read);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);

CREATE UNIQUE INDEX poll_options_pkey ON public.poll_options USING btree (id);

CREATE UNIQUE INDEX poll_votes_option_id_user_id_key ON public.poll_votes USING btree (option_id, user_id);

CREATE UNIQUE INDEX poll_votes_pkey ON public.poll_votes USING btree (id);

CREATE UNIQUE INDEX polls_pkey ON public.polls USING btree (id);

CREATE UNIQUE INDEX post_likes_pkey ON public.post_likes USING btree (id);

CREATE INDEX post_likes_post_id_idx ON public.post_likes USING btree (post_id);

CREATE UNIQUE INDEX post_likes_post_id_user_id_key ON public.post_likes USING btree (post_id, user_id);

CREATE INDEX post_likes_user_id_idx ON public.post_likes USING btree (user_id);

CREATE INDEX posts_created_at_idx ON public.posts USING btree (created_at DESC);

CREATE INDEX posts_is_private_idx ON public.posts USING btree (is_private);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE INDEX posts_user_id_idx ON public.posts USING btree (user_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX typing_status_pkey ON public.typing_status USING btree (id);

CREATE UNIQUE INDEX typing_status_room_id_user_id_key ON public.typing_status USING btree (room_id, user_id);

alter table "public"."carpool_passengers" add constraint "carpool_passengers_pkey" PRIMARY KEY using index "carpool_passengers_pkey";

alter table "public"."carpool_requests" add constraint "carpool_requests_pkey" PRIMARY KEY using index "carpool_requests_pkey";

alter table "public"."carpools" add constraint "carpools_pkey" PRIMARY KEY using index "carpools_pkey";

alter table "public"."cars" add constraint "cars_pkey" PRIMARY KEY using index "cars_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_participants" add constraint "chat_participants_pkey" PRIMARY KEY using index "chat_participants_pkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_pkey" PRIMARY KEY using index "chat_rooms_pkey";

alter table "public"."checklist_checks" add constraint "checklist_checks_pkey" PRIMARY KEY using index "checklist_checks_pkey";

alter table "public"."checklist_items" add constraint "checklist_items_pkey" PRIMARY KEY using index "checklist_items_pkey";

alter table "public"."checklists" add constraint "checklists_pkey" PRIMARY KEY using index "checklists_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."event_answers" add constraint "event_answers_pkey" PRIMARY KEY using index "event_answers_pkey";

alter table "public"."event_followers" add constraint "event_followers_pkey" PRIMARY KEY using index "event_followers_pkey";

alter table "public"."event_images" add constraint "event_images_pkey" PRIMARY KEY using index "event_images_pkey";

alter table "public"."event_invites" add constraint "event_invites_pkey" PRIMARY KEY using index "event_invites_pkey";

alter table "public"."event_participants" add constraint "event_participants_pkey" PRIMARY KEY using index "event_participants_pkey";

alter table "public"."event_posts" add constraint "event_posts_pkey" PRIMARY KEY using index "event_posts_pkey";

alter table "public"."event_questions" add constraint "event_questions_pkey" PRIMARY KEY using index "event_questions_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."followers" add constraint "followers_pkey" PRIMARY KEY using index "followers_pkey";

alter table "public"."marketplace_favorites" add constraint "marketplace_favorites_pkey" PRIMARY KEY using index "marketplace_favorites_pkey";

alter table "public"."marketplace_images" add constraint "marketplace_images_pkey" PRIMARY KEY using index "marketplace_images_pkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_pkey" PRIMARY KEY using index "marketplace_items_pkey";

alter table "public"."message_status" add constraint "message_status_pkey" PRIMARY KEY using index "message_status_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."poll_options" add constraint "poll_options_pkey" PRIMARY KEY using index "poll_options_pkey";

alter table "public"."poll_votes" add constraint "poll_votes_pkey" PRIMARY KEY using index "poll_votes_pkey";

alter table "public"."polls" add constraint "polls_pkey" PRIMARY KEY using index "polls_pkey";

alter table "public"."post_likes" add constraint "post_likes_pkey" PRIMARY KEY using index "post_likes_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."typing_status" add constraint "typing_status_pkey" PRIMARY KEY using index "typing_status_pkey";

alter table "public"."carpool_passengers" add constraint "carpool_passengers_carpool_id_fkey" FOREIGN KEY (carpool_id) REFERENCES carpools(id) ON DELETE CASCADE not valid;

alter table "public"."carpool_passengers" validate constraint "carpool_passengers_carpool_id_fkey";

alter table "public"."carpool_passengers" add constraint "carpool_passengers_carpool_id_user_id_key" UNIQUE using index "carpool_passengers_carpool_id_user_id_key";

alter table "public"."carpool_passengers" add constraint "carpool_passengers_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text]))) not valid;

alter table "public"."carpool_passengers" validate constraint "carpool_passengers_status_check";

alter table "public"."carpool_passengers" add constraint "carpool_passengers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."carpool_passengers" validate constraint "carpool_passengers_user_id_fkey";

alter table "public"."carpool_requests" add constraint "carpool_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."carpool_requests" validate constraint "carpool_requests_user_id_fkey";

alter table "public"."carpools" add constraint "carpools_car_id_fkey" FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE RESTRICT not valid;

alter table "public"."carpools" validate constraint "carpools_car_id_fkey";

alter table "public"."carpools" add constraint "carpools_driver_id_fkey" FOREIGN KEY (driver_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."carpools" validate constraint "carpools_driver_id_fkey";

alter table "public"."carpools" add constraint "carpools_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."carpools" validate constraint "carpools_status_check";

alter table "public"."cars" add constraint "cars_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."cars" validate constraint "cars_user_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_reply_to_fkey" FOREIGN KEY (reply_to) REFERENCES chat_messages(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_reply_to_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_room_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_sender_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_type_check" CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'voice'::text, 'location'::text, 'checklist'::text, 'poll'::text, 'post'::text, 'marketplace'::text, 'carpool'::text]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_type_check";

alter table "public"."chat_participants" add constraint "chat_participants_role_check" CHECK ((role = ANY (ARRAY['member'::text, 'admin'::text]))) not valid;

alter table "public"."chat_participants" validate constraint "chat_participants_role_check";

alter table "public"."chat_participants" add constraint "chat_participants_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_participants" validate constraint "chat_participants_room_id_fkey";

alter table "public"."chat_participants" add constraint "chat_participants_room_id_user_id_key" UNIQUE using index "chat_participants_room_id_user_id_key";

alter table "public"."chat_participants" add constraint "chat_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_participants" validate constraint "chat_participants_user_id_fkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."chat_rooms" validate constraint "chat_rooms_created_by_fkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_max_participants_check" CHECK ((max_participants >= 2)) not valid;

alter table "public"."chat_rooms" validate constraint "chat_rooms_max_participants_check";

alter table "public"."checklist_checks" add constraint "checklist_checks_item_id_fkey" FOREIGN KEY (item_id) REFERENCES checklist_items(id) ON DELETE CASCADE not valid;

alter table "public"."checklist_checks" validate constraint "checklist_checks_item_id_fkey";

alter table "public"."checklist_checks" add constraint "checklist_checks_item_id_user_id_key" UNIQUE using index "checklist_checks_item_id_user_id_key";

alter table "public"."checklist_checks" add constraint "checklist_checks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."checklist_checks" validate constraint "checklist_checks_user_id_fkey";

alter table "public"."checklist_items" add constraint "checklist_items_checklist_id_fkey" FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE not valid;

alter table "public"."checklist_items" validate constraint "checklist_items_checklist_id_fkey";

alter table "public"."checklists" add constraint "checklists_message_id_fkey" FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE not valid;

alter table "public"."checklists" validate constraint "checklists_message_id_fkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."event_answers" add constraint "event_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES event_questions(id) ON DELETE CASCADE not valid;

alter table "public"."event_answers" validate constraint "event_answers_question_id_fkey";

alter table "public"."event_answers" add constraint "event_answers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_answers" validate constraint "event_answers_user_id_fkey";

alter table "public"."event_followers" add constraint "event_followers_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_followers" validate constraint "event_followers_event_id_fkey";

alter table "public"."event_followers" add constraint "event_followers_event_id_user_id_key" UNIQUE using index "event_followers_event_id_user_id_key";

alter table "public"."event_followers" add constraint "event_followers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_followers" validate constraint "event_followers_user_id_fkey";

alter table "public"."event_images" add constraint "event_images_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_images" validate constraint "event_images_event_id_fkey";

alter table "public"."event_images" add constraint "event_images_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."event_images" validate constraint "event_images_user_id_fkey";

alter table "public"."event_invites" add constraint "event_invites_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_invites" validate constraint "event_invites_event_id_fkey";

alter table "public"."event_invites" add constraint "event_invites_event_id_user_id_key" UNIQUE using index "event_invites_event_id_user_id_key";

alter table "public"."event_invites" add constraint "event_invites_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."event_invites" validate constraint "event_invites_status_check";

alter table "public"."event_invites" add constraint "event_invites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_invites" validate constraint "event_invites_user_id_fkey";

alter table "public"."event_participants" add constraint "event_participants_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_participants" validate constraint "event_participants_event_id_fkey";

alter table "public"."event_participants" add constraint "event_participants_event_id_user_id_key" UNIQUE using index "event_participants_event_id_user_id_key";

alter table "public"."event_participants" add constraint "event_participants_status_check" CHECK ((status = ANY (ARRAY['going'::text, 'maybe'::text, 'not_going'::text]))) not valid;

alter table "public"."event_participants" validate constraint "event_participants_status_check";

alter table "public"."event_participants" add constraint "event_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_participants" validate constraint "event_participants_user_id_fkey";

alter table "public"."event_posts" add constraint "event_posts_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_posts" validate constraint "event_posts_event_id_fkey";

alter table "public"."event_posts" add constraint "event_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_posts" validate constraint "event_posts_user_id_fkey";

alter table "public"."event_questions" add constraint "event_questions_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_questions" validate constraint "event_questions_event_id_fkey";

alter table "public"."event_questions" add constraint "event_questions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_questions" validate constraint "event_questions_user_id_fkey";

alter table "public"."events" add constraint "events_category_check" CHECK ((category = ANY (ARRAY['party'::text, 'meeting'::text, 'sports'::text, 'music'::text, 'food'::text, 'festival'::text, 'wedding'::text, 'reunion'::text, 'other'::text]))) not valid;

alter table "public"."events" validate constraint "events_category_check";

alter table "public"."events" add constraint "events_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_creator_id_fkey";

alter table "public"."events" add constraint "events_status_check" CHECK ((status = ANY (ARRAY['upcoming'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."events" validate constraint "events_status_check";

alter table "public"."followers" add constraint "followers_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."followers" validate constraint "followers_follower_id_fkey";

alter table "public"."followers" add constraint "followers_follower_id_following_id_key" UNIQUE using index "followers_follower_id_following_id_key";

alter table "public"."followers" add constraint "followers_following_id_fkey" FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."followers" validate constraint "followers_following_id_fkey";

alter table "public"."followers" add constraint "followers_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text]))) not valid;

alter table "public"."followers" validate constraint "followers_status_check";

alter table "public"."marketplace_favorites" add constraint "marketplace_favorites_item_id_fkey" FOREIGN KEY (item_id) REFERENCES marketplace_items(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_favorites" validate constraint "marketplace_favorites_item_id_fkey";

alter table "public"."marketplace_favorites" add constraint "marketplace_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_favorites" validate constraint "marketplace_favorites_user_id_fkey";

alter table "public"."marketplace_favorites" add constraint "marketplace_favorites_user_id_item_id_key" UNIQUE using index "marketplace_favorites_user_id_item_id_key";

alter table "public"."marketplace_images" add constraint "marketplace_images_item_id_fkey" FOREIGN KEY (item_id) REFERENCES marketplace_items(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_images" validate constraint "marketplace_images_item_id_fkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_condition_check" CHECK ((condition = ANY (ARRAY['new'::text, 'like_new'::text, 'good'::text, 'fair'::text, 'poor'::text]))) not valid;

alter table "public"."marketplace_items" validate constraint "marketplace_items_condition_check";

alter table "public"."marketplace_items" add constraint "marketplace_items_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL not valid;

alter table "public"."marketplace_items" validate constraint "marketplace_items_event_id_fkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_items" validate constraint "marketplace_items_seller_id_fkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_status_check" CHECK ((status = ANY (ARRAY['available'::text, 'reserved'::text, 'sold'::text]))) not valid;

alter table "public"."marketplace_items" validate constraint "marketplace_items_status_check";

alter table "public"."message_status" add constraint "message_status_message_id_fkey" FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE not valid;

alter table "public"."message_status" validate constraint "message_status_message_id_fkey";

alter table "public"."message_status" add constraint "message_status_message_id_user_id_key" UNIQUE using index "message_status_message_id_user_id_key";

alter table "public"."message_status" add constraint "message_status_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."message_status" validate constraint "message_status_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_category_check" CHECK ((category = ANY (ARRAY['like'::text, 'comment'::text, 'follow_request'::text, 'offer'::text, 'invite'::text, 'carpool_request'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_category_check";

alter table "public"."notifications" add constraint "notifications_sender_id_fkey1" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_sender_id_fkey1";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."poll_options" add constraint "poll_options_poll_id_fkey" FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE not valid;

alter table "public"."poll_options" validate constraint "poll_options_poll_id_fkey";

alter table "public"."poll_votes" add constraint "poll_votes_option_id_fkey" FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE not valid;

alter table "public"."poll_votes" validate constraint "poll_votes_option_id_fkey";

alter table "public"."poll_votes" add constraint "poll_votes_option_id_user_id_key" UNIQUE using index "poll_votes_option_id_user_id_key";

alter table "public"."poll_votes" add constraint "poll_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."poll_votes" validate constraint "poll_votes_user_id_fkey";

alter table "public"."polls" add constraint "polls_message_id_fkey" FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE not valid;

alter table "public"."polls" validate constraint "polls_message_id_fkey";

alter table "public"."post_likes" add constraint "post_likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_likes" validate constraint "post_likes_post_id_fkey";

alter table "public"."post_likes" add constraint "post_likes_post_id_user_id_key" UNIQUE using index "post_likes_post_id_user_id_key";

alter table "public"."post_likes" add constraint "post_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."post_likes" validate constraint "post_likes_user_id_fkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."typing_status" add constraint "typing_status_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."typing_status" validate constraint "typing_status_room_id_fkey";

alter table "public"."typing_status" add constraint "typing_status_room_id_user_id_key" UNIQUE using index "typing_status_room_id_user_id_key";

alter table "public"."typing_status" add constraint "typing_status_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."typing_status" validate constraint "typing_status_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.auto_accept_pending_followers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Only act if switching from private → public
  if OLD.is_private = true and NEW.is_private = false then
    update followers
    set status = 'accepted',
        updated_at = now()
    where following_id = NEW.id
      and status = 'pending';
  end if;

  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_typing_users(room_id uuid)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, username text, image_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    t.user_id,
    p.first_name,
    p.last_name,
    p.username,
    p.image_url
  FROM typing_status t
  JOIN profiles p ON p.id = t.user_id
  WHERE t.room_id = get_typing_users.room_id
    AND t.is_typing = true
    AND t.last_typed_at > NOW() - INTERVAL '5 seconds';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unread_count(room_id uuid, user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages m
    JOIN chat_participants p ON p.room_id = m.room_id
    WHERE m.room_id = get_unread_count.room_id
      AND p.user_id = get_unread_count.user_id
      AND m.created_at > COALESCE(p.last_read_at, '1970-01-01'::TIMESTAMP)
      AND m.sender_id != get_unread_count.user_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (
    id, 
    username, 
    first_name, 
    last_name,
    email,
    is_private,
    is_verified
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    false,
    false
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(room_id uuid, user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE chat_participants
  SET last_read_at = NOW()
  WHERE chat_participants.room_id = mark_messages_as_read.room_id
    AND chat_participants.user_id = mark_messages_as_read.user_id;
END;
$function$
;

grant delete on table "public"."carpool_passengers" to "anon";

grant insert on table "public"."carpool_passengers" to "anon";

grant references on table "public"."carpool_passengers" to "anon";

grant select on table "public"."carpool_passengers" to "anon";

grant trigger on table "public"."carpool_passengers" to "anon";

grant truncate on table "public"."carpool_passengers" to "anon";

grant update on table "public"."carpool_passengers" to "anon";

grant delete on table "public"."carpool_passengers" to "authenticated";

grant insert on table "public"."carpool_passengers" to "authenticated";

grant references on table "public"."carpool_passengers" to "authenticated";

grant select on table "public"."carpool_passengers" to "authenticated";

grant trigger on table "public"."carpool_passengers" to "authenticated";

grant truncate on table "public"."carpool_passengers" to "authenticated";

grant update on table "public"."carpool_passengers" to "authenticated";

grant delete on table "public"."carpool_passengers" to "service_role";

grant insert on table "public"."carpool_passengers" to "service_role";

grant references on table "public"."carpool_passengers" to "service_role";

grant select on table "public"."carpool_passengers" to "service_role";

grant trigger on table "public"."carpool_passengers" to "service_role";

grant truncate on table "public"."carpool_passengers" to "service_role";

grant update on table "public"."carpool_passengers" to "service_role";

grant delete on table "public"."carpool_requests" to "anon";

grant insert on table "public"."carpool_requests" to "anon";

grant references on table "public"."carpool_requests" to "anon";

grant select on table "public"."carpool_requests" to "anon";

grant trigger on table "public"."carpool_requests" to "anon";

grant truncate on table "public"."carpool_requests" to "anon";

grant update on table "public"."carpool_requests" to "anon";

grant delete on table "public"."carpool_requests" to "authenticated";

grant insert on table "public"."carpool_requests" to "authenticated";

grant references on table "public"."carpool_requests" to "authenticated";

grant select on table "public"."carpool_requests" to "authenticated";

grant trigger on table "public"."carpool_requests" to "authenticated";

grant truncate on table "public"."carpool_requests" to "authenticated";

grant update on table "public"."carpool_requests" to "authenticated";

grant delete on table "public"."carpool_requests" to "service_role";

grant insert on table "public"."carpool_requests" to "service_role";

grant references on table "public"."carpool_requests" to "service_role";

grant select on table "public"."carpool_requests" to "service_role";

grant trigger on table "public"."carpool_requests" to "service_role";

grant truncate on table "public"."carpool_requests" to "service_role";

grant update on table "public"."carpool_requests" to "service_role";

grant delete on table "public"."carpools" to "anon";

grant insert on table "public"."carpools" to "anon";

grant references on table "public"."carpools" to "anon";

grant select on table "public"."carpools" to "anon";

grant trigger on table "public"."carpools" to "anon";

grant truncate on table "public"."carpools" to "anon";

grant update on table "public"."carpools" to "anon";

grant delete on table "public"."carpools" to "authenticated";

grant insert on table "public"."carpools" to "authenticated";

grant references on table "public"."carpools" to "authenticated";

grant select on table "public"."carpools" to "authenticated";

grant trigger on table "public"."carpools" to "authenticated";

grant truncate on table "public"."carpools" to "authenticated";

grant update on table "public"."carpools" to "authenticated";

grant delete on table "public"."carpools" to "service_role";

grant insert on table "public"."carpools" to "service_role";

grant references on table "public"."carpools" to "service_role";

grant select on table "public"."carpools" to "service_role";

grant trigger on table "public"."carpools" to "service_role";

grant truncate on table "public"."carpools" to "service_role";

grant update on table "public"."carpools" to "service_role";

grant delete on table "public"."cars" to "anon";

grant insert on table "public"."cars" to "anon";

grant references on table "public"."cars" to "anon";

grant select on table "public"."cars" to "anon";

grant trigger on table "public"."cars" to "anon";

grant truncate on table "public"."cars" to "anon";

grant update on table "public"."cars" to "anon";

grant delete on table "public"."cars" to "authenticated";

grant insert on table "public"."cars" to "authenticated";

grant references on table "public"."cars" to "authenticated";

grant select on table "public"."cars" to "authenticated";

grant trigger on table "public"."cars" to "authenticated";

grant truncate on table "public"."cars" to "authenticated";

grant update on table "public"."cars" to "authenticated";

grant delete on table "public"."cars" to "service_role";

grant insert on table "public"."cars" to "service_role";

grant references on table "public"."cars" to "service_role";

grant select on table "public"."cars" to "service_role";

grant trigger on table "public"."cars" to "service_role";

grant truncate on table "public"."cars" to "service_role";

grant update on table "public"."cars" to "service_role";

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."chat_participants" to "anon";

grant insert on table "public"."chat_participants" to "anon";

grant references on table "public"."chat_participants" to "anon";

grant select on table "public"."chat_participants" to "anon";

grant trigger on table "public"."chat_participants" to "anon";

grant truncate on table "public"."chat_participants" to "anon";

grant update on table "public"."chat_participants" to "anon";

grant delete on table "public"."chat_participants" to "authenticated";

grant insert on table "public"."chat_participants" to "authenticated";

grant references on table "public"."chat_participants" to "authenticated";

grant select on table "public"."chat_participants" to "authenticated";

grant trigger on table "public"."chat_participants" to "authenticated";

grant truncate on table "public"."chat_participants" to "authenticated";

grant update on table "public"."chat_participants" to "authenticated";

grant delete on table "public"."chat_participants" to "service_role";

grant insert on table "public"."chat_participants" to "service_role";

grant references on table "public"."chat_participants" to "service_role";

grant select on table "public"."chat_participants" to "service_role";

grant trigger on table "public"."chat_participants" to "service_role";

grant truncate on table "public"."chat_participants" to "service_role";

grant update on table "public"."chat_participants" to "service_role";

grant delete on table "public"."chat_rooms" to "anon";

grant insert on table "public"."chat_rooms" to "anon";

grant references on table "public"."chat_rooms" to "anon";

grant select on table "public"."chat_rooms" to "anon";

grant trigger on table "public"."chat_rooms" to "anon";

grant truncate on table "public"."chat_rooms" to "anon";

grant update on table "public"."chat_rooms" to "anon";

grant delete on table "public"."chat_rooms" to "authenticated";

grant insert on table "public"."chat_rooms" to "authenticated";

grant references on table "public"."chat_rooms" to "authenticated";

grant select on table "public"."chat_rooms" to "authenticated";

grant trigger on table "public"."chat_rooms" to "authenticated";

grant truncate on table "public"."chat_rooms" to "authenticated";

grant update on table "public"."chat_rooms" to "authenticated";

grant delete on table "public"."chat_rooms" to "service_role";

grant insert on table "public"."chat_rooms" to "service_role";

grant references on table "public"."chat_rooms" to "service_role";

grant select on table "public"."chat_rooms" to "service_role";

grant trigger on table "public"."chat_rooms" to "service_role";

grant truncate on table "public"."chat_rooms" to "service_role";

grant update on table "public"."chat_rooms" to "service_role";

grant delete on table "public"."checklist_checks" to "anon";

grant insert on table "public"."checklist_checks" to "anon";

grant references on table "public"."checklist_checks" to "anon";

grant select on table "public"."checklist_checks" to "anon";

grant trigger on table "public"."checklist_checks" to "anon";

grant truncate on table "public"."checklist_checks" to "anon";

grant update on table "public"."checklist_checks" to "anon";

grant delete on table "public"."checklist_checks" to "authenticated";

grant insert on table "public"."checklist_checks" to "authenticated";

grant references on table "public"."checklist_checks" to "authenticated";

grant select on table "public"."checklist_checks" to "authenticated";

grant trigger on table "public"."checklist_checks" to "authenticated";

grant truncate on table "public"."checklist_checks" to "authenticated";

grant update on table "public"."checklist_checks" to "authenticated";

grant delete on table "public"."checklist_checks" to "service_role";

grant insert on table "public"."checklist_checks" to "service_role";

grant references on table "public"."checklist_checks" to "service_role";

grant select on table "public"."checklist_checks" to "service_role";

grant trigger on table "public"."checklist_checks" to "service_role";

grant truncate on table "public"."checklist_checks" to "service_role";

grant update on table "public"."checklist_checks" to "service_role";

grant delete on table "public"."checklist_items" to "anon";

grant insert on table "public"."checklist_items" to "anon";

grant references on table "public"."checklist_items" to "anon";

grant select on table "public"."checklist_items" to "anon";

grant trigger on table "public"."checklist_items" to "anon";

grant truncate on table "public"."checklist_items" to "anon";

grant update on table "public"."checklist_items" to "anon";

grant delete on table "public"."checklist_items" to "authenticated";

grant insert on table "public"."checklist_items" to "authenticated";

grant references on table "public"."checklist_items" to "authenticated";

grant select on table "public"."checklist_items" to "authenticated";

grant trigger on table "public"."checklist_items" to "authenticated";

grant truncate on table "public"."checklist_items" to "authenticated";

grant update on table "public"."checklist_items" to "authenticated";

grant delete on table "public"."checklist_items" to "service_role";

grant insert on table "public"."checklist_items" to "service_role";

grant references on table "public"."checklist_items" to "service_role";

grant select on table "public"."checklist_items" to "service_role";

grant trigger on table "public"."checklist_items" to "service_role";

grant truncate on table "public"."checklist_items" to "service_role";

grant update on table "public"."checklist_items" to "service_role";

grant delete on table "public"."checklists" to "anon";

grant insert on table "public"."checklists" to "anon";

grant references on table "public"."checklists" to "anon";

grant select on table "public"."checklists" to "anon";

grant trigger on table "public"."checklists" to "anon";

grant truncate on table "public"."checklists" to "anon";

grant update on table "public"."checklists" to "anon";

grant delete on table "public"."checklists" to "authenticated";

grant insert on table "public"."checklists" to "authenticated";

grant references on table "public"."checklists" to "authenticated";

grant select on table "public"."checklists" to "authenticated";

grant trigger on table "public"."checklists" to "authenticated";

grant truncate on table "public"."checklists" to "authenticated";

grant update on table "public"."checklists" to "authenticated";

grant delete on table "public"."checklists" to "service_role";

grant insert on table "public"."checklists" to "service_role";

grant references on table "public"."checklists" to "service_role";

grant select on table "public"."checklists" to "service_role";

grant trigger on table "public"."checklists" to "service_role";

grant truncate on table "public"."checklists" to "service_role";

grant update on table "public"."checklists" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."event_answers" to "anon";

grant insert on table "public"."event_answers" to "anon";

grant references on table "public"."event_answers" to "anon";

grant select on table "public"."event_answers" to "anon";

grant trigger on table "public"."event_answers" to "anon";

grant truncate on table "public"."event_answers" to "anon";

grant update on table "public"."event_answers" to "anon";

grant delete on table "public"."event_answers" to "authenticated";

grant insert on table "public"."event_answers" to "authenticated";

grant references on table "public"."event_answers" to "authenticated";

grant select on table "public"."event_answers" to "authenticated";

grant trigger on table "public"."event_answers" to "authenticated";

grant truncate on table "public"."event_answers" to "authenticated";

grant update on table "public"."event_answers" to "authenticated";

grant delete on table "public"."event_answers" to "service_role";

grant insert on table "public"."event_answers" to "service_role";

grant references on table "public"."event_answers" to "service_role";

grant select on table "public"."event_answers" to "service_role";

grant trigger on table "public"."event_answers" to "service_role";

grant truncate on table "public"."event_answers" to "service_role";

grant update on table "public"."event_answers" to "service_role";

grant delete on table "public"."event_followers" to "anon";

grant insert on table "public"."event_followers" to "anon";

grant references on table "public"."event_followers" to "anon";

grant select on table "public"."event_followers" to "anon";

grant trigger on table "public"."event_followers" to "anon";

grant truncate on table "public"."event_followers" to "anon";

grant update on table "public"."event_followers" to "anon";

grant delete on table "public"."event_followers" to "authenticated";

grant insert on table "public"."event_followers" to "authenticated";

grant references on table "public"."event_followers" to "authenticated";

grant select on table "public"."event_followers" to "authenticated";

grant trigger on table "public"."event_followers" to "authenticated";

grant truncate on table "public"."event_followers" to "authenticated";

grant update on table "public"."event_followers" to "authenticated";

grant delete on table "public"."event_followers" to "service_role";

grant insert on table "public"."event_followers" to "service_role";

grant references on table "public"."event_followers" to "service_role";

grant select on table "public"."event_followers" to "service_role";

grant trigger on table "public"."event_followers" to "service_role";

grant truncate on table "public"."event_followers" to "service_role";

grant update on table "public"."event_followers" to "service_role";

grant delete on table "public"."event_images" to "anon";

grant insert on table "public"."event_images" to "anon";

grant references on table "public"."event_images" to "anon";

grant select on table "public"."event_images" to "anon";

grant trigger on table "public"."event_images" to "anon";

grant truncate on table "public"."event_images" to "anon";

grant update on table "public"."event_images" to "anon";

grant delete on table "public"."event_images" to "authenticated";

grant insert on table "public"."event_images" to "authenticated";

grant references on table "public"."event_images" to "authenticated";

grant select on table "public"."event_images" to "authenticated";

grant trigger on table "public"."event_images" to "authenticated";

grant truncate on table "public"."event_images" to "authenticated";

grant update on table "public"."event_images" to "authenticated";

grant delete on table "public"."event_images" to "service_role";

grant insert on table "public"."event_images" to "service_role";

grant references on table "public"."event_images" to "service_role";

grant select on table "public"."event_images" to "service_role";

grant trigger on table "public"."event_images" to "service_role";

grant truncate on table "public"."event_images" to "service_role";

grant update on table "public"."event_images" to "service_role";

grant delete on table "public"."event_invites" to "anon";

grant insert on table "public"."event_invites" to "anon";

grant references on table "public"."event_invites" to "anon";

grant select on table "public"."event_invites" to "anon";

grant trigger on table "public"."event_invites" to "anon";

grant truncate on table "public"."event_invites" to "anon";

grant update on table "public"."event_invites" to "anon";

grant delete on table "public"."event_invites" to "authenticated";

grant insert on table "public"."event_invites" to "authenticated";

grant references on table "public"."event_invites" to "authenticated";

grant select on table "public"."event_invites" to "authenticated";

grant trigger on table "public"."event_invites" to "authenticated";

grant truncate on table "public"."event_invites" to "authenticated";

grant update on table "public"."event_invites" to "authenticated";

grant delete on table "public"."event_invites" to "service_role";

grant insert on table "public"."event_invites" to "service_role";

grant references on table "public"."event_invites" to "service_role";

grant select on table "public"."event_invites" to "service_role";

grant trigger on table "public"."event_invites" to "service_role";

grant truncate on table "public"."event_invites" to "service_role";

grant update on table "public"."event_invites" to "service_role";

grant delete on table "public"."event_participants" to "anon";

grant insert on table "public"."event_participants" to "anon";

grant references on table "public"."event_participants" to "anon";

grant select on table "public"."event_participants" to "anon";

grant trigger on table "public"."event_participants" to "anon";

grant truncate on table "public"."event_participants" to "anon";

grant update on table "public"."event_participants" to "anon";

grant delete on table "public"."event_participants" to "authenticated";

grant insert on table "public"."event_participants" to "authenticated";

grant references on table "public"."event_participants" to "authenticated";

grant select on table "public"."event_participants" to "authenticated";

grant trigger on table "public"."event_participants" to "authenticated";

grant truncate on table "public"."event_participants" to "authenticated";

grant update on table "public"."event_participants" to "authenticated";

grant delete on table "public"."event_participants" to "service_role";

grant insert on table "public"."event_participants" to "service_role";

grant references on table "public"."event_participants" to "service_role";

grant select on table "public"."event_participants" to "service_role";

grant trigger on table "public"."event_participants" to "service_role";

grant truncate on table "public"."event_participants" to "service_role";

grant update on table "public"."event_participants" to "service_role";

grant delete on table "public"."event_posts" to "anon";

grant insert on table "public"."event_posts" to "anon";

grant references on table "public"."event_posts" to "anon";

grant select on table "public"."event_posts" to "anon";

grant trigger on table "public"."event_posts" to "anon";

grant truncate on table "public"."event_posts" to "anon";

grant update on table "public"."event_posts" to "anon";

grant delete on table "public"."event_posts" to "authenticated";

grant insert on table "public"."event_posts" to "authenticated";

grant references on table "public"."event_posts" to "authenticated";

grant select on table "public"."event_posts" to "authenticated";

grant trigger on table "public"."event_posts" to "authenticated";

grant truncate on table "public"."event_posts" to "authenticated";

grant update on table "public"."event_posts" to "authenticated";

grant delete on table "public"."event_posts" to "service_role";

grant insert on table "public"."event_posts" to "service_role";

grant references on table "public"."event_posts" to "service_role";

grant select on table "public"."event_posts" to "service_role";

grant trigger on table "public"."event_posts" to "service_role";

grant truncate on table "public"."event_posts" to "service_role";

grant update on table "public"."event_posts" to "service_role";

grant delete on table "public"."event_questions" to "anon";

grant insert on table "public"."event_questions" to "anon";

grant references on table "public"."event_questions" to "anon";

grant select on table "public"."event_questions" to "anon";

grant trigger on table "public"."event_questions" to "anon";

grant truncate on table "public"."event_questions" to "anon";

grant update on table "public"."event_questions" to "anon";

grant delete on table "public"."event_questions" to "authenticated";

grant insert on table "public"."event_questions" to "authenticated";

grant references on table "public"."event_questions" to "authenticated";

grant select on table "public"."event_questions" to "authenticated";

grant trigger on table "public"."event_questions" to "authenticated";

grant truncate on table "public"."event_questions" to "authenticated";

grant update on table "public"."event_questions" to "authenticated";

grant delete on table "public"."event_questions" to "service_role";

grant insert on table "public"."event_questions" to "service_role";

grant references on table "public"."event_questions" to "service_role";

grant select on table "public"."event_questions" to "service_role";

grant trigger on table "public"."event_questions" to "service_role";

grant truncate on table "public"."event_questions" to "service_role";

grant update on table "public"."event_questions" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."followers" to "anon";

grant insert on table "public"."followers" to "anon";

grant references on table "public"."followers" to "anon";

grant select on table "public"."followers" to "anon";

grant trigger on table "public"."followers" to "anon";

grant truncate on table "public"."followers" to "anon";

grant update on table "public"."followers" to "anon";

grant delete on table "public"."followers" to "authenticated";

grant insert on table "public"."followers" to "authenticated";

grant references on table "public"."followers" to "authenticated";

grant select on table "public"."followers" to "authenticated";

grant trigger on table "public"."followers" to "authenticated";

grant truncate on table "public"."followers" to "authenticated";

grant update on table "public"."followers" to "authenticated";

grant delete on table "public"."followers" to "service_role";

grant insert on table "public"."followers" to "service_role";

grant references on table "public"."followers" to "service_role";

grant select on table "public"."followers" to "service_role";

grant trigger on table "public"."followers" to "service_role";

grant truncate on table "public"."followers" to "service_role";

grant update on table "public"."followers" to "service_role";

grant delete on table "public"."marketplace_favorites" to "anon";

grant insert on table "public"."marketplace_favorites" to "anon";

grant references on table "public"."marketplace_favorites" to "anon";

grant select on table "public"."marketplace_favorites" to "anon";

grant trigger on table "public"."marketplace_favorites" to "anon";

grant truncate on table "public"."marketplace_favorites" to "anon";

grant update on table "public"."marketplace_favorites" to "anon";

grant delete on table "public"."marketplace_favorites" to "authenticated";

grant insert on table "public"."marketplace_favorites" to "authenticated";

grant references on table "public"."marketplace_favorites" to "authenticated";

grant select on table "public"."marketplace_favorites" to "authenticated";

grant trigger on table "public"."marketplace_favorites" to "authenticated";

grant truncate on table "public"."marketplace_favorites" to "authenticated";

grant update on table "public"."marketplace_favorites" to "authenticated";

grant delete on table "public"."marketplace_favorites" to "service_role";

grant insert on table "public"."marketplace_favorites" to "service_role";

grant references on table "public"."marketplace_favorites" to "service_role";

grant select on table "public"."marketplace_favorites" to "service_role";

grant trigger on table "public"."marketplace_favorites" to "service_role";

grant truncate on table "public"."marketplace_favorites" to "service_role";

grant update on table "public"."marketplace_favorites" to "service_role";

grant delete on table "public"."marketplace_images" to "anon";

grant insert on table "public"."marketplace_images" to "anon";

grant references on table "public"."marketplace_images" to "anon";

grant select on table "public"."marketplace_images" to "anon";

grant trigger on table "public"."marketplace_images" to "anon";

grant truncate on table "public"."marketplace_images" to "anon";

grant update on table "public"."marketplace_images" to "anon";

grant delete on table "public"."marketplace_images" to "authenticated";

grant insert on table "public"."marketplace_images" to "authenticated";

grant references on table "public"."marketplace_images" to "authenticated";

grant select on table "public"."marketplace_images" to "authenticated";

grant trigger on table "public"."marketplace_images" to "authenticated";

grant truncate on table "public"."marketplace_images" to "authenticated";

grant update on table "public"."marketplace_images" to "authenticated";

grant delete on table "public"."marketplace_images" to "service_role";

grant insert on table "public"."marketplace_images" to "service_role";

grant references on table "public"."marketplace_images" to "service_role";

grant select on table "public"."marketplace_images" to "service_role";

grant trigger on table "public"."marketplace_images" to "service_role";

grant truncate on table "public"."marketplace_images" to "service_role";

grant update on table "public"."marketplace_images" to "service_role";

grant delete on table "public"."marketplace_items" to "anon";

grant insert on table "public"."marketplace_items" to "anon";

grant references on table "public"."marketplace_items" to "anon";

grant select on table "public"."marketplace_items" to "anon";

grant trigger on table "public"."marketplace_items" to "anon";

grant truncate on table "public"."marketplace_items" to "anon";

grant update on table "public"."marketplace_items" to "anon";

grant delete on table "public"."marketplace_items" to "authenticated";

grant insert on table "public"."marketplace_items" to "authenticated";

grant references on table "public"."marketplace_items" to "authenticated";

grant select on table "public"."marketplace_items" to "authenticated";

grant trigger on table "public"."marketplace_items" to "authenticated";

grant truncate on table "public"."marketplace_items" to "authenticated";

grant update on table "public"."marketplace_items" to "authenticated";

grant delete on table "public"."marketplace_items" to "service_role";

grant insert on table "public"."marketplace_items" to "service_role";

grant references on table "public"."marketplace_items" to "service_role";

grant select on table "public"."marketplace_items" to "service_role";

grant trigger on table "public"."marketplace_items" to "service_role";

grant truncate on table "public"."marketplace_items" to "service_role";

grant update on table "public"."marketplace_items" to "service_role";

grant delete on table "public"."message_status" to "anon";

grant insert on table "public"."message_status" to "anon";

grant references on table "public"."message_status" to "anon";

grant select on table "public"."message_status" to "anon";

grant trigger on table "public"."message_status" to "anon";

grant truncate on table "public"."message_status" to "anon";

grant update on table "public"."message_status" to "anon";

grant delete on table "public"."message_status" to "authenticated";

grant insert on table "public"."message_status" to "authenticated";

grant references on table "public"."message_status" to "authenticated";

grant select on table "public"."message_status" to "authenticated";

grant trigger on table "public"."message_status" to "authenticated";

grant truncate on table "public"."message_status" to "authenticated";

grant update on table "public"."message_status" to "authenticated";

grant delete on table "public"."message_status" to "service_role";

grant insert on table "public"."message_status" to "service_role";

grant references on table "public"."message_status" to "service_role";

grant select on table "public"."message_status" to "service_role";

grant trigger on table "public"."message_status" to "service_role";

grant truncate on table "public"."message_status" to "service_role";

grant update on table "public"."message_status" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."poll_options" to "anon";

grant insert on table "public"."poll_options" to "anon";

grant references on table "public"."poll_options" to "anon";

grant select on table "public"."poll_options" to "anon";

grant trigger on table "public"."poll_options" to "anon";

grant truncate on table "public"."poll_options" to "anon";

grant update on table "public"."poll_options" to "anon";

grant delete on table "public"."poll_options" to "authenticated";

grant insert on table "public"."poll_options" to "authenticated";

grant references on table "public"."poll_options" to "authenticated";

grant select on table "public"."poll_options" to "authenticated";

grant trigger on table "public"."poll_options" to "authenticated";

grant truncate on table "public"."poll_options" to "authenticated";

grant update on table "public"."poll_options" to "authenticated";

grant delete on table "public"."poll_options" to "service_role";

grant insert on table "public"."poll_options" to "service_role";

grant references on table "public"."poll_options" to "service_role";

grant select on table "public"."poll_options" to "service_role";

grant trigger on table "public"."poll_options" to "service_role";

grant truncate on table "public"."poll_options" to "service_role";

grant update on table "public"."poll_options" to "service_role";

grant delete on table "public"."poll_votes" to "anon";

grant insert on table "public"."poll_votes" to "anon";

grant references on table "public"."poll_votes" to "anon";

grant select on table "public"."poll_votes" to "anon";

grant trigger on table "public"."poll_votes" to "anon";

grant truncate on table "public"."poll_votes" to "anon";

grant update on table "public"."poll_votes" to "anon";

grant delete on table "public"."poll_votes" to "authenticated";

grant insert on table "public"."poll_votes" to "authenticated";

grant references on table "public"."poll_votes" to "authenticated";

grant select on table "public"."poll_votes" to "authenticated";

grant trigger on table "public"."poll_votes" to "authenticated";

grant truncate on table "public"."poll_votes" to "authenticated";

grant update on table "public"."poll_votes" to "authenticated";

grant delete on table "public"."poll_votes" to "service_role";

grant insert on table "public"."poll_votes" to "service_role";

grant references on table "public"."poll_votes" to "service_role";

grant select on table "public"."poll_votes" to "service_role";

grant trigger on table "public"."poll_votes" to "service_role";

grant truncate on table "public"."poll_votes" to "service_role";

grant update on table "public"."poll_votes" to "service_role";

grant delete on table "public"."polls" to "anon";

grant insert on table "public"."polls" to "anon";

grant references on table "public"."polls" to "anon";

grant select on table "public"."polls" to "anon";

grant trigger on table "public"."polls" to "anon";

grant truncate on table "public"."polls" to "anon";

grant update on table "public"."polls" to "anon";

grant delete on table "public"."polls" to "authenticated";

grant insert on table "public"."polls" to "authenticated";

grant references on table "public"."polls" to "authenticated";

grant select on table "public"."polls" to "authenticated";

grant trigger on table "public"."polls" to "authenticated";

grant truncate on table "public"."polls" to "authenticated";

grant update on table "public"."polls" to "authenticated";

grant delete on table "public"."polls" to "service_role";

grant insert on table "public"."polls" to "service_role";

grant references on table "public"."polls" to "service_role";

grant select on table "public"."polls" to "service_role";

grant trigger on table "public"."polls" to "service_role";

grant truncate on table "public"."polls" to "service_role";

grant update on table "public"."polls" to "service_role";

grant delete on table "public"."post_likes" to "anon";

grant insert on table "public"."post_likes" to "anon";

grant references on table "public"."post_likes" to "anon";

grant select on table "public"."post_likes" to "anon";

grant trigger on table "public"."post_likes" to "anon";

grant truncate on table "public"."post_likes" to "anon";

grant update on table "public"."post_likes" to "anon";

grant delete on table "public"."post_likes" to "authenticated";

grant insert on table "public"."post_likes" to "authenticated";

grant references on table "public"."post_likes" to "authenticated";

grant select on table "public"."post_likes" to "authenticated";

grant trigger on table "public"."post_likes" to "authenticated";

grant truncate on table "public"."post_likes" to "authenticated";

grant update on table "public"."post_likes" to "authenticated";

grant delete on table "public"."post_likes" to "service_role";

grant insert on table "public"."post_likes" to "service_role";

grant references on table "public"."post_likes" to "service_role";

grant select on table "public"."post_likes" to "service_role";

grant trigger on table "public"."post_likes" to "service_role";

grant truncate on table "public"."post_likes" to "service_role";

grant update on table "public"."post_likes" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."typing_status" to "anon";

grant insert on table "public"."typing_status" to "anon";

grant references on table "public"."typing_status" to "anon";

grant select on table "public"."typing_status" to "anon";

grant trigger on table "public"."typing_status" to "anon";

grant truncate on table "public"."typing_status" to "anon";

grant update on table "public"."typing_status" to "anon";

grant delete on table "public"."typing_status" to "authenticated";

grant insert on table "public"."typing_status" to "authenticated";

grant references on table "public"."typing_status" to "authenticated";

grant select on table "public"."typing_status" to "authenticated";

grant trigger on table "public"."typing_status" to "authenticated";

grant truncate on table "public"."typing_status" to "authenticated";

grant update on table "public"."typing_status" to "authenticated";

grant delete on table "public"."typing_status" to "service_role";

grant insert on table "public"."typing_status" to "service_role";

grant references on table "public"."typing_status" to "service_role";

grant select on table "public"."typing_status" to "service_role";

grant trigger on table "public"."typing_status" to "service_role";

grant truncate on table "public"."typing_status" to "service_role";

grant update on table "public"."typing_status" to "service_role";

create policy "Driver confirms passenger"
on "public"."carpool_passengers"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM carpools
  WHERE ((carpools.id = carpool_passengers.carpool_id) AND (carpools.driver_id = auth.uid())))));


create policy "Request join carpool"
on "public"."carpool_passengers"
as permissive
for insert
to public
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM carpools
  WHERE ((carpools.id = carpool_passengers.carpool_id) AND ((carpools.is_private = false) OR (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpools.driver_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Update own passenger status"
on "public"."carpool_passengers"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View if passenger or driver"
on "public"."carpool_passengers"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM carpools
  WHERE ((carpools.id = carpool_passengers.carpool_id) AND (carpools.driver_id = auth.uid()))))));


create policy "Create own request"
on "public"."carpool_requests"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Delete own request"
on "public"."carpool_requests"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Update/delete own request"
on "public"."carpool_requests"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View own or public or follower's request"
on "public"."carpool_requests"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM followers
  WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpool_requests.user_id) AND (followers.status = 'accepted'::text))))));


create policy "Create your own carpool"
on "public"."carpools"
as permissive
for insert
to public
with check ((auth.uid() = driver_id));


create policy "Delete own carpool"
on "public"."carpools"
as permissive
for delete
to public
using ((auth.uid() = driver_id));


create policy "Update own carpool"
on "public"."carpools"
as permissive
for update
to public
using ((auth.uid() = driver_id))
with check ((auth.uid() = driver_id));


create policy "View public or private if follower"
on "public"."carpools"
as permissive
for select
to public
using (((driver_id = auth.uid()) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM followers
  WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpools.driver_id) AND (followers.status = 'accepted'::text))))));


create policy "Access own car info"
on "public"."cars"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Delete own car"
on "public"."cars"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Insert own car"
on "public"."cars"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Update own car"
on "public"."cars"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Enable all operations for authenticated users"
on "public"."chat_messages"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Enable read access for all users"
on "public"."chat_participants"
as permissive
for all
to authenticated
using (true);


create policy "Enable all operations for authenticated users"
on "public"."chat_rooms"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Check items in checklists you can see"
on "public"."checklist_checks"
as permissive
for insert
to public
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (((checklist_items ci
     JOIN checklists c ON ((c.id = ci.checklist_id)))
     JOIN chat_messages m ON ((m.id = c.message_id)))
     JOIN chat_participants cp ON ((cp.room_id = m.room_id)))
  WHERE ((ci.id = checklist_checks.item_id) AND (cp.user_id = auth.uid()))))));


create policy "See own checklist checks"
on "public"."checklist_checks"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Update own checklist checks"
on "public"."checklist_checks"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Create checklist items in own checklist"
on "public"."checklist_items"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (m.sender_id = auth.uid())))));


create policy "See checklist items if in checklist's room"
on "public"."checklist_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM ((checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
     JOIN chat_participants cp ON ((cp.room_id = m.room_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (cp.user_id = auth.uid())))));


create policy "Create checklist for your messages"
on "public"."checklists"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM chat_messages m
  WHERE ((m.id = checklists.message_id) AND (m.sender_id = auth.uid())))));


create policy "See checklists if in message room"
on "public"."checklists"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (chat_messages m
     JOIN chat_participants p ON ((p.room_id = m.room_id)))
  WHERE ((m.id = checklists.message_id) AND (p.user_id = auth.uid())))));


create policy "Delete own comments"
on "public"."comments"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Insert if can view post"
on "public"."comments"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND ((auth.uid() = posts.user_id) OR (posts.is_private = false) OR ((posts.is_private = true) AND (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = posts.user_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Select if can view post"
on "public"."comments"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = comments.post_id) AND ((auth.uid() = posts.user_id) OR (posts.is_private = false) OR ((posts.is_private = true) AND (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = posts.user_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Update own comments"
on "public"."comments"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Answer if allowed"
on "public"."event_answers"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM (event_questions
     JOIN events ON ((events.id = event_questions.event_id)))
  WHERE ((event_questions.id = event_answers.question_id) AND ((events.is_private = false) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text)))))))));


create policy "Delete own answers"
on "public"."event_answers"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Manage own answers"
on "public"."event_answers"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View if can access question"
on "public"."event_answers"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (event_questions
     JOIN events ON ((events.id = event_questions.event_id)))
  WHERE ((event_questions.id = event_answers.question_id) AND ((events.is_private = false) OR (events.creator_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text)))))))));


create policy "Enable read access for all users"
on "public"."event_followers"
as permissive
for select
to authenticated
using (true);


create policy "Follow public events only"
on "public"."event_followers"
as permissive
for insert
to authenticated
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_followers.event_id) AND (events.is_private = false))))));


create policy "Unfollow event"
on "public"."event_followers"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Allow anyone to view event images"
on "public"."event_images"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_images.event_id) AND ((events.is_private = false) OR (events.creator_id = auth.uid()))))));


create policy "Allow event creator to delete images"
on "public"."event_images"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_images.event_id) AND (events.creator_id = auth.uid())))));


create policy "Allow event creator to upload images"
on "public"."event_images"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_images.event_id) AND (events.creator_id = auth.uid())))));


create policy "Creator can manage invites"
on "public"."event_invites"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_invites.event_id) AND (events.creator_id = auth.uid())))));


create policy "Users can view their own invites"
on "public"."event_invites"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


create policy "Anyone can join public events"
on "public"."event_participants"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_participants.event_id) AND (events.is_private = false)))) AND (auth.uid() = user_id)));


create policy "Delete if creator or self"
on "public"."event_participants"
as permissive
for delete
to authenticated
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_participants.event_id) AND (events.creator_id = auth.uid()))))));


create policy "Enable read access for all users"
on "public"."event_participants"
as permissive
for select
to authenticated
using (true);


create policy "Insert if event creator"
on "public"."event_participants"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_participants.event_id) AND (events.creator_id = auth.uid())))));


create policy "User updates own RSVP"
on "public"."event_participants"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Delete own event posts"
on "public"."event_posts"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Manage own event posts"
on "public"."event_posts"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Post if allowed"
on "public"."event_posts"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_posts.event_id) AND ((events.creator_id = auth.uid()) OR ((events.allow_guests_to_post = true) AND (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text))))))))));


create policy "View if can see event"
on "public"."event_posts"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_posts.event_id) AND ((events.is_private = false) OR (events.creator_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text)))))))));


create policy "Ask if accepted guest or event is public"
on "public"."event_questions"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_questions.event_id) AND ((events.is_private = false) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text)))))))));


create policy "Delete own questions"
on "public"."event_questions"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Manage own questions"
on "public"."event_questions"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View if can access event"
on "public"."event_questions"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_questions.event_id) AND ((events.is_private = false) OR (events.creator_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text)))))))));


create policy "Create your own event"
on "public"."events"
as permissive
for insert
to authenticated
with check ((auth.uid() = creator_id));


create policy "Delete own event"
on "public"."events"
as permissive
for delete
to authenticated
using ((auth.uid() = creator_id));


create policy "Update own event"
on "public"."events"
as permissive
for update
to authenticated
using ((auth.uid() = creator_id))
with check ((auth.uid() = creator_id));


create policy "View if owner or accepted guest (or public)"
on "public"."events"
as permissive
for select
to authenticated
using (((auth.uid() = creator_id) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM event_participants
  WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'accepted'::text))))));


create policy "Delete if follower or following"
on "public"."followers"
as permissive
for delete
to public
using (((auth.uid() = follower_id) OR (auth.uid() = following_id)));


create policy "Insert if you are the follower"
on "public"."followers"
as permissive
for insert
to public
with check ((auth.uid() = follower_id));


create policy "Select if follower or following"
on "public"."followers"
as permissive
for select
to public
using (((auth.uid() = follower_id) OR (auth.uid() = following_id)));


create policy "Update status if you are the following"
on "public"."followers"
as permissive
for update
to public
using ((auth.uid() = following_id))
with check ((auth.uid() = following_id));


create policy "Delete own favorite"
on "public"."marketplace_favorites"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Insert own favorite"
on "public"."marketplace_favorites"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Select own favorites"
on "public"."marketplace_favorites"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Anyone can see item images"
on "public"."marketplace_images"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM marketplace_items
  WHERE (marketplace_items.id = marketplace_images.item_id))));


create policy "Manage if item owner"
on "public"."marketplace_images"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM marketplace_items
  WHERE ((marketplace_items.id = marketplace_images.item_id) AND (marketplace_items.seller_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM marketplace_items
  WHERE ((marketplace_items.id = marketplace_images.item_id) AND (marketplace_items.seller_id = auth.uid())))));


create policy "Create own item"
on "public"."marketplace_items"
as permissive
for insert
to public
with check ((auth.uid() = seller_id));


create policy "Delete own item"
on "public"."marketplace_items"
as permissive
for delete
to public
using ((auth.uid() = seller_id));


create policy "Public can view items"
on "public"."marketplace_items"
as permissive
for select
to public
using (true);


create policy "Update own item"
on "public"."marketplace_items"
as permissive
for update
to public
using ((auth.uid() = seller_id))
with check ((auth.uid() = seller_id));


create policy "Track your own read status"
on "public"."message_status"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Update your own read status"
on "public"."message_status"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View own message read state"
on "public"."message_status"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Delete own notification"
on "public"."notifications"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Select own notifications"
on "public"."notifications"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Update own notification"
on "public"."notifications"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can create notifications for others"
on "public"."notifications"
as permissive
for insert
to authenticated
with check ((auth.uid() = sender_id));


create policy "Create options for own polls"
on "public"."poll_options"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (polls p
     JOIN chat_messages m ON ((m.id = p.message_id)))
  WHERE ((p.id = poll_options.poll_id) AND (m.sender_id = auth.uid())))));


create policy "See poll options if in poll's room"
on "public"."poll_options"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM ((polls p
     JOIN chat_messages m ON ((m.id = p.message_id)))
     JOIN chat_participants cp ON ((cp.room_id = m.room_id)))
  WHERE ((p.id = poll_options.poll_id) AND (cp.user_id = auth.uid())))));


create policy "See own votes"
on "public"."poll_votes"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Vote on polls in rooms you're in"
on "public"."poll_votes"
as permissive
for insert
to public
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (((poll_options o
     JOIN polls p ON ((o.poll_id = p.id)))
     JOIN chat_messages m ON ((m.id = p.message_id)))
     JOIN chat_participants cp ON ((cp.room_id = m.room_id)))
  WHERE ((o.id = poll_votes.option_id) AND (cp.user_id = auth.uid()))))));


create policy "Create polls in messages you send"
on "public"."polls"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM chat_messages m
  WHERE ((m.id = polls.message_id) AND (m.sender_id = auth.uid())))));


create policy "See polls in rooms you're in"
on "public"."polls"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (chat_messages m
     JOIN chat_participants p ON ((p.room_id = m.room_id)))
  WHERE ((m.id = polls.message_id) AND (p.user_id = auth.uid())))));


create policy "Delete own like"
on "public"."post_likes"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Insert if can view post"
on "public"."post_likes"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_likes.post_id) AND ((auth.uid() = posts.user_id) OR (posts.is_private = false) OR ((posts.is_private = true) AND (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = posts.user_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Select if can view post"
on "public"."post_likes"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_likes.post_id) AND ((auth.uid() = posts.user_id) OR (posts.is_private = false) OR ((posts.is_private = true) AND (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = posts.user_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Delete own posts"
on "public"."posts"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Update own posts"
on "public"."posts"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can create their own posts"
on "public"."posts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "View own, public, or followed private posts"
on "public"."posts"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (is_private = false) OR ((is_private = true) AND (EXISTS ( SELECT 1
   FROM followers
  WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = posts.user_id) AND (followers.status = 'accepted'::text)))))));


create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Allow insert own typing status"
on "public"."typing_status"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow select for room participants"
on "public"."typing_status"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM chat_participants
  WHERE ((chat_participants.room_id = typing_status.room_id) AND (chat_participants.user_id = auth.uid())))));


create policy "Allow update own typing status"
on "public"."typing_status"
as permissive
for update
to public
using ((user_id = auth.uid()));


CREATE TRIGGER trg_auto_accept_pending AFTER UPDATE ON public.profiles FOR EACH ROW WHEN ((old.is_private IS DISTINCT FROM new.is_private)) EXECUTE FUNCTION auto_accept_pending_followers();

-- Atomic upvote function for event questions
create or replace function upvote_event_question(qid uuid, uid uuid)
returns void as $$
begin
  update event_questions set upvotes = upvotes + 1 where id = qid;
end;
$$ language plpgsql security definer;


