const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const sharp = require('sharp');

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// console.log('[Supabase Storage] Supabase URL:', supabaseUrl);
// console.log('[Supabase Storage] Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in server/.env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ensure required buckets exist (uses service role if available)
async function ensureBucket(name) {
  try {
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error) {
      // Ignore if bucket already exists (409)
      if (error.status === 409 || error.statusCode === '409') {
        return;
      }
      console.warn(`[Supabase Storage] Error creating bucket '${name}':`, error);
    }
  } catch (err) {
    console.warn(`[Supabase Storage] Exception creating bucket '${name}':`, err);
  }
}

const uploadMemory = async (fileBuffer, fileName, fileType, uploaderName, dedication) => {

  try {
    // Ensure buckets exist before attempting upload
    await ensureBucket('memories');
    await ensureBucket('thumbnails');

    console.log('[Supabase Storage] Attempting to upload file to storage...');
    // Upload original file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memories')
      .upload(fileName, fileBuffer, { contentType: fileType });

    if (uploadError) {
      console.error('[Supabase Storage] Error uploading file to storage:', uploadError);
      throw uploadError;
    }
    console.log('[Supabase Storage] File uploaded to storage successfully:', uploadData);

    // Get public URL of the uploaded original file
    const { data: publicUrlData } = supabase.storage
      .from('memories')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    let thumbnailUrl = null;

    // Generate and upload thumbnail if it's an image
    if (fileType.startsWith('image')) {
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(200)
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailFileName = `thumbnail-${fileName}`;
      console.log('[Supabase Storage] Attempting to upload thumbnail to storage...');
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
        .from('thumbnails') // Assuming a 'thumbnails' bucket exists
        .upload(thumbnailFileName, thumbnailBuffer, { contentType: 'image/jpeg' });

      if (thumbnailUploadError) {
        console.warn('[Supabase Storage] Error uploading thumbnail:', thumbnailUploadError);
        // Continue without thumbnail if upload fails
      } else {
        console.log('[Supabase Storage] Thumbnail uploaded to storage successfully:', thumbnailUploadData);
        const { data: thumbnailPublicUrlData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(thumbnailFileName);
        thumbnailUrl = thumbnailPublicUrlData.publicUrl;
      }
    }

    // Insert metadata into the 'memories' table
    // NOTE: Ensure your 'memories' table has a 'thumbnail_path' column.

    console.log('[Supabase Storage] Attempting to insert memory metadata into database...');
    const { data: memoryData, error: insertError } = await supabase
      .from('memories')
      .insert(
        { file_path: publicUrl, file_type: fileType, uploader_name: uploaderName, dedication: dedication, thumbnail_path: thumbnailUrl }
      )
      .select(); // Use .select() to return the inserted data

    if (insertError) {
      console.error('[Supabase Storage] Error inserting memory metadata into database:', insertError);
      throw insertError;
    }
    console.log('[Supabase Storage] Memory metadata inserted into database successfully:', memoryData);

    return { data: uploadData, memoryData: memoryData[0] }; // Return the first element of memoryData array
  } catch (error) {
    console.error('Error uploading memory:', error);
    throw error;
  }
};

const getMemories = async () => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

const getApprovedMemories = async () => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching approved memories:', error);
    throw error;
  }
};

const updateMemoryApprovalStatus = async (id, isApproved) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .update({ is_approved: isApproved, moderation_status: isApproved ? 'approved' : 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data; // return the updated memory row
  } catch (error) {
    console.error('Error updating memory approval status:', error);
    throw error;
  }
};

const logModerationAction = async (memoryId, action, actor) => {
  try {
    const { data, error } = await supabase
      .from('moderation_logs')
      .insert({ memory_id: memoryId, action, actor })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging moderation action:', error);
    throw error;
  }
};

const getPendingMemories = async () => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .or('moderation_status.is.null,moderation_status.eq.pending')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching pending memories:', error);
    throw error;
  }
};

const getModerationHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching moderation history:', error);
    throw error;
  }
};

const getModerationStats = async () => {
  try {
    const { count: approvedCount, error: approvedErr } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);
    if (approvedErr) throw approvedErr;

    const { count: rejectedCount, error: rejectedErr } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'rejected');
    if (rejectedErr) throw rejectedErr;

    const { count: pendingCount, error: pendingErr } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)
      .or('moderation_status.is.null,moderation_status.eq.pending');
    if (pendingErr) throw pendingErr;

    return { approved: approvedCount || 0, rejected: rejectedCount || 0, pending: pendingCount || 0 };
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    throw error;
  }
};

module.exports = { uploadMemory, getMemories, getApprovedMemories, updateMemoryApprovalStatus, logModerationAction, getPendingMemories, getModerationHistory, getModerationStats };