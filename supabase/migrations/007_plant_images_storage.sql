-- Create plant-images storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-images',
  'plant-images',
  true,  -- Public bucket so images can be displayed without signed URLs
  3145728, -- 3MB limit
  array['image/jpeg', 'image/png', 'image/webp']
);

-- RLS Policies for plant-images bucket

-- Users can upload to their own folder (folder name matches their user ID)
create policy "Users can upload own plant images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'plant-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view images (public bucket for display in app)
create policy "Anyone can view plant images"
on storage.objects for select
to public
using (bucket_id = 'plant-images');

-- Users can update their own images
create policy "Users can update own plant images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'plant-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own images
create policy "Users can delete own plant images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'plant-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
