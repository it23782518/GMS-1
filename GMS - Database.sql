CREATE DATABASE gms;
USE gms;
show tables;
drop table tickets;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE equipment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    purchase_date DATE,
    last_maintenance_date DATE,
    status ENUM("AVAILABLE","UNAVAILABLE","UNDER_MAINTENANCE","OUT_OF_ORDER") DEFAULT 'Available',
    warranty_expiry DATE
);

select * from equipment;

CREATE TABLE maintenance_schedule (
    schedule_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    equipment_id BIGINT NULL,
    maintenance_type VARCHAR(255) NOT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_description TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELED', 'INPROGRESS') DEFAULT 'SCHEDULED',  -- Fixed DEFAULT value
    technician VARCHAR(255),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL ON UPDATE CASCADE
);

SELECT * FROM maintenance_schedule;

CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

select * from tickets;

CREATE TABLE ticket_raised_by (
    ticket_id BIGINT PRIMARY KEY,
    user_id BIGINT DEFAULT NULL,
    staff_id BIGINT DEFAULT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

select * from ticket_raised_by;

CREATE TABLE ticket_assigned_to (
    ticket_id BIGINT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

select * from ticket_assigned_to;

ALTER TABLE maintenance_schedule 
	ADD COLUMN maintenance_cost INT;
ALTER TABLE maintenance_schedule 
	MODIFY COLUMN maintenance_cost DECIMAL(10, 2) DEFAULT 0.00;
       
CREATE TABLE monthly_maintenance_cost (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    month DATE NOT NULL,
    total_cost DOUBLE NOT NULL
);

drop table tickets;
SELECT * FROM monthly_maintenance_cost;

INSERT INTO users (name) VALUES ('kami');

ALTER TABLE ticket_assigned_to drop column  version;