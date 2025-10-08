-- Create storage buckets required by the application (public)
select storage.create_bucket('memories', true);
select storage.create_bucket('thumbnails', true);