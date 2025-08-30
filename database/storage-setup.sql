-- Storage buckets for file uploads
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('project-covers', 'project-covers', true),
('proposals', 'proposals', true);

-- Set up storage policies for project covers
CREATE POLICY "Project covers are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'project-covers');

CREATE POLICY "Authenticated users can upload project covers" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own project covers" ON storage.objects
FOR UPDATE USING (bucket_id = 'project-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project covers" ON storage.objects
FOR DELETE USING (bucket_id = 'project-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for proposals
CREATE POLICY "Proposals are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'proposals');

CREATE POLICY "Authenticated users can upload proposals" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'proposals' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own proposals" ON storage.objects
FOR UPDATE USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proposals" ON storage.objects
FOR DELETE USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);
