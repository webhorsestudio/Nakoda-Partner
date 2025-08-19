-- Check Permissions and Roles in Database
-- This script helps verify that Partner Management permissions are properly set up

-- 1. Check admin_users table structure
SELECT 'Admin Users Table Structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- 2. Check current admin users and their permissions
SELECT 'Current Admin Users and Permissions:' as info;
SELECT 
    id,
    name,
    email,
    role,
    status,
    access_level,
    permissions,
    created_at
FROM admin_users 
ORDER BY id;

-- 3. Check specific permissions for Partner Management
SELECT 'Users with Partner Management Permission:' as info;
SELECT 
    id,
    name,
    email,
    role,
    access_level,
    permissions
FROM admin_users 
WHERE 'Partner Management' = ANY(permissions)
   OR role = 'Super Admin'
   OR access_level = 'Full Access'
ORDER BY id;

-- 4. Check roles and their permission patterns
SELECT 'Role Permission Analysis:' as info;
SELECT 
    role,
    access_level,
    COUNT(*) as user_count,
    array_agg(DISTINCT unnest(permissions)) as all_permissions
FROM admin_users 
GROUP BY role, access_level
ORDER BY role;

-- 5. Check if there are any users without Partner Management access
SELECT 'Users WITHOUT Partner Management Access:' as info;
SELECT 
    id,
    name,
    email,
    role,
    access_level,
    permissions
FROM admin_users 
WHERE NOT ('Partner Management' = ANY(permissions))
   AND role != 'Super Admin'
   AND access_level != 'Full Access'
ORDER BY id;

-- 6. Verify permissions array structure
SELECT 'Permissions Array Validation:' as info;
SELECT 
    id,
    name,
    permissions,
    array_length(permissions, 1) as permission_count,
    CASE 
        WHEN permissions IS NULL THEN 'NULL permissions'
        WHEN array_length(permissions, 1) = 0 THEN 'Empty permissions'
        ELSE 'Valid permissions'
    END as permission_status
FROM admin_users
ORDER BY id;
