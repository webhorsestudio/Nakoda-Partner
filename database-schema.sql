-- Create admin_users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    access_level VARCHAR(100) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    permissions TEXT[] DEFAULT '{}',
    avatar VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- Insert sample data
INSERT INTO admin_users (name, email, phone, role, status, access_level, last_login, permissions, avatar) VALUES
('John Admin', 'john.admin@nakoda.com', '+91 9876543210', 'Super Admin', 'Active', 'Full Access', '2024-01-15 10:30:00+00', ARRAY['Full Access', 'User Management', 'System Settings', 'Partner Management'], 'JA'),
('Sarah Manager', 'sarah.manager@nakoda.com', '+91 9876543211', 'Admin', 'Active', 'Limited Access', '2024-01-15 09:15:00+00', ARRAY['User Management', 'Partner Management', 'Order Management'], 'SM'),
('Mike Support', 'mike.support@nakoda.com', '+91 9876543212', 'Support Admin', 'Active', 'Support Access', '2024-01-15 08:45:00+00', ARRAY['Order Management', 'Customer Support', 'Basic Reports'], 'MS'),
('Lisa Analyst', 'lisa.analyst@nakoda.com', '+91 9876543213', 'Analytics Admin', 'Active', 'Analytics Access', '2024-01-14 11:20:00+00', ARRAY['Analytics', 'Reports', 'Data Access'], 'LA'),
('David Tech', 'david.tech@nakoda.com', '+91 9876543214', 'Technical Admin', 'Inactive', 'Technical Access', '2024-01-10 15:30:00+00', ARRAY['System Settings', 'API Management', 'Technical Support'], 'DT');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
