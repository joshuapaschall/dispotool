-- VERIFY SETUP
-- Run this LAST to check everything is working

-- Check that all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('buyers', 'tags', 'groups', 'buyer_groups')
ORDER BY tablename;

-- Check that we have tags
SELECT COUNT(*) as tag_count FROM tags;

-- Check that we have groups  
SELECT COUNT(*) as group_count FROM groups;

-- Check that we have at least one buyer
SELECT COUNT(*) as buyer_count FROM buyers;

-- Show sample tags
SELECT name, color, is_protected FROM tags ORDER BY name LIMIT 10;

-- Show sample groups
SELECT name, description, color FROM groups ORDER BY name LIMIT 5;

-- Show sample buyer
SELECT fname, lname, email, score, status FROM buyers LIMIT 1;
