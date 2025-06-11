drop policy "View if passenger or driver" on "public"."carpool_passengers";

drop policy "Access own car info" on "public"."cars";

drop policy "Check items in checklists you can see" on "public"."checklist_checks";

drop policy "See own checklist checks" on "public"."checklist_checks";

drop policy "Update own checklist checks" on "public"."checklist_checks";

drop policy "Allow anyone to view event images" on "public"."event_images";

drop policy "Allow event creator to upload images" on "public"."event_images";

drop policy "Creator can manage invites" on "public"."event_invites";

drop policy "Users can view their own invites" on "public"."event_invites";

drop policy "Ask if accepted guest or event is public" on "public"."event_questions";

drop policy "Select if follower or following" on "public"."followers";

drop policy "Driver confirms passenger" on "public"."carpool_passengers";

drop policy "Request join carpool" on "public"."carpool_passengers";

drop policy "Update own passenger status" on "public"."carpool_passengers";

drop policy "Create own request" on "public"."carpool_requests";

drop policy "Delete own request" on "public"."carpool_requests";

drop policy "Update/delete own request" on "public"."carpool_requests";

drop policy "View own or public or follower's request" on "public"."carpool_requests";

drop policy "Create your own carpool" on "public"."carpools";

drop policy "Delete own carpool" on "public"."carpools";

drop policy "Update own carpool" on "public"."carpools";

drop policy "View public or private if follower" on "public"."carpools";

drop policy "Delete own car" on "public"."cars";

drop policy "Insert own car" on "public"."cars";

drop policy "Update own car" on "public"."cars";

drop policy "Create checklist items in own checklist" on "public"."checklist_items";

drop policy "See checklist items if in checklist's room" on "public"."checklist_items";

drop policy "Answer if allowed" on "public"."event_answers";

drop policy "View if can access question" on "public"."event_answers";

drop policy "View if can access event" on "public"."event_questions";

drop policy "View if owner or accepted guest (or public)" on "public"."events";

revoke delete on table "public"."checklist_checks" from "anon";

revoke insert on table "public"."checklist_checks" from "anon";

revoke references on table "public"."checklist_checks" from "anon";

revoke select on table "public"."checklist_checks" from "anon";

revoke trigger on table "public"."checklist_checks" from "anon";

revoke truncate on table "public"."checklist_checks" from "anon";

revoke update on table "public"."checklist_checks" from "anon";

revoke delete on table "public"."checklist_checks" from "authenticated";

revoke insert on table "public"."checklist_checks" from "authenticated";

revoke references on table "public"."checklist_checks" from "authenticated";

revoke select on table "public"."checklist_checks" from "authenticated";

revoke trigger on table "public"."checklist_checks" from "authenticated";

revoke truncate on table "public"."checklist_checks" from "authenticated";

revoke update on table "public"."checklist_checks" from "authenticated";

revoke delete on table "public"."checklist_checks" from "service_role";

revoke insert on table "public"."checklist_checks" from "service_role";

revoke references on table "public"."checklist_checks" from "service_role";

revoke select on table "public"."checklist_checks" from "service_role";

revoke trigger on table "public"."checklist_checks" from "service_role";

revoke truncate on table "public"."checklist_checks" from "service_role";

revoke update on table "public"."checklist_checks" from "service_role";

revoke delete on table "public"."event_invites" from "anon";

revoke insert on table "public"."event_invites" from "anon";

revoke references on table "public"."event_invites" from "anon";

revoke select on table "public"."event_invites" from "anon";

revoke trigger on table "public"."event_invites" from "anon";

revoke truncate on table "public"."event_invites" from "anon";

revoke update on table "public"."event_invites" from "anon";

revoke delete on table "public"."event_invites" from "authenticated";

revoke insert on table "public"."event_invites" from "authenticated";

revoke references on table "public"."event_invites" from "authenticated";

revoke select on table "public"."event_invites" from "authenticated";

revoke trigger on table "public"."event_invites" from "authenticated";

revoke truncate on table "public"."event_invites" from "authenticated";

revoke update on table "public"."event_invites" from "authenticated";

revoke delete on table "public"."event_invites" from "service_role";

revoke insert on table "public"."event_invites" from "service_role";

revoke references on table "public"."event_invites" from "service_role";

revoke select on table "public"."event_invites" from "service_role";

revoke trigger on table "public"."event_invites" from "service_role";

revoke truncate on table "public"."event_invites" from "service_role";

revoke update on table "public"."event_invites" from "service_role";

alter table "public"."checklist_checks" drop constraint "checklist_checks_item_id_fkey";

alter table "public"."checklist_checks" drop constraint "checklist_checks_item_id_user_id_key";

alter table "public"."checklist_checks" drop constraint "checklist_checks_user_id_fkey";

alter table "public"."event_invites" drop constraint "event_invites_event_id_fkey";

alter table "public"."event_invites" drop constraint "event_invites_event_id_user_id_key";

alter table "public"."event_invites" drop constraint "event_invites_status_check";

alter table "public"."event_invites" drop constraint "event_invites_user_id_fkey";

alter table "public"."event_participants" drop constraint "event_participants_status_check";

alter table "public"."chat_messages" drop constraint "chat_messages_type_check";

alter table "public"."checklist_checks" drop constraint "checklist_checks_pkey";

alter table "public"."event_invites" drop constraint "event_invites_pkey";

drop index if exists "public"."checklist_checks_item_id_user_id_key";

drop index if exists "public"."checklist_checks_pkey";

drop index if exists "public"."event_invites_event_id_user_id_key";

drop index if exists "public"."event_invites_pkey";

drop table "public"."checklist_checks";

drop table "public"."event_invites";

create table "public"."event_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "inviter_id" uuid not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."event_invitations" enable row level security;

create table "public"."event_question_upvotes" (
    "id" uuid not null default gen_random_uuid(),
    "question_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."event_question_upvotes" enable row level security;

alter table "public"."carpools" add column "chat_room_id" uuid;

alter table "public"."carpools" add column "title" text;

alter table "public"."carpools" alter column "departure_location" set data type jsonb using "departure_location"::jsonb;

alter table "public"."carpools" alter column "destination_location" set data type jsonb using "destination_location"::jsonb;

alter table "public"."cars" drop column "brand";

alter table "public"."cars" add column "image" text;

alter table "public"."cars" add column "make" text;

alter table "public"."chat_messages" add column "event_id" uuid;

alter table "public"."chat_messages" add column "invitation_id" uuid;

alter table "public"."checklist_items" add column "checked" boolean default false;

alter table "public"."checklist_items" add column "checked_by" uuid;

alter table "public"."notifications" add column "data" jsonb;

CREATE UNIQUE INDEX event_invitations_event_id_user_id_key ON public.event_invitations USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_invitations_pkey ON public.event_invitations USING btree (id);

CREATE UNIQUE INDEX event_question_upvotes_pkey ON public.event_question_upvotes USING btree (question_id, user_id);

CREATE INDEX idx_chat_messages_room_id_created_at ON public.chat_messages USING btree (room_id, created_at);

CREATE INDEX idx_chat_participants_room_id_user_id ON public.chat_participants USING btree (room_id, user_id);

alter table "public"."event_invitations" add constraint "event_invitations_pkey" PRIMARY KEY using index "event_invitations_pkey";

alter table "public"."event_question_upvotes" add constraint "event_question_upvotes_pkey" PRIMARY KEY using index "event_question_upvotes_pkey";

alter table "public"."carpools" add constraint "carpools_chat_room_id_fkey" FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE SET NULL not valid;

alter table "public"."carpools" validate constraint "carpools_chat_room_id_fkey";

alter table "public"."event_invitations" add constraint "event_invitations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_invitations" validate constraint "event_invitations_event_id_fkey";

alter table "public"."event_invitations" add constraint "event_invitations_event_id_user_id_key" UNIQUE using index "event_invitations_event_id_user_id_key";

alter table "public"."event_invitations" add constraint "event_invitations_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."event_invitations" validate constraint "event_invitations_inviter_id_fkey";

alter table "public"."event_invitations" add constraint "event_invitations_inviter_id_fkey1" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."event_invitations" validate constraint "event_invitations_inviter_id_fkey1";

alter table "public"."event_invitations" add constraint "event_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]))) not valid;

alter table "public"."event_invitations" validate constraint "event_invitations_status_check";

alter table "public"."event_invitations" add constraint "event_invitations_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."event_invitations" validate constraint "event_invitations_user_id_fkey1";

alter table "public"."event_question_upvotes" add constraint "event_question_upvotes_question_id_fkey" FOREIGN KEY (question_id) REFERENCES event_questions(id) ON DELETE CASCADE not valid;

alter table "public"."event_question_upvotes" validate constraint "event_question_upvotes_question_id_fkey";

alter table "public"."event_question_upvotes" add constraint "event_question_upvotes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."event_question_upvotes" validate constraint "event_question_upvotes_user_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_type_check" CHECK ((type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'voice'::text, 'location'::text, 'checklist'::text, 'poll'::text, 'post'::text, 'marketplace'::text, 'carpool'::text, 'audio'::text, 'document'::text, 'invitation'::text]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_participant_on_accept()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only add if status is changing to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Only insert if not already a participant
    IF NOT EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_id = NEW.event_id AND user_id = NEW.user_id
    ) THEN
      INSERT INTO event_participants (event_id, user_id, status, created_at)
      VALUES (NEW.event_id, NEW.user_id, 'accepted', NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upvote_event_question(qid uuid, uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_exists boolean;
    v_result jsonb;
begin
    -- Check if upvote exists
    select exists (
        select 1 from event_question_upvotes 
        where question_id = qid and user_id = uid
    ) into v_exists;

    if v_exists then
        -- Remove upvote
        delete from event_question_upvotes 
        where question_id = qid and user_id = uid;
        
        -- Decrement upvote count
        update event_questions 
        set upvotes = upvotes - 1 
        where id = qid;
        
        v_result := jsonb_build_object(
            'action', 'removed',
            'upvoted', false
        );
    else
        -- Add upvote
        insert into event_question_upvotes (question_id, user_id)
        values (qid, uid);
        
        -- Increment upvote count
        update event_questions 
        set upvotes = upvotes + 1 
        where id = qid;
        
        v_result := jsonb_build_object(
            'action', 'added',
            'upvoted', true
        );
    end if;

    return v_result;
end;
$function$
;

grant delete on table "public"."event_invitations" to "anon";

grant insert on table "public"."event_invitations" to "anon";

grant references on table "public"."event_invitations" to "anon";

grant select on table "public"."event_invitations" to "anon";

grant trigger on table "public"."event_invitations" to "anon";

grant truncate on table "public"."event_invitations" to "anon";

grant update on table "public"."event_invitations" to "anon";

grant delete on table "public"."event_invitations" to "authenticated";

grant insert on table "public"."event_invitations" to "authenticated";

grant references on table "public"."event_invitations" to "authenticated";

grant select on table "public"."event_invitations" to "authenticated";

grant trigger on table "public"."event_invitations" to "authenticated";

grant truncate on table "public"."event_invitations" to "authenticated";

grant update on table "public"."event_invitations" to "authenticated";

grant delete on table "public"."event_invitations" to "service_role";

grant insert on table "public"."event_invitations" to "service_role";

grant references on table "public"."event_invitations" to "service_role";

grant select on table "public"."event_invitations" to "service_role";

grant trigger on table "public"."event_invitations" to "service_role";

grant truncate on table "public"."event_invitations" to "service_role";

grant update on table "public"."event_invitations" to "service_role";

grant delete on table "public"."event_question_upvotes" to "anon";

grant insert on table "public"."event_question_upvotes" to "anon";

grant references on table "public"."event_question_upvotes" to "anon";

grant select on table "public"."event_question_upvotes" to "anon";

grant trigger on table "public"."event_question_upvotes" to "anon";

grant truncate on table "public"."event_question_upvotes" to "anon";

grant update on table "public"."event_question_upvotes" to "anon";

grant delete on table "public"."event_question_upvotes" to "authenticated";

grant insert on table "public"."event_question_upvotes" to "authenticated";

grant references on table "public"."event_question_upvotes" to "authenticated";

grant select on table "public"."event_question_upvotes" to "authenticated";

grant trigger on table "public"."event_question_upvotes" to "authenticated";

grant truncate on table "public"."event_question_upvotes" to "authenticated";

grant update on table "public"."event_question_upvotes" to "authenticated";

grant delete on table "public"."event_question_upvotes" to "service_role";

grant insert on table "public"."event_question_upvotes" to "service_role";

grant references on table "public"."event_question_upvotes" to "service_role";

grant select on table "public"."event_question_upvotes" to "service_role";

grant trigger on table "public"."event_question_upvotes" to "service_role";

grant truncate on table "public"."event_question_upvotes" to "service_role";

grant update on table "public"."event_question_upvotes" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."carpool_passengers"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for all users"
on "public"."carpool_passengers"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for all users"
on "public"."cars"
as permissive
for select
to authenticated
using (true);


create policy "Update checklist items if in checklist's room"
on "public"."checklist_items"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
     JOIN chat_participants p ON ((p.room_id = m.room_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (p.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM ((checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
     JOIN chat_participants p ON ((p.room_id = m.room_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (p.user_id = auth.uid())))));


create policy "Enable read access for all users"
on "public"."event_images"
as permissive
for select
to authenticated
using (true);


create policy "Users can insert images if they are event owner or allowed part"
on "public"."event_images"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_images.event_id) AND (e.creator_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (events e
     LEFT JOIN event_participants ep ON (((ep.event_id = e.id) AND (ep.user_id = auth.uid()))))
  WHERE ((e.id = ep.event_id) AND (e.allow_guests_to_post = true) AND (ep.id IS NOT NULL))))));


create policy "Event creators can delete invitations"
on "public"."event_invitations"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_invitations.event_id) AND (events.creator_id = auth.uid())))));


create policy "Event creators can view invitations"
on "public"."event_invitations"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_invitations.event_id) AND (events.creator_id = auth.uid())))));


create policy "Users can create invitations for their events"
on "public"."event_invitations"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_invitations.event_id) AND (events.creator_id = auth.uid())))));


create policy "Users can update their own invitation status"
on "public"."event_invitations"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "Users can view their own invitations"
on "public"."event_invitations"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Enable insert for authenticated users only"
on "public"."event_participants"
as permissive
for insert
to authenticated
with check (true);


create policy "Remove upvotes"
on "public"."event_question_upvotes"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Upvote questions"
on "public"."event_question_upvotes"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "View upvotes"
on "public"."event_question_upvotes"
as permissive
for select
to authenticated
using (true);


create policy "Anyone can upvote"
on "public"."event_questions"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."event_questions"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."followers"
as permissive
for select
to public
using (true);


create policy "Driver confirms passenger"
on "public"."carpool_passengers"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM carpools
  WHERE ((carpools.id = carpool_passengers.carpool_id) AND (carpools.driver_id = auth.uid())))));


create policy "Request join carpool"
on "public"."carpool_passengers"
as permissive
for insert
to authenticated
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM carpools
  WHERE ((carpools.id = carpool_passengers.carpool_id) AND ((carpools.is_private = false) OR (EXISTS ( SELECT 1
           FROM followers
          WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpools.driver_id) AND (followers.status = 'accepted'::text))))))))));


create policy "Update own passenger status"
on "public"."carpool_passengers"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Create own request"
on "public"."carpool_requests"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Delete own request"
on "public"."carpool_requests"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Update/delete own request"
on "public"."carpool_requests"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "View own or public or follower's request"
on "public"."carpool_requests"
as permissive
for select
to authenticated
using (((auth.uid() = user_id) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM followers
  WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpool_requests.user_id) AND (followers.status = 'accepted'::text))))));


create policy "Create your own carpool"
on "public"."carpools"
as permissive
for insert
to authenticated
with check ((auth.uid() = driver_id));


create policy "Delete own carpool"
on "public"."carpools"
as permissive
for delete
to authenticated
using ((auth.uid() = driver_id));


create policy "Update own carpool"
on "public"."carpools"
as permissive
for update
to authenticated
using ((auth.uid() = driver_id))
with check ((auth.uid() = driver_id));


create policy "View public or private if follower"
on "public"."carpools"
as permissive
for select
to authenticated
using (((driver_id = auth.uid()) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM followers
  WHERE ((followers.follower_id = auth.uid()) AND (followers.following_id = carpools.driver_id) AND (followers.status = 'accepted'::text))))));


create policy "Delete own car"
on "public"."cars"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Insert own car"
on "public"."cars"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Update own car"
on "public"."cars"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Create checklist items in own checklist"
on "public"."checklist_items"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM (checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (m.sender_id = auth.uid())))));


create policy "See checklist items if in checklist's room"
on "public"."checklist_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ((checklists c
     JOIN chat_messages m ON ((m.id = c.message_id)))
     JOIN chat_participants cp ON ((cp.room_id = m.room_id)))
  WHERE ((c.id = checklist_items.checklist_id) AND (cp.user_id = auth.uid())))));


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
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'going'::text)))))))));


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
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'going'::text)))))))));


create policy "View if can access event"
on "public"."event_questions"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_questions.event_id) AND ((events.is_private = false) OR (events.creator_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM event_participants
          WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'going'::text)))))))));


create policy "View if owner or accepted guest (or public)"
on "public"."events"
as permissive
for select
to authenticated
using (((auth.uid() = creator_id) OR (is_private = false) OR (EXISTS ( SELECT 1
   FROM event_participants
  WHERE ((event_participants.event_id = events.id) AND (event_participants.user_id = auth.uid()) AND (event_participants.status = 'going'::text))))));


CREATE TRIGGER trg_add_participant_on_accept AFTER UPDATE ON public.event_invitations FOR EACH ROW EXECUTE FUNCTION add_participant_on_accept();

CREATE TRIGGER update_event_invitations_updated_at BEFORE UPDATE ON public.event_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


