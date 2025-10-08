create table "public"."memories" (
    "id" uuid not null default gen_random_uuid(),
    "file_path" text not null,
    "file_type" text not null,
    "uploader_name" text,
    "dedication" text,
    "created_at" timestamp with time zone default now(),
    "is_approved" boolean default false,
    "thumbnail_path" text
);


alter table "public"."memories" enable row level security;

create table "public"."rsvp_responses" (
    "id" uuid not null default gen_random_uuid(),
    "guest_name" text not null,
    "will_attend" boolean not null,
    "dietary_restrictions" text default ''::text,
    "song_request" text default ''::text,
    "message" text default ''::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."rsvp_responses" enable row level security;

CREATE UNIQUE INDEX memories_pkey ON public.memories USING btree (id);

CREATE UNIQUE INDEX rsvp_responses_pkey ON public.rsvp_responses USING btree (id);

alter table "public"."memories" add constraint "memories_pkey" PRIMARY KEY using index "memories_pkey";

alter table "public"."rsvp_responses" add constraint "rsvp_responses_pkey" PRIMARY KEY using index "rsvp_responses_pkey";

create policy "Anyone can upload memories"
on "public"."memories"
as permissive
for insert
to anon
with check (true);


create policy "Authenticated users can manage memories"
on "public"."memories"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Anyone can submit RSVP"
on "public"."rsvp_responses"
as permissive
for insert
to anon
with check (true);


create policy "Authenticated users can view all RSVPs"
on "public"."rsvp_responses"
as permissive
for select
to authenticated
using (true);




  create policy "Allow anon upload to thumbnails 16v3daf_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'thumbnails'::text));



  create policy "Allow anon upload to thumbnails"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'thumbnails'::text));



  create policy "Allow anon view thumbnails 16v3daf_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'thumbnails'::text));



  create policy "Allow anon view thumbnails"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'thumbnails'::text));



  create policy "Allow anonymous uploads to memories 1ohtrhb_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'memories'::text));



  create policy "Allow public read access 16v3daf_0"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'thumbnails'::text));



