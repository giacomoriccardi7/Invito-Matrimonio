-- Create storage buckets required by the application
-- Public buckets so that getPublicUrl works for frontend display
select storage.create_bucket('memories', public := true);
select storage.create_bucket('thumbnails', public := true);