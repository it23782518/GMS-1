<<<<<<< HEAD

=======
CREATE DATABASE gms;
USE gms;
drop database gms;
-- Gym Management System (GMS) Database Script
-- Created: April 30, 2025

-- =============================================
-- DROP EXISTING TABLES (if they exist)
-- =============================================

DROP TABLE IF EXISTS ticket_assigned_to;
DROP TABLE IF EXISTS ticket_raised_by;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS maintenance_schedule;
DROP TABLE IF EXISTS monthly_maintenance_cost;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS staff;

-- =============================================
-- TABLE CREATION
-- =============================================

-- Staff Table

CREATE TABLE staff (
    NIC VARCHAR(12) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('TRAINER', 'RECEPTIONIST', 'CLEANING_STAFF', 'MANAGER') NOT NULL,
    phone VARCHAR(15),
    start_date DATE NOT NULL,
    shift VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    CONSTRAINT ck_staff_nic CHECK (NIC REGEXP '^[A-Z0-9]{10,12}$')
);

CREATE TABLE member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    purchase_date DATE,
    last_maintenance_date DATE,
    status ENUM('AVAILABLE', 'UNAVAILABLE', 'UNDER_MAINTENANCE', 'OUT_OF_ORDER') NOT NULL DEFAULT 'AVAILABLE',
    warranty_expiry DATE
);

CREATE TABLE monthly_maintenance_cost (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    month DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL
);

CREATE TABLE maintenance_schedule (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_id BIGINT,
    maintenance_type VARCHAR(50) NOT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_description TEXT,
    status ENUM('SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    technician VARCHAR(100),
    maintenance_cost DECIMAL(10, 2),
    CONSTRAINT fk_maintenance_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('OPEN', 'INPROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_raised_by (
    ticket_id BIGINT PRIMARY KEY,
    id BIGINT NULL,
    staff_id VARCHAR(15) NULL,
    CONSTRAINT fk_raised_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_raised_member FOREIGN KEY (id) REFERENCES member(id) ON DELETE SET NULL,
    CONSTRAINT fk_raised_staff FOREIGN KEY (staff_id) REFERENCES staff(NIC) ON DELETE SET NULL,
    CONSTRAINT ck_raised_by_xor CHECK ((id IS NOT NULL AND staff_id IS NULL) OR (id IS NULL AND staff_id IS NOT NULL))
);

CREATE TABLE ticket_assigned_to (
    ticket_id BIGINT PRIMARY KEY,
    staff_id VARCHAR(15) NOT NULL,
    CONSTRAINT fk_assigned_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_staff FOREIGN KEY (staff_id) REFERENCES staff(NIC) ON DELETE CASCADE
);

DESC ticket_assigned_to;
-- =============================================
-- ENUM STATUS VALUES
-- =============================================

-- Equipment status values: AVAILABLE, UNAVAILABLE, UNDER_MAINTENANCE, OUT_OF_ORDER
SELECT 'EQUIPMENT STATUS VALUES' AS 'ENUM Type', 'AVAILABLE' AS Value UNION
SELECT '', 'UNAVAILABLE' UNION
SELECT '', 'UNDER_MAINTENANCE' UNION
SELECT '', 'OUT_OF_ORDER';

-- Maintenance schedule status values: SCHEDULED, INPROGRESS, COMPLETED, CANCELLED
SELECT 'MAINTENANCE STATUS VALUES' AS 'ENUM Type', 'SCHEDULED' AS Value UNION
SELECT '', 'INPROGRESS' UNION
SELECT '', 'COMPLETED' UNION
SELECT '', 'CANCELLED';

-- Ticket status values: OPEN, INPROGRESS, RESOLVED, CLOSED
SELECT 'TICKET STATUS VALUES' AS 'ENUM Type', 'OPEN' AS Value UNION
SELECT '', 'INPROGRESS' UNION
SELECT '', 'RESOLVED' UNION
SELECT '', 'CLOSED';

-- Staff role values: TRAINER, RECEPTIONIST, CLEANING_STAFF, MANAGER
SELECT 'STAFF ROLE VALUES' AS 'ENUM Type', 'TRAINER' AS Value UNION
SELECT '', 'RECEPTIONIST' UNION
SELECT '', 'CLEANING_STAFF' UNION
SELECT '', 'MANAGER';

-- Ticket priority values: LOW, MEDIUM, HIGH
SELECT 'TICKET PRIORITY VALUES' AS 'ENUM Type', 'LOW' AS Value UNION
SELECT '', 'MEDIUM' UNION
SELECT '', 'HIGH';

-- =============================================
-- POPULATE TABLES WITH SAMPLE DATA
-- =============================================


INSERT INTO staff (NIC, name, role, phone, start_date, shift, password) VALUES
('123456789V', 'John Smith', 'TRAINER', '555-1234', '2023-01-15', 'morning', 'password123'),
('123456799V', 'Jane Doe', 'RECEPTIONIST', '555-2345', '2023-02-20', NULL, 'password123'),
('123456889V', 'Mike Johnson', 'CLEANING_STAFF', '555-3456', '2023-03-10', 'evening', 'password123'),
('123456700V', 'Sarah Wilson', 'MANAGER', '555-4567', '2022-11-05', NULL, 'password123'),
('123456709V', 'David Brown', 'TRAINER', '555-5678', '2023-04-15', 'evening', 'password123');

INSERT INTO member (name) VALUES
('Alice Thompson'),
('Bob Garcia'),
('Charlie Kim'),
('Diana Patel'),
('Edward Lee');


INSERT INTO equipment (name, category, purchase_date, last_maintenance_date, status, warranty_expiry) VALUES
('Treadmill T1000', 'Cardio', '2022-05-15', '2023-12-10', 'AVAILABLE', '2025-05-15'),
('Bench Press B500', 'Strength', '2022-06-20', '2023-10-05', 'AVAILABLE', '2025-06-20'),
('Exercise Bike E200', 'Cardio', '2022-07-10', '2023-11-15', 'UNDER_MAINTENANCE', '2025-07-10'),
('Leg Press L300', 'Strength', '2022-08-05', '2023-09-20', 'OUT_OF_ORDER', '2025-08-05'),
('Rowing Machine R100', 'Cardio', '2022-09-25', '2024-01-05', 'AVAILABLE', '2025-09-25'),
('Smith Machine S400', 'Strength', '2022-10-12', '2024-02-15', 'AVAILABLE', '2025-10-12'),
('Elliptical E500', 'Cardio', '2022-11-30', '2024-01-20', 'AVAILABLE', '2025-11-30'),
('Dumbbells Set 5-50kg', 'Free Weights', '2022-12-15', '2024-03-01', 'AVAILABLE', '2025-12-15'),
('Cable Machine C600', 'Strength', '2023-01-18', '2024-02-28', 'UNAVAILABLE', '2026-01-18'),
('Yoga Mats Set', 'Accessories', '2023-02-22', NULL, 'AVAILABLE', '2026-02-22');

INSERT INTO maintenance_schedule (equipment_id, maintenance_type, maintenance_date, maintenance_description, status, technician, maintenance_cost) VALUES
(1, 'Regular Service', '2025-04-15', 'Routine check and lubrication of moving parts', 'SCHEDULED', 'Tech Solutions Inc.', 250.00),
(2, 'Regular Service', '2025-04-20', 'Inspection of weight mechanism and safety features', 'SCHEDULED', 'Fitness Equipment Repairs', 180.00),
(3, 'Repair', '2025-03-25', 'Replacement of pedal assembly and tension system', 'COMPLETED', 'Tech Solutions Inc.', 320.50),
(4, 'Major Repair', '2025-04-10', 'Replacement of hydraulic system', 'INPROGRESS', 'Heavy Duty Repairs', 580.75),
(5, 'Regular Service', '2025-05-05', 'Routine inspection and chain lubrication', 'SCHEDULED', 'Fitness Equipment Repairs', 200.00),
(6, 'Safety Check', '2025-05-12', 'Inspection of cable system and safety mechanisms', 'SCHEDULED', 'Safety First Ltd', 320.00),
(7, 'Regular Service', '2025-05-20', 'Lubrication and tension adjustment', 'SCHEDULED', 'Tech Solutions Inc.', 220.50),
(9, 'Repair', '2025-04-05', 'Cable replacement and pulley system overhaul', 'INPROGRESS', 'Heavy Duty Repairs', 450.25);

INSERT INTO monthly_maintenance_cost (month, total_cost) VALUES
('2025-03-01', 320.50),
('2025-04-01', 1461.00),
('2025-05-01', 740.50);


INSERT INTO tickets (type, description, status, priority, created_at, updated_at) VALUES
('Equipment Issue', 'Treadmill display not working properly', 'OPEN', 'MEDIUM', NOW(), NOW()),
('Facility Issue', 'Water fountain leaking in main area', 'INPROGRESS', 'HIGH', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 2 DAY),
('Member Complaint', 'Locker room cleanliness issue', 'OPEN', 'LOW', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),
('Equipment Issue', 'Weight plate missing from rack', 'RESOLVED', 'MEDIUM', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 1 DAY),
('Facility Issue', 'Air conditioning not working in spin class room', 'INPROGRESS', 'HIGH', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY),
('Equipment Issue', 'Cable machine wire frayed', 'OPEN', 'HIGH', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY);

INSERT INTO ticket_raised_by (ticket_id, id, staff_id) VALUES
(1, 1, NULL), -- Raised by Member
(2, NULL, '123456709V'), -- Raised by Staff
(3, 3, NULL),
(4, NULL, '123456700V'),
(5, 2, NULL),
(6, NULL, '123456889V');

INSERT INTO ticket_assigned_to (ticket_id, staff_id) VALUES
(2, '123456789V'),
(4, '123456889V'),
(5, '123456709V');

-- =============================================
-- SAMPLE QUERIES
-- =============================================

-- List all equipment that needs maintenance (either under maintenance or out of order)
SELECT id, name, category, status, last_maintenance_date
FROM equipment
WHERE status IN ('UNDER_MAINTENANCE', 'OUT_OF_ORDER');

-- Show all upcoming scheduled maintenance within the next 30 days
SELECT ms.schedule_id, name AS equipment_name, ms.maintenance_type, ms.maintenance_date, ms.technician
FROM maintenance_schedule ms
JOIN equipment e ON ms.equipment_id = e.id
WHERE ms.status = 'SCHEDULED' AND ms.maintenance_date BETWEEN CURDATE() AND (CURDATE() + INTERVAL 30 DAY);

-- Count tickets by status is OPEN
SELECT status, COUNT(*) as ticket_count
FROM tickets WHERE status = 'OPEN' ;

-- Calculate total maintenance costs by month for the last year
SELECT DATE_FORMAT(month, '%M %Y') as month_name, total_cost
FROM monthly_maintenance_cost
WHERE month >= (CURDATE() - INTERVAL 1 YEAR) ORDER BY month;

-- List all tickets assigned to a specific staff member
SELECT t.id, t.type, t.description, t.status, t.priority, t.created_at
FROM tickets t
JOIN ticket_assigned_to tat ON t.id = tat.ticket_id
WHERE tat.staff_id = '123456789V';


-- Query 10: List equipment and their latest maintenance schedule
SELECT e.id, e.name, e.category, 
       ms.maintenance_type, ms.maintenance_date, ms.status as maintenance_status
FROM equipment e
LEFT JOIN (
    SELECT equipment_id, maintenance_type, maintenance_date, status
    FROM maintenance_schedule ms1
    WHERE maintenance_date = (
        SELECT MAX(maintenance_date)
        FROM maintenance_schedule ms2
        WHERE ms2.equipment_id = ms1.equipment_id
    )
) ms ON e.id = ms.equipment_id
WHERE e.deleted = false
ORDER BY e.id;

-- Query 14: Get a summary of maintenance costs by equipment category
SELECT e.category, COUNT(ms.schedule_id) as maintenance_count, 
       SUM(ms.maintenance_cost) as total_cost,
       AVG(ms.maintenance_cost) as avg_cost
FROM equipment e
JOIN maintenance_schedule ms ON e.id = ms.equipment_id
WHERE ms.maintenance_cost IS NOT NULL
GROUP BY e.category
ORDER BY total_cost DESC;

-- Query 15: Find tickets that have been open for more than 7 days
SELECT t.id, t.type, t.description, t.priority, 
       t.created_at, 
       TIMESTAMPDIFF(DAY, t.created_at, NOW()) as days_open
FROM tickets t
WHERE t.status = 'OPEN'
AND t.created_at < (NOW() - INTERVAL 7 DAY)
ORDER BY days_open DESC;
>>>>>>> q
