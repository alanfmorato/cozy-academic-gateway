
-- Create the public storage bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('public', 'Public Storage Bucket', TRUE)
    ON CONFLICT (id) DO NOTHING;
    
    -- Set RLS policy for the public bucket to allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES 
    ('Public Read Policy', 
     '(bucket_id = ''public''::text)',
     'public')
    ON CONFLICT (name, definition, bucket_id) DO NOTHING;
END
$$;
