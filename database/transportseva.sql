-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 09, 2026 at 04:28 PM
-- Server version: 10.11.16-MariaDB-log
-- PHP Version: 8.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transportseva`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_tokens`
--

CREATE TABLE `access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_uuid` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `access_tokens`
--

INSERT INTO `access_tokens` (`id`, `user_uuid`, `token`, `expires_at`, `revoked`, `created_at`, `updated_at`) VALUES
(1, '349cc365-e531-41bd-9dd6-09e26a770d1e', '30973e1ea2c8402252e140ed7f5fe3de8b41edb57ec3d2315aac8b27f7e20e46', '2026-08-05 10:48:25', 0, '2026-08-05 10:33:25', '2026-08-05 10:33:25'),
(2, 'db93dc4a-b647-4eba-8166-68b5a1618ebc', '6ae9589a194c44d535157263a63bf71b83052f1e3edd009f2afb74087db58092', '2026-08-05 10:51:36', 0, '2026-08-05 10:36:36', '2026-08-05 10:36:36'),
(3, '349cc365-e531-41bd-9dd6-09e26a770d1e', 'df4f37440c85fd6a670fa407c9efd26a3499b88abe286a238c06592c59d9d036', '2026-08-05 10:51:53', 0, '2026-08-05 10:36:53', '2026-08-05 10:36:53'),
(4, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '95dab1a845019b168b1055e2cee2bf450f0f29701da9f0ad065f2ff4a2d64b50', '2026-08-05 11:05:11', 0, '2026-08-05 10:50:11', '2026-08-05 10:50:11'),
(5, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '5457ec4b6accb5d48bebe34dbb81567c4bf7f821b326afab654ebe77801150a6', '2026-08-05 11:05:54', 0, '2026-08-05 10:50:54', '2026-08-05 10:50:54'),
(6, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '96a33c43fb50e0cc477e45ee4a877c4b8eb16d6d766859d33c7023e68f52cae4', '2026-08-05 11:06:22', 0, '2026-08-05 10:51:22', '2026-08-05 10:51:22'),
(7, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '764d45a8094ff7b26cdb1ff347494cde8cc54efcd3f784c86a614719498bb979', '2026-08-05 11:11:19', 0, '2026-08-05 10:56:19', '2026-08-05 10:56:19'),
(8, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '91a7c23b8c9e156dfdd13a5211ae417e4590b533fef2260158bbba2807b2c813', '2026-08-05 11:12:17', 0, '2026-08-05 10:57:18', '2026-08-05 10:57:18'),
(9, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '4fb452f4a5788cfa1d804586adec3cbe5e997fd828835b4bf25c3201d976328a', '2026-08-05 11:13:37', 0, '2026-08-05 10:58:37', '2026-08-05 10:58:37'),
(10, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'ea976326980a65d3fc8b9b28c24344e26968f47e1ff1d92fc1ae228b38249550', '2026-08-05 11:14:58', 0, '2026-08-05 10:59:59', '2026-08-05 10:59:59'),
(11, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '7c70671f0a0188debf62a9a138cbd077aa82a73206967faa149cef05b55504db', '2026-08-05 11:15:03', 0, '2026-08-05 11:00:03', '2026-08-05 11:00:03'),
(12, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'ee0913f74b1b33082135c6b7dc551e5eedfb3dc21bd6697eb501ba80ab95b5d6', '2026-08-05 11:19:41', 0, '2026-08-05 11:04:41', '2026-08-05 11:04:41'),
(13, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '6797178881d2e7980e2bc642dad058030de45130566c0483f6005b8759dc02c3', '2026-08-05 11:35:48', 0, '2026-08-05 11:20:48', '2026-08-05 11:20:48'),
(14, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '224bc0ecaf5ca478dfd05f9e5ad7612ff08d1656bced1886d8e26596ceab50fc', '2026-08-05 12:59:15', 0, '2026-08-05 12:44:15', '2026-08-05 12:44:15'),
(15, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'baf4c6cf3a498a5a10fae88fb47f8e76d76e6d84523f1cbf33af6a637f3c1da8', '2026-08-06 10:10:41', 0, '2026-08-06 09:55:42', '2026-08-06 09:55:42'),
(16, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '04aec9ac07b76755ec1b468167a38b32d8fce175203b1c972b9b806d0ffaaaf6', '2026-08-06 10:18:00', 0, '2026-08-06 10:03:01', '2026-08-06 10:03:01'),
(17, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '66615761bff0dda21798c51bba1d594f1ee758d35d34c2af34e92fdbdc951914', '2026-08-06 10:21:08', 0, '2026-08-06 10:06:08', '2026-08-06 10:06:08'),
(18, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'cb5aef63491f0653f94b5797f31f3acd08a612b9c584699c1fccb1afeff54046', '2026-08-06 10:28:11', 0, '2026-08-06 10:13:12', '2026-08-06 10:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `address_type` enum('residential','commercial','warehouse','billing','shipping') NOT NULL DEFAULT 'residential',
  `street_address` varchar(255) NOT NULL,
  `landmark` varchar(150) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`uuid`, `customer_uuid`, `address_type`, `street_address`, `landmark`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `is_primary`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('02ad968d-0809-44ee-aa50-347ac31ceb09', '56922ed8-effd-4e12-bf72-30609858ea63', 'commercial', '7482 Park Street', 'Near School', 'Ahmedabad', 'Gujarat', '168350', 'India', '31.63333333', '70.76666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('044924b1-820e-495c-b265-86b44ef61876', '406d0808-68a9-4f43-86c7-742774b247b2', 'residential', '6372 Main Street', 'Near Hospital', 'Mumbai', 'Maharashtra', '847298', 'India', '31.30000000', '71.46666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('072c32fc-960c-4798-8ddf-e5d90158c630', '90234901-9112-49ca-9b70-a37c48a61270', 'warehouse', '7707 Ahmedabad Business Complex, Floor 1', 'Near Port', 'Ahmedabad', 'Gujarat', '176446', 'India', '29.65000000', '73.83333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('0c380280-3d06-4e2d-ba2f-79786577f13f', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'billing', '346 Pune Business Complex, Floor 3', 'Near Station', 'Pune', 'Maharashtra', '728828', 'India', '31.16666667', '73.05000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('0e337059-cf34-4289-b64c-e5b0c021e354', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'residential', '9086 Main Street', 'Near Hospital', 'Mumbai', 'Maharashtra', '642420', 'India', '28.26666667', '72.03333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('0e396dd2-b083-4de1-a740-632d2f69998c', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'residential', '2667 Main Street', 'Near Hospital', 'Jaipur', 'Rajasthan', '624797', 'India', '29.11666667', '74.90000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('12eb0d8f-f07a-4db8-936c-e0ea70fbce62', '4720a80b-9615-4abc-b989-6732c1535ef0', 'billing', '8969 Oak Street', 'Near Market', 'Lucknow', 'Uttar Pradesh', '815447', 'India', '32.65000000', '74.66666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('13050006-4cf8-464a-a35c-0b9e51ecea7d', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'commercial', '6297 Park Street', 'Near School', 'Delhi', 'Delhi', '318803', 'India', '34.00000000', '73.41666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('14de67e6-55d1-4276-8634-e47d4a76b27b', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'billing', '1722 Oak Street', 'Near Market', 'Jaipur', 'Rajasthan', '702664', 'India', '33.43333333', '76.40000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('18fbe573-5349-4751-a7bf-2dc7b9dc0502', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'commercial', '969 Park Street', 'Near School', 'Jaipur', 'Rajasthan', '656661', 'India', '30.38333333', '76.23333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('1aa25e81-074c-4f7c-a7e7-31fbfd0cafa4', '56922ed8-effd-4e12-bf72-30609858ea63', 'residential', '6207 Main Street', 'Near Hospital', 'Ahmedabad', 'Gujarat', '720343', 'India', '31.30000000', '73.60000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('1ac3f438-6a95-4b29-96f5-557aaa904b8d', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'commercial', '5732 Park Street', 'Near School', 'Lucknow', 'Uttar Pradesh', '409752', 'India', '28.36666667', '76.30000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('1d3f613b-fb58-4578-9d90-fe07570bc969', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'billing', '2059 Jaipur Business Complex, Floor 3', 'Near Station', 'Jaipur', 'Rajasthan', '460913', 'India', '31.31666667', '77.65000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('23210ffb-2ae2-4505-af6e-2215d20082d3', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'commercial', '2807 Park Street', 'Near School', 'Mumbai', 'Maharashtra', '959610', 'India', '34.16666667', '69.68333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('24743b9d-3e3d-4272-b734-18938e870f62', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'billing', '8345 Lucknow Business Complex, Floor 3', 'Near Station', 'Lucknow', 'Uttar Pradesh', '698483', 'India', '30.06666667', '74.46666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('247d0394-74af-4f86-bc1a-abf40b61d0eb', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'billing', '9253 Oak Street', 'Near Market', 'Kolkata', 'West Bengal', '718509', 'India', '32.75000000', '71.83333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('24e42e01-ea50-4d15-b532-4250ecc16719', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'residential', '7252 Main Street', 'Near Hospital', 'Hyderabad', 'Telangana', '313949', 'India', '31.91666667', '76.25000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('27aaf2e8-2685-4f4d-a875-ff2eae333b19', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'commercial', '6964 Park Street', 'Near School', 'Kolkata', 'West Bengal', '752307', 'India', '34.75000000', '72.53333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('2b33cd44-144f-4a1d-b0c6-173925c74c98', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'commercial', '6607 Jaipur Business Complex, Floor 2', 'Near Airport', 'Jaipur', 'Rajasthan', '507935', 'India', '34.61666667', '76.78333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('2b8515cc-110e-4f10-bb89-1314e270f4cb', '90234901-9112-49ca-9b70-a37c48a61270', 'commercial', '1969 Ahmedabad Business Complex, Floor 2', 'Near Airport', 'Ahmedabad', 'Gujarat', '542448', 'India', '30.65000000', '76.53333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('30fa05ac-853f-4537-9a66-9f50e378b137', 'd18f7413-6231-423b-995f-889e6f9dad03', 'commercial', '1394 Delhi Business Complex, Floor 2', 'Near Airport', 'Delhi', 'Delhi', '730743', 'India', '28.36666667', '72.33333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('316de2f8-ac8c-46ba-bd03-7c79d6520962', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'warehouse', '5017 Chennai Business Complex, Floor 1', 'Near Port', 'Chennai', 'Tamil Nadu', '122666', 'India', '29.70000000', '73.33333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('320be2d5-9a54-4021-ab1d-b111102854ad', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'residential', '3620 Main Street', 'Near Hospital', 'Jaipur', 'Rajasthan', '625150', 'India', '33.96666667', '70.11666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('323dc5d1-1eb3-4ff9-bf47-bf02913ed459', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'billing', '2461 Delhi Business Complex, Floor 3', 'Near Station', 'Delhi', 'Delhi', '882208', 'India', '32.68333333', '73.73333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('326e5106-9756-419a-a9c4-0f7684c34f36', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'commercial', '1688 Kolkata Business Complex, Floor 2', 'Near Airport', 'Kolkata', 'West Bengal', '806089', 'India', '31.75000000', '75.45000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('33c103da-a022-4bda-a5b8-4909cb5fd1be', '90234901-9112-49ca-9b70-a37c48a61270', 'billing', '542 Ahmedabad Business Complex, Floor 3', 'Near Station', 'Ahmedabad', 'Gujarat', '785882', 'India', '29.25000000', '77.20000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('386afcba-daef-4ad1-9816-2f6c240fee82', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'commercial', '6703 Jaipur Business Complex, Floor 2', 'Near Airport', 'Jaipur', 'Rajasthan', '582073', 'India', '29.40000000', '73.56666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('3acc8fdc-2069-40b7-9566-fd73d1ac836f', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'billing', '6580 Kolkata Business Complex, Floor 3', 'Near Station', 'Kolkata', 'West Bengal', '770901', 'India', '29.05000000', '68.50000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('3cd0e4c8-4002-416e-a4da-f96c594e2775', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'residential', '3184 Main Street', 'Near Hospital', 'Delhi', 'Delhi', '122137', 'India', '32.73333333', '77.45000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('3eaa1d0f-e44d-4035-9fbb-bffee6e78238', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'warehouse', '8140 Delhi Business Complex, Floor 1', 'Near Port', 'Delhi', 'Delhi', '881842', 'India', '29.81666667', '77.76666667', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('3f9be76d-319d-49b9-bde1-a2b147f69304', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'billing', '1693 Pune Business Complex, Floor 3', 'Near Station', 'Pune', 'Maharashtra', '510597', 'India', '34.00000000', '71.88333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4695af1d-6011-4841-a50e-e65ca7b55d0f', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'billing', '2820 Oak Street', 'Near Market', 'Delhi', 'Delhi', '393042', 'India', '32.36666667', '70.41666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('47ede4e7-7a09-4c3c-9c8e-4839623a1bbf', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'billing', '5426 Bangalore Business Complex, Floor 3', 'Near Station', 'Bangalore', 'Karnataka', '442654', 'India', '31.80000000', '71.06666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('4ccb0755-6141-4d61-b399-e62f5e11a6f6', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'warehouse', '2680 Hyderabad Business Complex, Floor 1', 'Near Port', 'Hyderabad', 'Telangana', '451470', 'India', '29.38333333', '69.53333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4df07fc7-0144-4e7b-9610-69af68df4f8e', '56922ed8-effd-4e12-bf72-30609858ea63', 'billing', '7867 Oak Street', 'Near Market', 'Ahmedabad', 'Gujarat', '638724', 'India', '29.11666667', '77.98333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('50ab048c-3f81-46a5-bd18-2759a1da3799', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'billing', '4762 Oak Street', 'Near Market', 'Jaipur', 'Rajasthan', '729756', 'India', '32.70000000', '77.60000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('5270165f-dc59-4ce8-ac26-75d2cee66f70', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'commercial', '7476 Park Street', 'Near School', 'Chennai', 'Tamil Nadu', '356798', 'India', '30.58333333', '68.36666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('556501cb-ce86-486e-ab6c-86238af96158', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'commercial', '2144 Chennai Business Complex, Floor 2', 'Near Airport', 'Chennai', 'Tamil Nadu', '919172', 'India', '30.26666667', '72.60000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('56b65ceb-a4a9-46f8-91f2-a38c48784208', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'commercial', '1706 Park Street', 'Near School', 'Pune', 'Maharashtra', '561252', 'India', '33.26666667', '72.40000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('57ad4973-4526-4155-8741-e777f28eb4f4', '406d0808-68a9-4f43-86c7-742774b247b2', 'billing', '1622 Oak Street', 'Near Market', 'Mumbai', 'Maharashtra', '731259', 'India', '33.20000000', '72.78333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('5a7e8bcb-6089-408b-8482-5acbb8007b9a', 'd18f7413-6231-423b-995f-889e6f9dad03', 'warehouse', '5247 Delhi Business Complex, Floor 1', 'Near Port', 'Delhi', 'Delhi', '868937', 'India', '30.45000000', '71.38333333', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5b48c702-cd8b-486c-bb5e-dd43463f2078', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'residential', '7088 Main Street', 'Near Hospital', 'Kolkata', 'West Bengal', '172460', 'India', '33.51666667', '68.61666667', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('5c0c7e14-32f6-42a3-9842-6655b758d4e7', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'commercial', '8387 Park Street', 'Near School', 'Hyderabad', 'Telangana', '618754', 'India', '30.53333333', '69.53333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('63e39984-ab1e-4656-8108-2660605e05ae', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'billing', '1939 Oak Street', 'Near Market', 'Bangalore', 'Karnataka', '883652', 'India', '31.71666667', '70.20000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('65d4d1cf-7221-43c4-9827-cd82fbea7bf9', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'residential', '3939 Main Street', 'Near Hospital', 'Pune', 'Maharashtra', '878352', 'India', '28.91666667', '75.93333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('672abe79-a480-47a4-b4f4-543e1f8198e3', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'billing', '1617 Oak Street', 'Near Market', 'Hyderabad', 'Telangana', '889369', 'India', '32.20000000', '74.85000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('689d759e-4eee-4ddb-bb6a-b33a3632db7d', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'residential', '1758 Main Street', 'Near Hospital', 'Ahmedabad', 'Gujarat', '682913', 'India', '30.18333333', '72.00000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('692a98a0-15b4-4b0c-9903-7c66723710e2', '8847a41f-f820-4185-875e-180ba15289cd', 'billing', '3075 Oak Street', 'Near Market', 'Chennai', 'Tamil Nadu', '750221', 'India', '28.16666667', '70.81666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('697ed74f-da6c-4072-b74a-d4a9596e3707', '991a7d85-aa91-4d1c-9800-72484f76b668', 'commercial', '5649 Mumbai Business Complex, Floor 2', 'Near Airport', 'Mumbai', 'Maharashtra', '633092', 'India', '31.18333333', '69.81666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6a516951-89ca-41f4-8327-b4cd924ca1ce', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'warehouse', '3458 Pune Business Complex, Floor 1', 'Near Port', 'Pune', 'Maharashtra', '289054', 'India', '31.63333333', '72.30000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('6be6c8e8-4ac3-4a3b-9e11-27cc8ebb8b6f', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'residential', '8598 Main Street', 'Near Hospital', 'Chennai', 'Tamil Nadu', '949441', 'India', '31.25000000', '77.05000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('6c7db06c-df19-43a9-a681-d9cc0835d245', '8847a41f-f820-4185-875e-180ba15289cd', 'commercial', '9746 Park Street', 'Near School', 'Chennai', 'Tamil Nadu', '976881', 'India', '28.00000000', '73.68333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('6c9824b4-85c2-40b8-a217-8a81c31a4ccc', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'billing', '4152 Oak Street', 'Near Market', 'Mumbai', 'Maharashtra', '194233', 'India', '32.98333333', '71.73333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7132934f-2645-442d-a825-88ecc4688b27', '991a7d85-aa91-4d1c-9800-72484f76b668', 'warehouse', '5161 Mumbai Business Complex, Floor 1', 'Near Port', 'Mumbai', 'Maharashtra', '170661', 'India', '31.68333333', '74.80000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('71ed1fb7-53b9-4aaa-84ea-baae4e24c3be', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'billing', '6530 Oak Street', 'Near Market', 'Bangalore', 'Karnataka', '600443', 'India', '34.28333333', '75.70000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('73e4d0f3-0732-4cb9-9231-8e223e9a7fd6', '8847a41f-f820-4185-875e-180ba15289cd', 'residential', '4591 Main Street', 'Near Hospital', 'Chennai', 'Tamil Nadu', '823480', 'India', '34.46666667', '70.43333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('741e1f0d-24ec-4779-9392-9c2578ef716f', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'billing', '5918 Bangalore Business Complex, Floor 3', 'Near Station', 'Bangalore', 'Karnataka', '814598', 'India', '34.26666667', '73.35000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('755bf6b5-c7c6-44f1-b3a7-83b71ea90e69', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'commercial', '7452 Park Street', 'Near School', 'Ahmedabad', 'Gujarat', '781714', 'India', '33.96666667', '76.18333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('75f182fe-6629-4621-933a-b87fd1fc070f', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'billing', '5054 Oak Street', 'Near Market', 'Kolkata', 'West Bengal', '114330', 'India', '34.80000000', '77.20000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('77acfc76-c1a8-44ac-b5bf-164e73548055', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'commercial', '8948 Mumbai Business Complex, Floor 2', 'Near Airport', 'Mumbai', 'Maharashtra', '480706', 'India', '28.83333333', '77.75000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7b67a358-1989-4e90-8fe6-8a78d11bee1d', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'commercial', '4996 Kolkata Business Complex, Floor 2', 'Near Airport', 'Kolkata', 'West Bengal', '434611', 'India', '33.68333333', '69.33333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7c4358de-6c45-4774-99a1-5005fa9a3a8c', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'commercial', '4577 Chennai Business Complex, Floor 2', 'Near Airport', 'Chennai', 'Tamil Nadu', '227269', 'India', '31.20000000', '70.61666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7d584d67-9d7f-4cf6-a205-9119c9b6eec7', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'billing', '2276 Oak Street', 'Near Market', 'Delhi', 'Delhi', '779937', 'India', '33.08333333', '70.21666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('7eafa9fe-e65f-4772-a4e5-58f424ccec77', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'residential', '4707 Main Street', 'Near Hospital', 'Lucknow', 'Uttar Pradesh', '214319', 'India', '29.56666667', '75.73333333', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('807a8c17-8af3-4117-aad6-938876f5c569', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'residential', '8836 Main Street', 'Near Hospital', 'Kolkata', 'West Bengal', '358110', 'India', '29.88333333', '69.56666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('80989808-ffd6-47e3-8d9f-597ab8fd2a80', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'warehouse', '1171 Bangalore Business Complex, Floor 1', 'Near Port', 'Bangalore', 'Karnataka', '449408', 'India', '32.88333333', '74.51666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('8c81c18d-6ed8-4f4d-964d-cb16376088b1', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'billing', '1414 Oak Street', 'Near Market', 'Hyderabad', 'Telangana', '993084', 'India', '34.68333333', '70.36666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('8de76a7f-42c8-467b-bcd4-ffe66f305dc6', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'warehouse', '8824 Lucknow Business Complex, Floor 1', 'Near Port', 'Lucknow', 'Uttar Pradesh', '997125', 'India', '34.06666667', '68.16666667', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('8ecc1185-2cd7-4f67-b6ef-dcbc2bc635db', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'commercial', '2482 Park Street', 'Near School', 'Jaipur', 'Rajasthan', '492994', 'India', '33.11666667', '77.06666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('91add75c-bf8e-4c15-8ede-b234f49b0735', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'billing', '3782 Hyderabad Business Complex, Floor 3', 'Near Station', 'Hyderabad', 'Telangana', '674186', 'India', '33.03333333', '70.08333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('950f370a-53e6-4513-80ab-b9424a389827', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'billing', '7254 Oak Street', 'Near Market', 'Pune', 'Maharashtra', '318303', 'India', '33.03333333', '71.45000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('96d4c139-f5cc-40ac-b964-0ee07bb942a4', '447b85f3-03bd-4bac-9966-180a174185e7', 'billing', '3862 Ahmedabad Business Complex, Floor 3', 'Near Station', 'Ahmedabad', 'Gujarat', '496996', 'India', '34.18333333', '77.55000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9a075103-36ea-482a-a80d-b21d52cd2cee', '4720a80b-9615-4abc-b989-6732c1535ef0', 'commercial', '4109 Park Street', 'Near School', 'Lucknow', 'Uttar Pradesh', '323017', 'India', '32.16666667', '77.61666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9a3c3cd1-4425-42b3-a550-6fbe853442d8', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'residential', '8149 Main Street', 'Near Hospital', 'Delhi', 'Delhi', '640895', 'India', '31.31666667', '75.81666667', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9c73b6b5-87e1-4400-a720-3f6fcae75595', '447b85f3-03bd-4bac-9966-180a174185e7', 'commercial', '3809 Ahmedabad Business Complex, Floor 2', 'Near Airport', 'Ahmedabad', 'Gujarat', '641112', 'India', '31.58333333', '69.86666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9f7d2832-d27d-4e42-af8f-cbedde1d7132', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'billing', '4318 Kolkata Business Complex, Floor 3', 'Near Station', 'Kolkata', 'West Bengal', '462270', 'India', '29.16666667', '70.80000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a2276fbc-fb6f-4ef8-88b3-26ad1c15f36f', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'residential', '4426 Main Street', 'Near Hospital', 'Bangalore', 'Karnataka', '808180', 'India', '33.43333333', '74.25000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a39fa7b4-a283-4f16-9194-b1c6c1bc2a22', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'billing', '4039 Chennai Business Complex, Floor 3', 'Near Station', 'Chennai', 'Tamil Nadu', '572901', 'India', '32.61666667', '76.95000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a4167e69-77b2-4c1f-8bcd-b7269227d20f', '991a7d85-aa91-4d1c-9800-72484f76b668', 'billing', '734 Mumbai Business Complex, Floor 3', 'Near Station', 'Mumbai', 'Maharashtra', '863377', 'India', '32.33333333', '77.11666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a4de1720-9a1b-462c-88cf-76aa5c8565b5', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'billing', '6905 Mumbai Business Complex, Floor 3', 'Near Station', 'Mumbai', 'Maharashtra', '656901', 'India', '34.06666667', '73.55000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a5cd0cd4-e22e-4a4e-b2a7-d2a7ab24681b', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'commercial', '7090 Lucknow Business Complex, Floor 2', 'Near Airport', 'Lucknow', 'Uttar Pradesh', '928490', 'India', '28.96666667', '72.20000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a651b97f-846b-4d0c-ad55-b84883dadec3', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'warehouse', '4940 Kolkata Business Complex, Floor 1', 'Near Port', 'Kolkata', 'West Bengal', '390959', 'India', '32.00000000', '74.03333333', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a6997bbf-721e-4091-938c-067d232f5cfc', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'warehouse', '3318 Mumbai Business Complex, Floor 1', 'Near Port', 'Mumbai', 'Maharashtra', '951507', 'India', '33.55000000', '71.08333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a821b103-b725-46a6-a9be-31b2b1294079', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'warehouse', '5209 Hyderabad Business Complex, Floor 1', 'Near Port', 'Hyderabad', 'Telangana', '886643', 'India', '34.01666667', '69.56666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a9e9e41f-689e-4902-a5c4-b75d1635cb48', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'commercial', '8301 Park Street', 'Near School', 'Bangalore', 'Karnataka', '504062', 'India', '28.98333333', '68.13333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('aa7bb584-4ebd-4433-94ed-88ead4e198d7', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'commercial', '6431 Park Street', 'Near School', 'Delhi', 'Delhi', '715481', 'India', '32.71666667', '76.45000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('abb6a1fc-4f1e-4a60-9a7d-404b58302803', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'commercial', '7794 Delhi Business Complex, Floor 2', 'Near Airport', 'Delhi', 'Delhi', '838706', 'India', '32.70000000', '74.46666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b08e7c22-ac6f-410c-9fbe-4b51b0f3466b', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'warehouse', '987 Jaipur Business Complex, Floor 1', 'Near Port', 'Jaipur', 'Rajasthan', '748706', 'India', '31.80000000', '74.60000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('b3a5e4ae-4785-4815-82ec-a95bfa6666d8', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'warehouse', '8894 Pune Business Complex, Floor 1', 'Near Port', 'Pune', 'Maharashtra', '811879', 'India', '30.80000000', '74.70000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('b41bc54e-1ebe-4569-976d-a4fd81597bab', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'residential', '1415 Main Street', 'Near Hospital', 'Hyderabad', 'Telangana', '755664', 'India', '28.40000000', '72.45000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('bcad8514-0771-44b6-8123-446014342e97', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'commercial', '2048 Pune Business Complex, Floor 2', 'Near Airport', 'Pune', 'Maharashtra', '247103', 'India', '28.75000000', '76.93333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('bffbb352-e49a-4373-9ac8-a694f6bddb0c', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'commercial', '5626 Lucknow Business Complex, Floor 2', 'Near Airport', 'Lucknow', 'Uttar Pradesh', '782626', 'India', '31.56666667', '72.28333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c52d19ab-2d73-43ab-a5d3-ce0b6948d92d', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'commercial', '5436 Hyderabad Business Complex, Floor 2', 'Near Airport', 'Hyderabad', 'Telangana', '992505', 'India', '34.90000000', '72.38333333', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('c5569360-6bd1-4c3d-8241-a52ad98b1f6d', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'warehouse', '4285 Kolkata Business Complex, Floor 1', 'Near Port', 'Kolkata', 'West Bengal', '645753', 'India', '32.80000000', '71.51666667', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('c5767525-2377-41da-a1b5-91649cfec98e', '447b85f3-03bd-4bac-9966-180a174185e7', 'warehouse', '7044 Ahmedabad Business Complex, Floor 1', 'Near Port', 'Ahmedabad', 'Gujarat', '571943', 'India', '33.63333333', '77.18333333', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c74ce026-857a-4f20-a2cd-59eee5e57a0e', 'd18f7413-6231-423b-995f-889e6f9dad03', 'billing', '3661 Delhi Business Complex, Floor 3', 'Near Station', 'Delhi', 'Delhi', '828805', 'India', '28.46666667', '76.28333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c7e6693f-d2cb-4f09-849e-eb45a1151ac2', '4720a80b-9615-4abc-b989-6732c1535ef0', 'residential', '9595 Main Street', 'Near Hospital', 'Lucknow', 'Uttar Pradesh', '282389', 'India', '33.01666667', '70.85000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ca1f2c96-03ca-4369-8f12-b654a613d1d3', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'warehouse', '6519 Chennai Business Complex, Floor 1', 'Near Port', 'Chennai', 'Tamil Nadu', '439326', 'India', '29.65000000', '68.60000000', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('cd7034fe-5e76-4385-88a9-1907d882bf91', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'billing', '6512 Oak Street', 'Near Market', 'Lucknow', 'Uttar Pradesh', '119880', 'India', '29.45000000', '69.41666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('ce2b86c4-cfbe-4b08-94de-6a6d3dc2349c', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'commercial', '3848 Park Street', 'Near School', 'Pune', 'Maharashtra', '256560', 'India', '28.50000000', '77.41666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d0304000-0e21-4cfa-9666-15e419006b5a', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'commercial', '6870 Bangalore Business Complex, Floor 2', 'Near Airport', 'Bangalore', 'Karnataka', '753289', 'India', '33.26666667', '70.51666667', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d7b5c7da-8db8-4fbe-978b-ad86114833a1', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'commercial', '6795 Pune Business Complex, Floor 2', 'Near Airport', 'Pune', 'Maharashtra', '517336', 'India', '29.25000000', '69.18333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('da4e1de6-e2ec-41ac-951e-f6fc68a6adc5', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'commercial', '2260 Park Street', 'Near School', 'Bangalore', 'Karnataka', '763122', 'India', '29.68333333', '77.40000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('dcf7ff09-a1c3-49a0-8eb2-5184d6046333', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'billing', '1051 Oak Street', 'Near Market', 'Pune', 'Maharashtra', '138390', 'India', '32.98333333', '74.78333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('df7513e8-e32a-45f1-8c14-2845899e9b46', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'commercial', '9194 Park Street', 'Near School', 'Hyderabad', 'Telangana', '149921', 'India', '30.56666667', '68.30000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('df8108fc-a824-4848-b01a-e78a503ec9c6', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'warehouse', '2321 Jaipur Business Complex, Floor 1', 'Near Port', 'Jaipur', 'Rajasthan', '443729', 'India', '32.66666667', '73.35000000', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e179cea9-700d-4690-8dba-2286e222e43c', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'billing', '6640 Lucknow Business Complex, Floor 3', 'Near Station', 'Lucknow', 'Uttar Pradesh', '819818', 'India', '30.78333333', '71.45000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e272d787-a751-48fa-84f4-a1ee0dfc8426', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'billing', '1103 Hyderabad Business Complex, Floor 3', 'Near Station', 'Hyderabad', 'Telangana', '207617', 'India', '34.80000000', '72.46666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e39579c8-0cf7-4209-9361-1f7de7e6a964', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'billing', '5157 Oak Street', 'Near Market', 'Chennai', 'Tamil Nadu', '930772', 'India', '31.58333333', '72.90000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('e96a8b23-2e28-4cd4-bbf5-261e8ba14b90', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'billing', '3342 Chennai Business Complex, Floor 3', 'Near Station', 'Chennai', 'Tamil Nadu', '975710', 'India', '33.55000000', '72.36666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('ec5921a2-3e7e-401b-8d93-544b60914d1f', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'warehouse', '2781 Bangalore Business Complex, Floor 1', 'Near Port', 'Bangalore', 'Karnataka', '812140', 'India', '29.38333333', '75.03333333', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ece12c88-3e49-4b15-9a81-97d469847366', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'residential', '3276 Main Street', 'Near Hospital', 'Bangalore', 'Karnataka', '109661', 'India', '28.18333333', '69.46666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('ece27823-a3ff-4d3b-8884-7604e09a202c', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'billing', '4359 Jaipur Business Complex, Floor 3', 'Near Station', 'Jaipur', 'Rajasthan', '126499', 'India', '31.31666667', '75.05000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f28259d1-1749-4c85-998e-3f67e59bf0b9', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'billing', '3665 Oak Street', 'Near Market', 'Ahmedabad', 'Gujarat', '273747', 'India', '29.36666667', '73.15000000', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('f4334020-5728-44d3-9f8c-fbc3e1d73c1f', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'commercial', '1528 Hyderabad Business Complex, Floor 2', 'Near Airport', 'Hyderabad', 'Telangana', '617996', 'India', '31.90000000', '69.68333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f476550a-bfd9-440f-ae5e-27c8a4eec316', '406d0808-68a9-4f43-86c7-742774b247b2', 'commercial', '2021 Park Street', 'Near School', 'Mumbai', 'Maharashtra', '487008', 'India', '34.95000000', '69.41666667', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('f4ab8557-0531-4eeb-939e-c39606348835', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'commercial', '898 Park Street', 'Near School', 'Kolkata', 'West Bengal', '634633', 'India', '33.88333333', '69.33333333', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f924511a-8783-4a0f-9f30-4761e8be8bb5', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'commercial', '1876 Bangalore Business Complex, Floor 2', 'Near Airport', 'Bangalore', 'Karnataka', '217133', 'India', '33.26666667', '75.95000000', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('fa4e1c28-adb1-423c-8e14-0ff25beb996f', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'residential', '5641 Main Street', 'Near Hospital', 'Pune', 'Maharashtra', '443683', 'India', '30.33333333', '72.21666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('fbe4bb49-f34f-4481-8f79-5e5212e543d1', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'warehouse', '6747 Lucknow Business Complex, Floor 1', 'Near Port', 'Lucknow', 'Uttar Pradesh', '238371', 'India', '34.40000000', '74.91666667', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `vehicle_uuid` char(36) DEFAULT NULL,
  `fleet_uuid` char(36) DEFAULT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `booking_type` enum('standard','express','scheduled') NOT NULL DEFAULT 'standard',
  `status` enum('pending','confirmed','in_transit','picked_up','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','partially_paid','paid') DEFAULT 'pending',
  `total_fare` decimal(12,2) NOT NULL DEFAULT 0.00,
  `advance_payment` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `special_instructions` text DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `uuid`, `customer_uuid`, `driver_uuid`, `vehicle_uuid`, `fleet_uuid`, `company_uuid`, `booking_reference`, `booking_type`, `status`, `payment_status`, `total_fare`, `advance_payment`, `balance_amount`, `special_instructions`, `confirmed_at`, `picked_up_at`, `delivered_at`, `cancelled_at`, `cancellation_reason`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '7a818d87-8671-46d4-8cd3-d9deb262c119', '406d0808-68a9-4f43-86c7-742774b247b2', NULL, NULL, NULL, NULL, 'BKNJACVBNU', 'standard', 'in_transit', 'partially_paid', '12686.00', '3167.00', '9519.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 1', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(2, '279c6661-e423-4fd9-a902-a37e223ebbe1', 'd5e79369-a506-4f67-b286-0a5b560d024c', NULL, NULL, NULL, NULL, 'BK1NO062CU', 'standard', 'pending', 'partially_paid', '26018.00', '21631.00', '4387.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 2', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(3, '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', NULL, NULL, NULL, NULL, 'BK3FTKLAAP', 'standard', 'pending', 'partially_paid', '35565.00', '24321.00', '11244.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(4, '43d64598-113f-4fde-b778-68daeb531168', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', NULL, NULL, NULL, NULL, 'BKAR7BZLO2', 'express', 'delivered', 'partially_paid', '5164.00', '4394.00', '770.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(5, 'ba8e5541-eeee-41c3-ac67-e938e38da949', '882c6b27-ad53-45d6-a73b-76d8973c42b2', NULL, NULL, NULL, NULL, 'BKQLJECZTJ', 'scheduled', 'confirmed', 'partially_paid', '6658.00', '1339.00', '5319.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 5', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(6, '8836195f-1e8d-41c1-b0b6-89e5edfedddb', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', NULL, NULL, NULL, NULL, 'BKWSGE9YBY', 'express', 'pending', 'partially_paid', '7647.00', '2573.00', '5074.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 6', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(7, '6ab8782b-520e-4586-b47f-8b5b37f53707', '882c6b27-ad53-45d6-a73b-76d8973c42b2', NULL, NULL, NULL, NULL, 'BKEXNDHVTF', 'express', 'pending', 'partially_paid', '14407.00', '14119.00', '288.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 7', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(8, 'a0ecbc3b-5276-4157-b46c-45380aca88de', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', NULL, NULL, NULL, NULL, 'BKHPEITBBR', 'scheduled', 'picked_up', 'partially_paid', '1826.00', '608.00', '1218.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 8', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(9, 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', NULL, NULL, NULL, NULL, 'BKFXWMYOXV', 'scheduled', 'delivered', 'partially_paid', '27814.00', '11174.00', '16640.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 9', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(10, 'f98e0bbf-857f-4db4-b099-1af0035470ae', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', NULL, NULL, NULL, NULL, 'BKTT8LTOLJ', 'standard', 'in_transit', 'partially_paid', '29333.00', '3088.00', '26245.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 10', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(11, '209da1f3-9fd1-476f-b514-7c9c546b576c', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', NULL, NULL, NULL, NULL, 'BKGGCD8QVD', 'standard', 'confirmed', 'partially_paid', '28354.00', '15980.00', '12374.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 11', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(12, '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', NULL, NULL, NULL, NULL, 'BK0FALUWE8', 'standard', 'delivered', 'partially_paid', '44979.00', '44447.00', '532.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 12', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(13, '3afc37a4-c979-4ec2-8e55-67e2874fa798', '447b85f3-03bd-4bac-9966-180a174185e7', NULL, NULL, NULL, NULL, 'BK3K4BYG5W', 'standard', 'in_transit', 'partially_paid', '16870.00', '5276.00', '11594.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 13', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(14, 'fac55836-3a3b-4410-933c-87f3d8a274fa', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', NULL, NULL, NULL, NULL, 'BKLKZZ1IDQ', 'standard', 'pending', 'partially_paid', '34931.00', '34556.00', '375.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 14', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(15, '343a21a2-3501-442d-8066-68fab3b0f0e7', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', NULL, NULL, NULL, NULL, 'BKVPVAP0V3', 'express', 'confirmed', 'partially_paid', '2635.00', '709.00', '1926.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 15', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(16, 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', NULL, NULL, NULL, NULL, 'BKNIYHP66G', 'express', 'in_transit', 'partially_paid', '32012.00', '4040.00', '27972.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 16', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(17, '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', NULL, NULL, NULL, NULL, 'BKXP4QIVOM', 'standard', 'delivered', 'partially_paid', '15103.00', '14597.00', '506.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 17', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(18, 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', '84c80c82-6409-45ef-985d-782e6c86d1d4', NULL, NULL, NULL, NULL, 'BKFLELCM39', 'express', 'delivered', 'partially_paid', '21160.00', '11428.00', '9732.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 18', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(19, '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'c87cffd8-ec15-4f90-8af1-361f86170e27', NULL, NULL, NULL, NULL, 'BKKXP0X6FJ', 'scheduled', 'pending', 'partially_paid', '36704.00', '32419.00', '4285.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 19', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(20, 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', NULL, NULL, NULL, NULL, 'BKL0JTNYQK', 'scheduled', 'picked_up', 'partially_paid', '27895.00', '7059.00', '20836.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 20', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(21, 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', '34b4d050-3750-4ef3-a71f-902d8024ca7a', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', NULL, NULL, NULL, 'BKIIJJIXFE', 'scheduled', 'confirmed', 'partially_paid', '46817.00', '31680.00', '15137.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(22, '388e8afd-2f26-4fb2-94a3-fd33be2d3423', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'bfe04c19-f789-4373-9386-74bb9cd846e0', NULL, NULL, NULL, 'BKXVYEM9RU', 'scheduled', 'picked_up', 'partially_paid', '4835.00', '1788.00', '3047.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(23, 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', '8847a41f-f820-4185-875e-180ba15289cd', 'bfe04c19-f789-4373-9386-74bb9cd846e0', NULL, NULL, NULL, 'BKDSRA89RW', 'standard', 'delivered', 'partially_paid', '42884.00', '1351.00', '41533.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(24, 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'e91b23ea-6c51-4818-8969-9d111a80933c', NULL, NULL, NULL, 'BKZPFUJIVY', 'standard', 'pending', 'partially_paid', '32695.00', '26169.00', '6526.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(25, 'b800ca3d-e396-4630-8923-704f8c055f43', '8847a41f-f820-4185-875e-180ba15289cd', '8089066b-5020-42f8-a409-b0f3144e91b8', NULL, NULL, NULL, 'BKYBQYQCHS', 'standard', 'in_transit', 'partially_paid', '29493.00', '2849.00', '26644.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 5', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(26, 'b04e3838-27c9-447d-b064-b1cbfeca66ee', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', NULL, NULL, NULL, 'BKBGTZCFX4', 'express', 'delivered', 'partially_paid', '44806.00', '5609.00', '39197.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 6', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(27, '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', '8089066b-5020-42f8-a409-b0f3144e91b8', NULL, NULL, NULL, 'BKBIKN5OJF', 'scheduled', 'confirmed', 'partially_paid', '36579.00', '2570.00', '34009.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 7', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(28, '709ff274-58b5-4333-8233-baf43838e710', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', NULL, NULL, NULL, 'BKFOSB2FDZ', 'scheduled', 'picked_up', 'partially_paid', '30651.00', '2416.00', '28235.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 8', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(29, '0103e6b0-b672-4e9c-9f78-949005327ea6', '8847a41f-f820-4185-875e-180ba15289cd', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', NULL, NULL, NULL, 'BKHSUO6P2O', 'standard', 'delivered', 'partially_paid', '48025.00', '2980.00', '45045.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 9', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(30, 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'bfe04c19-f789-4373-9386-74bb9cd846e0', NULL, NULL, NULL, 'BKSIW4QGTU', 'scheduled', 'delivered', 'partially_paid', '28460.00', '10399.00', '18061.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 10', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(31, '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', NULL, NULL, NULL, 'BKAQ4LACDT', 'scheduled', 'in_transit', 'partially_paid', '11380.00', '3592.00', '7788.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 11', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(32, '176d110a-b58e-444c-9bcd-140c625c7ddb', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', '3bc696ba-0d80-42f8-80b5-628830647d2b', NULL, NULL, NULL, 'BKYZBUND0R', 'express', 'pending', 'partially_paid', '40139.00', '25854.00', '14285.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 12', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(33, '08a3ff07-acf9-4339-9f42-8fc01ac5109a', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', NULL, NULL, NULL, 'BKICUPJ1FA', 'scheduled', 'delivered', 'partially_paid', '37024.00', '11928.00', '25096.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 13', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(34, '252aafa3-28b4-4b74-930c-9561b6f192b0', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', NULL, NULL, NULL, 'BKAZMEVHDA', 'express', 'confirmed', 'partially_paid', '16785.00', '16626.00', '159.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 14', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(35, 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', '447b85f3-03bd-4bac-9966-180a174185e7', '85ebf44e-3021-484a-8629-761a464da7ae', NULL, NULL, NULL, 'BKWE6PIOTQ', 'express', 'pending', 'partially_paid', '45868.00', '5707.00', '40161.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 15', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(36, '52693403-a4ec-4a49-ac64-03c329b69ec8', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'bfe04c19-f789-4373-9386-74bb9cd846e0', NULL, NULL, NULL, 'BK5LP0GG0J', 'express', 'in_transit', 'partially_paid', '1802.00', '874.00', '928.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 16', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(37, 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', NULL, NULL, NULL, 'BKVBPAKYDL', 'scheduled', 'delivered', 'partially_paid', '25022.00', '15688.00', '9334.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 17', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(38, '9469d467-c76f-4a54-855e-39528eed20c3', '447b85f3-03bd-4bac-9966-180a174185e7', '85ebf44e-3021-484a-8629-761a464da7ae', NULL, NULL, NULL, 'BKBHDUYB9C', 'standard', 'confirmed', 'partially_paid', '16111.00', '3125.00', '12986.00', 'Handle with care - fragile items', NULL, NULL, NULL, NULL, NULL, 'Test booking 18', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(39, 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', '991a7d85-aa91-4d1c-9800-72484f76b668', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', NULL, NULL, NULL, 'BKDIE3L2R3', 'express', 'pending', 'partially_paid', '6686.00', '551.00', '6135.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 19', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(40, '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', '934b83a2-698c-4669-86d9-e771b9ee2bc1', '8089066b-5020-42f8-a409-b0f3144e91b8', NULL, NULL, NULL, 'BKWPY4PKBO', 'express', 'delivered', 'partially_paid', '47848.00', '19853.00', '27995.00', NULL, NULL, NULL, NULL, NULL, NULL, 'Test booking 20', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_token_orders`
--

CREATE TABLE `booking_token_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `party_uuid` char(36) NOT NULL,
  `party_role` varchar(30) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'INR',
  `status` enum('awaiting_payment','paid','refund_pending','refunded','forfeiture_pending','forfeited') NOT NULL DEFAULT 'awaiting_payment',
  `provider_order_id` varchar(255) DEFAULT NULL,
  `provider_refund_id` varchar(255) DEFAULT NULL,
  `refund_amount` decimal(12,2) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(26) NOT NULL,
  `company_uuid` char(26) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `contact_person_name` varchar(150) DEFAULT NULL,
  `contact_person_phone` varchar(20) DEFAULT NULL,
  `contact_person_email` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `business_name` varchar(150) NOT NULL,
  `business_type` enum('sole_proprietor','partnership','pvt_ltd','llp','public_ltd') NOT NULL DEFAULT 'sole_proprietor',
  `registration_number` varchar(100) DEFAULT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `pan_verified_at` timestamp NULL DEFAULT NULL,
  `contact_person_name` varchar(150) DEFAULT NULL,
  `contact_person_email` varchar(150) DEFAULT NULL,
  `contact_person_phone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`uuid`, `customer_uuid`, `business_name`, `business_type`, `registration_number`, `pan`, `pan_verified_at`, `contact_person_name`, `contact_person_email`, `contact_person_phone`, `website`, `logo_url`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('01e72d0c-8660-4f38-9642-c2811ca61fa7', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'Swift Cargo Services', 'llp', 'REG000004', 'DDDD4679R', '2026-07-04 11:27:07', 'Ms. Singh', 'contact.swift_cargo_services@example.com', '99410992947', 'https://www.swiftcargoservices.com', 'https://example.com/logos/swift-cargo-services.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('0588ee56-0196-4445-a3ff-275a77020ca8', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'Global Express', 'sole_proprietor', 'REG000006', 'GGGG1905J', '2026-06-14 11:27:07', 'Mr. Sharma', 'contact.global_express@example.com', '91107440074', 'https://www.globalexpress.com', 'https://example.com/logos/global-express.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('2a7a3a27-7ad8-4231-ba18-76f36154e0d2', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'Direct Route Systems', 'llp', 'REG000009', 'JJJJ3800K', '2026-07-10 11:27:07', 'Ms. Singh', 'contact.direct_route_systems@example.com', '95570756819', 'https://www.directroutesystems.com', 'https://example.com/logos/direct-route-systems.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('35da8bb7-6b10-4ceb-96b8-781b1714e2d7', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'Rapid Delivery Co', 'partnership', 'REG000007', 'FFFF4166E', '2026-07-15 11:27:07', 'Ms. Patel', 'contact.rapid_delivery_co@example.com', '94209373122', 'https://www.rapiddeliveryco.com', 'https://example.com/logos/rapid-delivery-co.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('4364e588-40fb-445d-a45b-437777c4dabd', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'Swift Cargo Services', 'llp', 'REG000004', 'HHHH5298B', '2026-07-03 12:33:29', 'Ms. Singh', 'contact.swift_cargo_services@example.com', '97421796548', 'https://www.swiftcargoservices.com', 'https://example.com/logos/swift-cargo-services.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4c771ea2-f45b-4ab5-98b8-9721ddeae3b4', '447b85f3-03bd-4bac-9966-180a174185e7', 'Premium Transport Hub', 'pvt_ltd', 'REG000008', 'FFFF2627H', '2026-07-03 11:27:07', 'Mr. Kumar', 'contact.premium_transport_hub@example.com', '97804259371', 'https://www.premiumtransporthub.com', 'https://example.com/logos/premium-transport-hub.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('802f827e-c170-4fe3-a308-9bac55d93873', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'Precision Freight', 'public_ltd', 'REG000005', 'HHHH9219K', '2026-06-19 12:33:29', 'Mr. Gupta', 'contact.precision_freight@example.com', '93824497200', 'https://www.precisionfreight.com', 'https://example.com/logos/precision-freight.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('84fdc4a0-4dac-489a-ba34-22486767d279', 'd18f7413-6231-423b-995f-889e6f9dad03', 'TechVision Solutions', 'sole_proprietor', 'REG000001', 'EEEE4415L', '2026-07-23 11:27:07', 'Mr. Sharma', 'contact.techvision_solutions@example.com', '99689477209', 'https://www.techvisionsolutions.com', 'https://example.com/logos/techvision-solutions.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('8acbea2e-2cd8-431b-9518-2aa526e2a65b', '991a7d85-aa91-4d1c-9800-72484f76b668', 'Golden Transport Pvt Ltd', 'partnership', 'REG000002', 'DDDD7224F', '2026-06-04 11:27:07', 'Ms. Patel', 'contact.golden_transport_pvt_ltd@example.com', '97728970629', 'https://www.goldentransportpvtltd.com', 'https://example.com/logos/golden-transport-pvt-ltd.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('8caa4fc1-5fa1-41b3-8a62-2149e4ebf243', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'Rapid Delivery Co', 'partnership', 'REG000007', 'AAAA7923R', '2026-07-23 12:33:29', 'Ms. Patel', 'contact.rapid_delivery_co@example.com', '92462069727', 'https://www.rapiddeliveryco.com', 'https://example.com/logos/rapid-delivery-co.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('8d2aee87-6500-4ff9-b525-48980e222efb', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'TechVision Solutions', 'sole_proprietor', 'REG000001', 'AAAA2034J', '2026-06-27 12:33:29', 'Mr. Sharma', 'contact.techvision_solutions@example.com', '94877922891', 'https://www.techvisionsolutions.com', 'https://example.com/logos/techvision-solutions.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9216c925-c6d2-4d81-963d-17295f39795c', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'Global Express', 'sole_proprietor', 'REG000006', 'KKKK3630Y', '2026-07-04 12:33:29', 'Mr. Sharma', 'contact.global_express@example.com', '99959061813', 'https://www.globalexpress.com', 'https://example.com/logos/global-express.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ad5fb38f-540e-4828-bd43-00c81e039130', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'Golden Transport Pvt Ltd', 'partnership', 'REG000002', 'EEEE2447G', '2026-07-24 12:33:29', 'Ms. Patel', 'contact.golden_transport_pvt_ltd@example.com', '97809447916', 'https://www.goldentransportpvtltd.com', 'https://example.com/logos/golden-transport-pvt-ltd.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('bec50b76-7660-4c6c-8040-0e3a5f741b12', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'Precision Freight', 'public_ltd', 'REG000005', 'EEEE6460C', '2026-07-28 11:27:07', 'Mr. Gupta', 'contact.precision_freight@example.com', '96794817554', 'https://www.precisionfreight.com', 'https://example.com/logos/precision-freight.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c3469240-0ac9-4e29-b4c6-a86194e610b3', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'Direct Route Systems', 'llp', 'REG000009', 'EEEE8657O', '2026-07-29 12:33:29', 'Ms. Singh', 'contact.direct_route_systems@example.com', '95411391377', 'https://www.directroutesystems.com', 'https://example.com/logos/direct-route-systems.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ccc09967-ab41-45bb-86a9-958f590eecd0', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'Quantum Logistics', 'public_ltd', 'REG000010', 'CCCC9663O', NULL, 'Mr. Gupta', 'contact.quantum_logistics@example.com', '93544154747', 'https://www.quantumlogistics.com', 'https://example.com/logos/quantum-logistics.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d848a345-8abc-4177-b5ba-2f96dacb8a5e', '90234901-9112-49ca-9b70-a37c48a61270', 'Premium Transport Hub', 'pvt_ltd', 'REG000008', 'KKKK3409F', '2026-07-23 12:33:29', 'Mr. Kumar', 'contact.premium_transport_hub@example.com', '92344121224', 'https://www.premiumtransporthub.com', 'https://example.com/logos/premium-transport-hub.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('f2de9c31-9dfd-4b99-8dea-e5bab0a6e968', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'Excellence Logistics', 'pvt_ltd', 'REG000003', 'HHHH5583V', '2026-07-27 11:27:07', 'Mr. Kumar', 'contact.excellence_logistics@example.com', '95543494745', 'https://www.excellencelogistics.com', 'https://example.com/logos/excellence-logistics.png', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f4d8f639-4874-4454-a9a9-788d8e517188', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'Quantum Logistics', 'public_ltd', 'REG000010', 'JJJJ9872O', NULL, 'Mr. Gupta', 'contact.quantum_logistics@example.com', '95692894108', 'https://www.quantumlogistics.com', 'https://example.com/logos/quantum-logistics.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ffc006e0-8c99-4353-858d-31bceef80f37', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'Excellence Logistics', 'pvt_ltd', 'REG000003', 'BBBB5470P', '2026-06-06 12:33:29', 'Mr. Kumar', 'contact.excellence_logistics@example.com', '94908942505', 'https://www.excellencelogistics.com', 'https://example.com/logos/excellence-logistics.png', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cod_payments`
--

CREATE TABLE `cod_payments` (
  `uuid` char(36) NOT NULL,
  `payment_uuid` char(36) NOT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, collected, received, failed, returned',
  `collection_method` varchar(255) DEFAULT NULL COMMENT 'cash, cheque, demand_draft',
  `collected_at` timestamp NULL DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `reason_for_failure` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `gst_number` varchar(15) DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `contact_person_name` varchar(150) DEFAULT NULL,
  `contact_person_phone` varchar(20) DEFAULT NULL,
  `contact_person_email` varchar(150) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `country` varchar(100) NOT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `branch_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `uuid`, `registration_number`, `name`, `short_name`, `description`, `tax_id`, `gst_number`, `pan_number`, `phone`, `email`, `website`, `logo_url`, `contact_person_name`, `contact_person_phone`, `contact_person_email`, `address`, `city`, `state`, `postal_code`, `country`, `status`, `display_order`, `branch_count`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'TS-2026-001', 'TransportSeva Test Company', NULL, NULL, NULL, NULL, NULL, '+91-9876543210', 'contact@transportseva.com', NULL, NULL, NULL, NULL, NULL, '123 Business Street, Tech Park', 'Bangalore', 'Karnataka', '560001', 'India', 'active', 0, 0, NULL, NULL, NULL, '2026-07-30 12:35:46', '2026-07-30 12:35:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `containers`
--

CREATE TABLE `containers` (
  `uuid` char(36) NOT NULL,
  `branch_uuid` char(36) NOT NULL,
  `container_number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `capacity_cbm` decimal(10,2) NOT NULL,
  `weight_kg` decimal(10,2) NOT NULL,
  `length_meters` decimal(8,2) NOT NULL,
  `width_meters` decimal(8,2) NOT NULL,
  `height_meters` decimal(8,2) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','retired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `uuid` char(36) NOT NULL,
  `user_uuid` char(36) DEFAULT NULL,
  `customer_type` enum('individual','business') NOT NULL DEFAULT 'individual',
  `kyc_status` varchar(50) NOT NULL DEFAULT 'pending',
  `kyc_verified_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`uuid`, `user_uuid`, `customer_type`, `kyc_status`, `kyc_verified_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0747f409-a6d4-4cdb-9efb-076102f2b6c9', NULL, 'individual', 'verified', '2026-07-16 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('3290bd11-dfa5-45a4-9fe4-8b42507bf73b', NULL, 'individual', 'verified', '2026-07-07 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('34b4d050-3750-4ef3-a71f-902d8024ca7a', NULL, 'individual', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('3f251d68-6bbb-4200-b16e-ab34fe07714c', NULL, 'individual', 'verified', '2026-07-01 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('3fd5243f-222a-406f-ad4a-e44e91e554aa', NULL, 'individual', 'verified', '2026-07-14 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('406d0808-68a9-4f43-86c7-742774b247b2', NULL, 'individual', 'verified', '2026-07-18 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('447b85f3-03bd-4bac-9966-180a174185e7', NULL, 'business', 'verified', '2026-07-04 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('4720a80b-9615-4abc-b989-6732c1535ef0', NULL, 'individual', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4bb644ff-daa2-4947-914d-6b6ce65fc1e6', NULL, 'business', 'verified', '2026-07-01 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('56922ed8-effd-4e12-bf72-30609858ea63', NULL, 'individual', 'verified', '2026-07-22 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5bbbdbe1-cfb7-433c-99ac-fedcb3459392', NULL, 'individual', 'verified', '2026-07-03 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('5df3c447-490c-4fc0-871e-4b8ee25e4dd4', NULL, 'business', 'verified', '2026-07-16 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6d0aa410-e153-4219-a58e-d07cb5e6c3fa', NULL, 'business', 'verified', '2026-07-24 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7625fcda-3e9b-4bbd-9cd7-07ede9bece86', NULL, 'business', 'verified', '2026-07-26 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('841ebd9b-e413-4082-bde5-ca8c1eca9fd7', NULL, 'business', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('84c80c82-6409-45ef-985d-782e6c86d1d4', NULL, 'individual', 'verified', '2026-07-16 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('882c6b27-ad53-45d6-a73b-76d8973c42b2', NULL, 'business', 'verified', '2026-07-06 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('8847a41f-f820-4185-875e-180ba15289cd', NULL, 'individual', 'verified', '2026-07-11 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('90234901-9112-49ca-9b70-a37c48a61270', NULL, 'business', 'verified', '2026-07-03 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('934b83a2-698c-4669-86d9-e771b9ee2bc1', NULL, 'business', 'verified', '2026-07-03 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('991a7d85-aa91-4d1c-9800-72484f76b668', NULL, 'business', 'verified', '2026-07-08 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', NULL, 'business', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9ebdbfb5-a5f2-495f-9d98-ea57126b6007', NULL, 'individual', 'verified', '2026-07-12 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a11b97a7-8dbb-4280-9c4c-7b3893d5e513', NULL, 'individual', 'verified', '2026-06-30 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', NULL, 'business', 'verified', '2026-07-07 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('b18a0f50-6e74-4b76-983d-4e052ce12c45', NULL, 'business', 'verified', '2026-07-16 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('be7376ce-e23d-491f-932b-4e630ed68ae2', NULL, 'individual', 'verified', '2026-07-25 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('c361a239-287a-4767-b8e8-9c9d52fd07c3', NULL, 'business', 'verified', '2026-07-13 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('c4d43208-f81f-4e10-863c-c83a6cc5a799', NULL, 'individual', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c87cffd8-ec15-4f90-8af1-361f86170e27', NULL, 'business', 'verified', '2026-07-20 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d18f7413-6231-423b-995f-889e6f9dad03', NULL, 'business', 'verified', '2026-07-02 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d3ac351c-74c4-4a77-b984-7e7873f36a78', NULL, 'individual', 'verified', '2026-07-20 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d5590a4b-1d3a-48a8-9a14-986d0202a7bd', NULL, 'business', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d5e79369-a506-4f67-b286-0a5b560d024c', NULL, 'business', 'verified', '2026-07-22 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e2b8338d-c55b-4e77-95fe-2e2fd410c674', NULL, 'individual', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e2b9e78b-c90d-4890-84c7-be38bba275d0', NULL, 'business', 'pending', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e5c63c53-89fa-4341-ad94-daee980fdfbb', NULL, 'individual', 'verified', '2026-07-04 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('efde88ae-73dd-4916-b09b-abeb2ad30b3d', NULL, 'business', 'verified', '2026-07-01 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fc3090a1-eb26-4980-bb9e-4b93ba7da463', NULL, 'individual', 'verified', '2026-07-12 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fd003822-9b0f-4316-8b30-936657ba8baa', NULL, 'individual', 'verified', '2026-07-25 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(26) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_uuid` char(36) NOT NULL,
  `document_category` varchar(100) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) UNSIGNED DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_by` char(36) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_approvals`
--

CREATE TABLE `document_approvals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_templates`
--

CREATE TABLE `document_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `template_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`template_data`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `uuid` char(36) NOT NULL,
  `user_uuid` char(36) NOT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `license_valid_until` date DEFAULT NULL,
  `years_of_experience` int(11) NOT NULL DEFAULT 0,
  `current_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `total_ratings` int(11) NOT NULL DEFAULT 0,
  `total_trips` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `kyc_status` enum('pending','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`uuid`, `user_uuid`, `license_number`, `license_valid_until`, `years_of_experience`, `current_rating`, `total_ratings`, `total_trips`, `status`, `is_verified`, `kyc_status`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'ac869d05-3636-471d-ac80-64ed990e3e5e', 'DL-+919000000005-597', '2031-07-30', 14, '4.70', 360, 2799, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '96a011b2-d90a-48b7-8b92-af31586abc7f', 'DL-+919000000002-618', '2031-07-30', 12, '4.20', 327, 1026, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('3bc696ba-0d80-42f8-80b5-628830647d2b', '07d46a74-49ab-451c-b7d7-4b2c405b7fb1', 'DL-+919000000010-308', '2031-07-30', 10, '4.30', 281, 545, 'pending', 0, 'in_progress', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('51b7ee4a-d6a2-4f95-b8d2-345ed0774866', '01f4aec9-b97b-4143-944f-7cf5eaa62cf9', 'DL-+919000000004-669', '2031-07-30', 15, '5.00', 358, 4687, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('8089066b-5020-42f8-a409-b0f3144e91b8', 'd1d2b174-7c6a-4f8d-bcd2-3d80282ebb56', 'DL-+919000000001-754', '2031-07-30', 10, '3.50', 25, 1329, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('8292f9f1-75c4-4157-8ae4-233a73ec43ba', '4667d016-6a06-4832-afec-7305d9bb3029', 'DL-+919000000006-914', '2031-07-30', 8, '3.50', 281, 233, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('85ebf44e-3021-484a-8629-761a464da7ae', '6b55de16-ae46-45ae-91bc-5f2216ed9ddc', 'DL-+919000000007-163', '2031-07-30', 10, '3.50', 49, 2128, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('bfe04c19-f789-4373-9386-74bb9cd846e0', '989c8a50-0936-41fd-88d7-ac8517e2e680', 'DL-+919000000003-835', '2031-07-30', 19, '4.80', 169, 3186, 'active', 1, 'completed', NULL, NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'd19f2bbc-eda2-48c9-9502-37bade26623d', 'DL-+919000000008-118', '2031-07-30', 8, '4.50', 259, 3601, 'pending', 0, 'in_progress', NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('e91b23ea-6c51-4818-8969-9d111a80933c', '8fa77656-c85e-4e3b-a0f0-4c149aa435d0', 'DL-+919000000009-846', '2031-07-30', 5, '4.30', 330, 3278, 'pending', 0, 'in_progress', NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_aadhaar`
--

CREATE TABLE `driver_aadhaar` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `aadhaar_number` varchar(255) NOT NULL,
  `aadhaar_hash` varchar(255) NOT NULL,
  `name_on_aadhaar` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_aadhaar`
--

INSERT INTO `driver_aadhaar` (`uuid`, `driver_uuid`, `aadhaar_number`, `aadhaar_hash`, `name_on_aadhaar`, `date_of_birth`, `gender`, `address`, `document_url`, `is_verified`, `verified_at`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('30c4f934-5730-405e-b38a-0e8429d39945', 'e91b23ea-6c51-4818-8969-9d111a80933c', '000000000009', 'd366132a5d40829f8fbb3f2e0be5357b67e50573c42ebbcffe2257a76ee8162c', 'Driver 9', '1995-07-30', 'male', 'Address Line 9, Street 9, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar9', 0, NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('344429db-b537-4dbb-8ee6-e3ee4f1ac631', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '000000000006', '814d398465b3250293364b6d6c418e83c04a0d7fc21a149bb8ba3a258f124b1d', 'Driver 6', '1985-07-30', 'female', 'Address Line 6, Street 6, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar6', 1, '2026-07-02 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4a30d33a-4c3f-4bc8-b4e5-635329af9107', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '000000000008', 'a04bde313618a51963bbf06b2c3b2ae7a1173cc23d1c68026d8b1903f20b4657', 'Driver 8', '1977-07-30', 'male', 'Address Line 8, Street 8, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar8', 0, NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('657bbe91-c6a2-4b27-9211-09c6841a7d82', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '000000000002', '2a749ecbe7c135a7e8ad68945bd410ae249a9e1d9b05ccc7aa19ea936b417961', 'Driver 2', '1976-07-30', 'female', 'Address Line 2, Street 2, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar2', 1, '2026-07-18 18:03:26', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('81a579bc-ca36-4c8c-ae67-f4126117f526', '85ebf44e-3021-484a-8629-761a464da7ae', '000000000007', 'e58a4d90464e3f34fa4067805569b335c0e8c74a6b13287971bce92ec4ac5034', 'Driver 7', '1983-07-30', 'female', 'Address Line 7, Street 7, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar7', 1, '2026-06-11 18:03:28', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('83e59969-681d-446c-af9a-be63e5f3cd6a', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', '000000000005', '3a2ad22934ee06b5d218216282814ac60ab661bc996b60a2f066a87525faf006', 'Driver 5', '1979-07-30', 'female', 'Address Line 5, Street 5, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar5', 1, '2026-07-07 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a41a596b-f6d9-405e-b65a-a2ebf1ec58fc', '3bc696ba-0d80-42f8-80b5-628830647d2b', '000000000010', '8e3df290a65eab68aea660be4887f4708d993316e7eb2d0c270d553c8d3fa4a7', 'Driver 10', '1982-07-30', 'other', 'Address Line 10, Street 10, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar10', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b1f277e2-cb19-4894-bb9a-d054d1b6ba4f', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '000000000003', '9838fa3d0b3cf38b6c4ca260ae0fc4486276144cc038540db6bf9451c4cf8155', 'Driver 3', '1999-07-30', 'other', 'Address Line 3, Street 3, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar3', 1, '2026-06-08 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('bd3da1d0-4100-45a8-8200-5e42cf754c5a', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', '000000000004', '4125416338bc1a6d7c2ba7c2c67c16c32818b08025cfbc390cf1957b23c3192a', 'Driver 4', '1990-07-30', 'other', 'Address Line 4, Street 4, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar4', 1, '2026-05-21 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('e721e5b7-a6d8-4b7a-bc37-881a0e710e23', '8089066b-5020-42f8-a409-b0f3144e91b8', '000000000001', '27d6fbbe5c7d230a83b72e525751d4e0a33477eeb7817a4af485825a133e1b1e', 'Driver 1', '1997-07-30', 'male', 'Address Line 1, Street 1, City, State 123456', 'https://via.placeholder.com/300?text=Aadhaar1', 1, '2026-06-24 18:03:26', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_emergency_contacts`
--

CREATE TABLE `driver_emergency_contacts` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `relationship` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `address` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_emergency_contacts`
--

INSERT INTO `driver_emergency_contacts` (`uuid`, `driver_uuid`, `name`, `phone`, `email`, `relationship`, `is_primary`, `address`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('02f36efe-ac61-4644-a761-975937d7e567', '8089066b-5020-42f8-a409-b0f3144e91b8', 'Wife 1', '+918714507381', 'contact0@test.local', 'spouse', 1, 'Home Address 1, City, State 123456', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0519417f-5487-4b41-85a0-6513134f9778', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Wife 4', '+915698227503', 'contact0@test.local', 'spouse', 1, 'Home Address 4, City, State 123456', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4080f94e-7868-4fc0-abe5-1429d9a1af49', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Parent 4-1', '+919019974806', 'contact1@test.local', 'parent', 0, 'Home Address 4, City, State 123456', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('45228983-4d31-498a-9a60-15784405c83f', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Parent 6-1', '+911141989691', 'contact1@test.local', 'parent', 0, 'Home Address 6, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4b8cffaa-bc37-4baf-8cc2-ede1e9fcc2fb', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'Parent 5-1', '+917728474908', 'contact1@test.local', 'parent', 0, 'Home Address 5, City, State 123456', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4f27141b-bae0-4f01-85b5-3b5ba203596c', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Parent 2-2', '+917860309296', 'contact2@test.local', 'parent', 0, 'Home Address 2, City, State 123456', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('571c30bb-2a91-42fa-a406-6af167abf8fa', '85ebf44e-3021-484a-8629-761a464da7ae', 'Wife 7', '+918046854750', 'contact0@test.local', 'spouse', 1, 'Home Address 7, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('5c5e9075-d8aa-4986-9daa-d3d8dc9dc25f', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Parent 8-2', '+916281024988', 'contact2@test.local', 'sibling', 0, 'Home Address 8, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('62e36b86-3d84-40a6-9485-4b3e8b1f4edb', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Parent 2-1', '+916172300193', 'contact1@test.local', 'child', 0, 'Home Address 2, City, State 123456', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('71695b5d-6baa-4dea-96b9-0722bda7ffc9', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'Wife 10', '+919802833909', 'contact0@test.local', 'spouse', 1, 'Home Address 10, City, State 123456', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('738d5410-f9cb-4dae-89b2-b345676cd07f', '85ebf44e-3021-484a-8629-761a464da7ae', 'Parent 7-2', '+918828812932', 'contact2@test.local', 'sibling', 0, 'Home Address 7, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('750f329a-c1bb-4734-b3dc-1d5a82a26892', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'Wife 5', '+919142323372', 'contact0@test.local', 'spouse', 1, 'Home Address 5, City, State 123456', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('7aa6090a-f5d0-401c-b99d-23b2331cd239', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Wife 8', '+913135335423', 'contact0@test.local', 'spouse', 1, 'Home Address 8, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('8c928182-8bef-4af6-b0d3-11eddbe73066', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'Parent 10-1', '+917076306527', 'contact1@test.local', 'sibling', 0, 'Home Address 10, City, State 123456', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9069f4c9-7fc2-416d-8948-88275d90d671', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'Parent 9-1', '+913778382154', 'contact1@test.local', 'parent', 0, 'Home Address 9, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('97245f8c-04ff-4c99-b0c9-556d6faaee0b', '85ebf44e-3021-484a-8629-761a464da7ae', 'Parent 7-1', '+913018083827', 'contact1@test.local', 'parent', 0, 'Home Address 7, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('9ae1ba88-3929-4e18-8742-8000ab1f7cfe', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'Wife 3', '+915447520964', 'contact0@test.local', 'spouse', 1, 'Home Address 3, City, State 123456', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('9d6480f7-3813-435f-a04b-d0589e9b85ef', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Parent 8-1', '+917753911264', 'contact1@test.local', 'parent', 0, 'Home Address 8, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ba5f9152-3b19-444e-837b-f358b8ac75bc', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'Wife 9', '+918116911156', 'contact0@test.local', 'spouse', 1, 'Home Address 9, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('cf2b3ad7-5788-4df4-9efd-a97ed74ff76e', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Wife 6', '+915296732001', 'contact0@test.local', 'spouse', 1, 'Home Address 6, City, State 123456', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fb2a36be-e1ad-4c1f-86aa-28fc17c36bb0', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Wife 2', '+919101056518', 'contact0@test.local', 'spouse', 1, 'Home Address 2, City, State 123456', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_experience`
--

CREATE TABLE `driver_experience` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `vehicle_type` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `years_worked` int(11) NOT NULL DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `document_url` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_experience`
--

INSERT INTO `driver_experience` (`uuid`, `driver_uuid`, `company_name`, `vehicle_type`, `job_title`, `years_worked`, `start_date`, `end_date`, `is_current`, `document_url`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('00acc3a9-cf1e-4ccb-bfa7-5c8ae13ada60', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'Logistics Company 0', 'tanker', 'Fleet Driver', 5, '2013-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience5-0', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('06378730-5337-485e-b3cf-45031707523e', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'Logistics Company 0', 'truck', 'Senior Driver', 4, '2012-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience3-0', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('07500310-b33e-4f36-b9e4-649aab536d52', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Logistics Company 2', 'truck', 'Fleet Driver', 1, '2016-07-30', '2016-07-30', 0, 'https://via.placeholder.com/300?text=Experience8-2', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('139ce728-692b-4e6a-9b7f-4b2a3a442f49', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'Logistics Company 0', 'tanker', 'Driver', 4, '2012-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience10-0', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('189e75fd-1330-4929-b5fd-19bb028ed9ba', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'Logistics Company 2', 'truck', 'Fleet Driver', 7, '2013-07-30', '2013-07-30', 0, 'https://via.placeholder.com/300?text=Experience3-2', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('2493134d-4688-4b09-883a-23ab470b20de', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Logistics Company 0', 'tanker', 'Senior Driver', 4, '2021-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience4-0', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('304791c0-90ad-4f6e-bb65-09d1700cad31', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Logistics Company 0', 'tanker', 'Driver', 5, '2011-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience6-0', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('308cb65e-a832-4ae7-ac8c-990c0af79caa', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Logistics Company 0', 'container', 'Fleet Driver', 5, '2012-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience2-0', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('34c49143-fd54-4745-9ad9-369f92c2e245', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Logistics Company 1', 'tanker', 'Fleet Driver', 10, '2018-07-30', '2018-07-30', 0, 'https://via.placeholder.com/300?text=Experience8-1', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('378591f4-1689-4c48-a13c-c4cccc40100a', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Logistics Company 1', 'container', 'Driver', 8, '2016-07-30', '2016-07-30', 0, 'https://via.placeholder.com/300?text=Experience2-1', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('3c58cf77-bd44-47cb-b68a-b1958c90fe09', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Logistics Company 3', 'container', 'Fleet Driver', 3, '2017-07-30', '2017-07-30', 0, 'https://via.placeholder.com/300?text=Experience2-3', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('441bb029-a35a-4aa0-94c4-f577ffc3f165', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'Logistics Company 1', 'container', 'Lead Driver', 7, '2017-07-30', '2017-07-30', 0, 'https://via.placeholder.com/300?text=Experience5-1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4b83e817-a570-488c-953b-3f88a452e4b8', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'Logistics Company 0', 'tanker', 'Lead Driver', 4, '2018-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience9-0', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4c020c35-b44c-45dc-a172-09c42ef11869', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'Logistics Company 2', 'truck', 'Fleet Driver', 8, '2011-07-30', '2011-07-30', 0, 'https://via.placeholder.com/300?text=Experience2-2', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('5fd8e8ca-a090-484d-a25a-1ec84591d618', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Logistics Company 3', 'truck', 'Lead Driver', 8, '2011-07-30', '2011-07-30', 0, 'https://via.placeholder.com/300?text=Experience4-3', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('73192dcb-ce2f-425b-9446-54d980f4bcf1', '85ebf44e-3021-484a-8629-761a464da7ae', 'Logistics Company 1', 'truck', 'Lead Driver', 4, '2016-07-30', '2016-07-30', 0, 'https://via.placeholder.com/300?text=Experience7-1', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('74d4c4aa-1c12-41f8-a419-328fc8d4ce5a', '85ebf44e-3021-484a-8629-761a464da7ae', 'Logistics Company 0', 'truck', 'Driver', 4, '2021-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience7-0', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('9c7f9b73-632e-43d0-bbf2-190c6723e36b', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Logistics Company 2', 'truck', 'Lead Driver', 5, '2023-07-30', '2023-07-30', 0, 'https://via.placeholder.com/300?text=Experience4-2', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a8b13507-c498-4919-84d1-60e80c7c49a4', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Logistics Company 1', 'truck', 'Fleet Driver', 10, '2022-07-30', '2022-07-30', 0, 'https://via.placeholder.com/300?text=Experience6-1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b0a5faad-c9c1-4890-9ef7-be6284db96b1', '8089066b-5020-42f8-a409-b0f3144e91b8', 'Logistics Company 0', 'tanker', 'Lead Driver', 5, '2018-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience1-0', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('c1830ebc-4cad-4615-840b-4107db5225a1', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Logistics Company 3', 'container', 'Driver', 8, '2018-07-30', '2018-07-30', 0, 'https://via.placeholder.com/300?text=Experience6-3', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d4ef8c8f-9bb7-4fde-9c78-2acfffdf512d', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'Logistics Company 1', 'truck', 'Driver', 8, '2020-07-30', '2020-07-30', 0, 'https://via.placeholder.com/300?text=Experience3-1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('dc90c848-5269-4f4a-85a1-4d3bde05e7f1', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'Logistics Company 0', 'trailer', 'Driver', 5, '2018-07-30', NULL, 1, 'https://via.placeholder.com/300?text=Experience8-0', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f6bd8432-55a9-4ee4-961b-f178cfda3d21', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'Logistics Company 2', 'container', 'Lead Driver', 4, '2013-07-30', '2013-07-30', 0, 'https://via.placeholder.com/300?text=Experience6-2', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f87a2c83-6587-4fc6-887c-5be7b6fddecb', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'Logistics Company 1', 'trailer', 'Lead Driver', 2, '2021-07-30', '2021-07-30', 0, 'https://via.placeholder.com/300?text=Experience4-1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_licenses`
--

CREATE TABLE `driver_licenses` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `license_type` varchar(255) NOT NULL,
  `date_of_issue` date NOT NULL,
  `date_of_expiry` date NOT NULL,
  `issued_by_state` varchar(255) NOT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_licenses`
--

INSERT INTO `driver_licenses` (`uuid`, `driver_uuid`, `license_number`, `license_type`, `date_of_issue`, `date_of_expiry`, `issued_by_state`, `document_url`, `is_verified`, `verified_at`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('03ce0a27-065d-459f-8b63-57e5b823c458', '85ebf44e-3021-484a-8629-761a464da7ae', 'DL-+919000000007-163', 'HPMV', '2021-07-30', '2031-07-30', 'GJ', 'https://via.placeholder.com/300?text=License7', 1, '2026-04-23 18:03:28', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('074e2aa3-a82f-4064-9423-ee44601c8e0e', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'DL-+919000000005-597', 'HPMV', '2021-07-30', '2030-07-30', 'DL', 'https://via.placeholder.com/300?text=License5', 1, '2026-05-26 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4cf5be9f-6ee2-41e0-91a7-9d516fa383fd', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'DL-+919000000010-308', 'HMV', '2024-07-30', '2029-07-30', 'DL', 'https://via.placeholder.com/300?text=License10', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4e50aaed-8ddc-4ade-a696-456fd999290c', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'DL-+919000000009-846', 'HMV', '2025-07-30', '2028-07-30', 'DL', 'https://via.placeholder.com/300?text=License9', 0, NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('543dc1f5-224e-4f2a-8d29-6a50b7e6d0af', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'DL-+919000000008-118', 'HMV', '2023-07-30', '2029-07-30', 'MH', 'https://via.placeholder.com/300?text=License8', 0, NULL, NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('5ec6908c-c1be-42d3-9856-47cddd724df3', '8089066b-5020-42f8-a409-b0f3144e91b8', 'DL-+919000000001-754', 'LMV', '2023-07-30', '2029-07-30', 'MH', 'https://via.placeholder.com/300?text=License1', 1, '2026-06-13 18:03:26', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('772b6bd3-fef4-40d7-b86c-0a165e36efbb', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'DL-+919000000006-914', 'LMV', '2023-07-30', '2030-07-30', 'MH', 'https://via.placeholder.com/300?text=License6', 1, '2026-07-19 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('c5bbd3cd-c3c5-40c2-8dcb-2360afb1216d', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'DL-+919000000002-618', 'HPMV', '2025-07-30', '2028-07-30', 'MH', 'https://via.placeholder.com/300?text=License2', 1, '2026-06-20 18:03:26', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('c6acada4-2b82-4bc0-9b64-c0320df86920', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'DL-+919000000003-835', 'HPMV', '2021-07-30', '2028-07-30', 'TN', 'https://via.placeholder.com/300?text=License3', 1, '2026-04-27 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('e80d7a94-de7b-4ac5-9621-17512c853eb8', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'DL-+919000000004-669', 'HPMV', '2024-07-30', '2029-07-30', 'MH', 'https://via.placeholder.com/300?text=License4', 1, '2026-05-12 18:03:27', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_profiles`
--

CREATE TABLE `driver_profiles` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `pan_number` varchar(255) DEFAULT NULL,
  `pan_verified` tinyint(1) NOT NULL DEFAULT 0,
  `bank_account_number` varchar(255) DEFAULT NULL,
  `bank_ifsc_code` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `vehicle_type` varchar(255) DEFAULT NULL,
  `preferred_area` varchar(255) DEFAULT NULL,
  `languages_spoken` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages_spoken`)),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_profiles`
--

INSERT INTO `driver_profiles` (`uuid`, `driver_uuid`, `pan_number`, `pan_verified`, `bank_account_number`, `bank_ifsc_code`, `bank_name`, `account_holder_name`, `profile_photo_url`, `bio`, `vehicle_type`, `preferred_area`, `languages_spoken`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('03f38eec-6e8a-4ca6-a35c-b494c07b06d9', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'PAN52816331', 0, '9876543210000009', 'SBIN0000009', 'State Bank of India', 'Driver 9', 'https://via.placeholder.com/300?text=Driver9', 'Professional driver with 5 years of experience in logistics.', 'container', 'East', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('7bc9127a-54a1-4af9-bfad-036a36b75139', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'PAN43342690', 1, '9876543210000003', 'SBIN0000003', 'State Bank of India', 'Driver 3', 'https://via.placeholder.com/300?text=Driver3', 'Professional driver with 19 years of experience in logistics.', 'container', 'East', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('ace70db5-c69e-4827-bb02-02c51b5634ae', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'PAN39085099', 0, '9876543210000008', 'SBIN0000008', 'State Bank of India', 'Driver 8', 'https://via.placeholder.com/300?text=Driver8', 'Professional driver with 8 years of experience in logistics.', 'truck', 'South', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b7d34808-3c48-420b-8cb2-0ff030d52a73', '85ebf44e-3021-484a-8629-761a464da7ae', 'PAN54036449', 1, '9876543210000007', 'SBIN0000007', 'State Bank of India', 'Driver 7', 'https://via.placeholder.com/300?text=Driver7', 'Professional driver with 10 years of experience in logistics.', 'truck', 'Central', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ba6919b3-96ef-42b9-9cd3-5eda32e545cd', '8089066b-5020-42f8-a409-b0f3144e91b8', 'PAN68417148', 1, '9876543210000001', 'SBIN0000001', 'State Bank of India', 'Driver 1', 'https://via.placeholder.com/300?text=Driver1', 'Professional driver with 10 years of experience in logistics.', 'container', 'Central', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('bb1adaba-2162-4c0e-aa76-db54eb6bbe77', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'PAN19126199', 1, '9876543210000005', 'SBIN0000005', 'State Bank of India', 'Driver 5', 'https://via.placeholder.com/300?text=Driver5', 'Professional driver with 14 years of experience in logistics.', 'truck', 'North', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d657b645-31f0-4fb5-abc0-8c635ca5c38e', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'PAN81193505', 1, '9876543210000006', 'SBIN0000006', 'State Bank of India', 'Driver 6', 'https://via.placeholder.com/300?text=Driver6', 'Professional driver with 8 years of experience in logistics.', 'trailer', 'Central', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f055250f-cdf9-4bf9-88a7-38f674ba801b', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', 'PAN19450443', 1, '9876543210000004', 'SBIN0000004', 'State Bank of India', 'Driver 4', 'https://via.placeholder.com/300?text=Driver4', 'Professional driver with 15 years of experience in logistics.', 'container', 'South', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f0c6b9e6-ec08-4ffa-8086-bff2f4e334f7', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'PAN25858007', 0, '9876543210000010', 'SBIN0000010', 'State Bank of India', 'Driver 10', 'https://via.placeholder.com/300?text=Driver10', 'Professional driver with 10 years of experience in logistics.', 'container', 'East', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('f62d0e63-d354-4edb-8786-f78b28b9f1dd', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'PAN91607916', 1, '9876543210000002', 'SBIN0000002', 'State Bank of India', 'Driver 2', 'https://via.placeholder.com/300?text=Driver2', 'Professional driver with 12 years of experience in logistics.', 'truck', 'West', '[\"Hindi\",\"English\",\"Marathi\"]', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driver_ratings`
--

CREATE TABLE `driver_ratings` (
  `uuid` char(36) NOT NULL,
  `driver_uuid` char(36) NOT NULL,
  `rater_uuid` char(36) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `category` varchar(255) DEFAULT NULL,
  `review` text DEFAULT NULL,
  `rated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `trip_id` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_ratings`
--

INSERT INTO `driver_ratings` (`uuid`, `driver_uuid`, `rater_uuid`, `rating`, `category`, `review`, `rated_at`, `trip_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('023b8778-c60d-4150-bb22-acd2aa0873c2', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Safe and courteous', '2026-07-27 12:33:26', 'TRIP-vcZFdVgOCr', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0253f12d-41bb-45e1-b8f0-a4278a9e6d36', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Good delivery experience', '2026-07-18 12:33:28', 'TRIP-N6fUxzoVK1', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('02e0a168-da3b-42db-9ec5-974c14a881db', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'punctuality', 'On time and reliable', '2026-07-02 12:33:26', 'TRIP-ZIATM0Lrlt', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('03243e98-c1ee-4698-9bff-f50f143ddc60', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'cleanliness', 'Great communication', '2026-07-29 12:33:28', 'TRIP-7xlGT6hHI4', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('03b11180-ad33-46a3-9e66-e8298d0753e3', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'On time and reliable', '2026-07-05 12:33:28', 'TRIP-BsU6LuyVt5', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('03f9f5ea-a070-4808-8c3b-42e8bf3a8257', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Good delivery experience', '2026-07-29 12:33:26', 'TRIP-VHuhWDtDUr', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('04fe6489-2de9-41c9-b03c-c3c285389176', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'Safe and courteous', '2026-07-08 12:33:27', 'TRIP-Ufa2y8GZKs', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('050e0188-8b2f-44b9-9ad5-2a87539448fb', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Good delivery experience', '2026-07-27 12:33:26', 'TRIP-H0VVgSEVou', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0622f924-23e4-4fa8-a537-864987a1ea9c', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'Safe and courteous', '2026-07-29 12:33:28', 'TRIP-zRiJ2r3ULD', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('06acd325-07ac-4d5d-8c8d-a81506a7caf9', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Good delivery experience', '2026-07-10 12:33:28', 'TRIP-4AikqGhz3d', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('073f4673-edd3-472b-9efb-6f376bc6af34', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'On time and reliable', '2026-07-03 12:33:28', 'TRIP-A4MOhDrfsV', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('08188a4b-e7e7-43e0-8905-5a0fec29a93f', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'cleanliness', 'Safe and courteous', '2026-07-16 12:33:26', 'TRIP-RAo3oKnGPZ', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0840961f-90cc-44e2-a462-1eb39b770694', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Safe and courteous', '2026-07-01 12:33:28', 'TRIP-BskABRnlJ9', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('085b0fae-89c9-428f-8f76-851186580122', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Good delivery experience', '2026-07-27 12:33:26', 'TRIP-p9cZYtW9P8', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('08b36a18-5b8b-444f-9ec6-f285f36e6e69', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Safe and courteous', '2026-07-08 12:33:28', 'TRIP-OlX75m2WYt', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('0a864cdf-f0eb-4601-b29c-4e3b16cf11cc', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'Safe and courteous', '2026-07-12 12:33:28', 'TRIP-AH8dVtvTVB', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('0c44416e-abbf-4c28-9822-2880df540ea4', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'On time and reliable', '2026-07-21 12:33:26', 'TRIP-h7uOkiVDe8', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0d1c05d8-1a16-4428-aad6-4b3ffa9bdf15', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'punctuality', 'Good delivery experience', '2026-07-02 12:33:27', 'TRIP-riDu7atcQZ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('0d467691-229f-48c1-9660-6bd910ec7f41', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Safe and courteous', '2026-07-13 12:33:26', 'TRIP-VcEUNhs8BL', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('0d6f48a9-851b-458f-b361-9dbc1d1286a8', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Great communication', '2026-07-18 12:33:28', 'TRIP-wPTP8EA4Vw', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('0da7bb1b-67d1-473e-8207-81ccd5c73e83', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Safe and courteous', '2026-07-24 12:33:28', 'TRIP-FS2A1r8a3i', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('0f666cc0-699f-43f3-a19c-59eb89d9aa13', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Excellent driver, very professional', '2026-07-12 12:33:28', 'TRIP-VKeC9iAQtq', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1029cecd-f400-41e0-8f32-74b9df68e5d1', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'communication', 'On time and reliable', '2026-07-17 12:33:26', 'TRIP-N7Im9fNc0g', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('1062785b-a350-4355-9951-22d54aa68001', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Safe and courteous', '2026-07-27 12:33:27', 'TRIP-tF4200c0T9', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('112ef3eb-4038-4648-b88b-2981776460b1', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Excellent driver, very professional', '2026-07-14 12:33:27', 'TRIP-AwS0QPm434', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('13101078-ba94-43ef-9f7a-32b718cdd6e5', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Safe and courteous', '2026-07-15 12:33:28', 'TRIP-xtZl0mG3pB', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1341849b-9c4f-4e0f-ad10-a9b8651a5b5b', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Excellent driver, very professional', '2026-07-15 12:33:27', 'TRIP-L1lPbY4D1c', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('15605a7f-2084-4efe-8619-f3fb89fac782', '51b7ee4a-d6a2-4f95-b8d2-345ed0774866', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'On time and reliable', '2026-07-25 12:33:27', 'TRIP-IQ6oaDxH0K', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('1560e1d4-081b-42f3-9430-e2bbcc8b4662', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Safe and courteous', '2026-07-16 12:33:28', 'TRIP-mf9lzMnpyZ', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('15df011a-96a0-4315-8634-b94e49829239', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'On time and reliable', '2026-07-11 12:33:28', 'TRIP-hwADKhU2oR', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('163a5f9d-8642-4572-98f9-3e48d2510b3e', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'safety', 'Excellent driver, very professional', '2026-07-19 12:33:28', 'TRIP-FMv2322P8j', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('174eb196-fdf6-4285-a3f0-eb02aee82a03', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'On time and reliable', '2026-07-26 12:33:27', 'TRIP-uWlNGxKzDf', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('194c82d5-cf98-448b-8d6f-9e90cbf23c06', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'communication', 'Great communication', '2026-07-24 12:33:28', 'TRIP-6SeoMpOIwQ', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1a2aed56-f814-4758-8313-3787bf973538', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Great communication', '2026-07-06 12:33:28', 'TRIP-RBwUsgJYJa', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1b5f0fa2-5892-4e28-95d5-e6af8d87578e', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'Excellent driver, very professional', '2026-07-11 12:33:28', 'TRIP-c7iXrK9teC', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1bd8c856-b012-4b6d-ba8e-86606ee2aee1', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'On time and reliable', '2026-07-27 12:33:27', 'TRIP-4i4EPPHaWN', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('1c486149-c4c8-4fcd-b8fe-774e38f6669d', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Safe and courteous', '2026-07-19 12:33:28', 'TRIP-DSOLwKOsCn', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1cd9f2d4-94b1-487f-8259-10981f32a6fc', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'Good delivery experience', '2026-07-16 12:33:28', 'TRIP-7N9BdMmRT7', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1d4ac578-9e42-4563-824f-5d446c5e989a', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Excellent driver, very professional', '2026-07-11 12:33:28', 'TRIP-nILA1PiPd6', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1ec8bfc7-4a44-4ffe-94b1-f2531c30123c', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'communication', 'On time and reliable', '2026-07-26 12:33:28', 'TRIP-yqhvfRi64g', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('1f95f26f-babe-431b-bc3c-c1df698f5798', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Great communication', '2026-07-07 12:33:28', 'TRIP-2N5HnUSqWL', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('2000de3d-2a8e-4596-856c-6766fd480b2a', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'Excellent driver, very professional', '2026-07-17 12:33:28', 'TRIP-M63ipz2vzU', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('217ed47e-2f9b-48b3-bd7a-b8d388441c46', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'communication', 'Good delivery experience', '2026-07-09 12:33:27', 'TRIP-dmVrFpfckN', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('21e435c3-abc9-4663-8daa-c887522402da', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Good delivery experience', '2026-07-17 12:33:26', 'TRIP-eP9KZhiFza', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('235fa550-c485-4abb-9f10-2a7d07d9e6f7', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Good delivery experience', '2026-07-02 12:33:28', 'TRIP-cgvweAEjeU', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('2397e265-3e9a-4bd0-a5fc-64243e06b6aa', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Excellent driver, very professional', '2026-07-09 12:33:28', 'TRIP-1TdKqOJtO7', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('2431f2b6-0c4e-45df-b02c-5e8ac289a9bd', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'punctuality', 'Excellent driver, very professional', '2026-07-17 12:33:28', 'TRIP-10sGjOiUZW', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('24cf50e5-7a25-49a2-8edf-4b672603318b', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'cleanliness', 'Excellent driver, very professional', '2026-07-04 12:33:26', 'TRIP-AleB1e9qnO', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('25794ccf-a0e7-4abf-8f5f-d16eb51ff724', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Great communication', '2026-07-27 12:33:28', 'TRIP-l4qotWzSt0', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('27bfccb1-d564-4ca0-a5e7-9b5de3d67282', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'On time and reliable', '2026-07-20 12:33:27', 'TRIP-MOHi6tZFv7', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('282ae560-d39c-4d7c-bab1-626011674b1c', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Great communication', '2026-06-30 12:33:27', 'TRIP-LkF36CFt2w', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('283e6aaa-6a6c-49d5-abf1-8dbf15a2442d', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'safety', 'Good delivery experience', '2026-07-04 12:33:26', 'TRIP-Ih1BVh1wvo', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('2af4bf77-b3bc-4c39-abb0-e31162c64473', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'punctuality', 'On time and reliable', '2026-07-16 12:33:27', 'TRIP-A0BNMjKGvq', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('2ba5c09f-008f-4c19-9e49-58fbe127317e', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Excellent driver, very professional', '2026-07-01 12:33:27', 'TRIP-Z46TW5DE59', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('2dcdc996-eb1e-4d86-9f48-bb157a92c416', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'On time and reliable', '2026-07-13 12:33:27', 'TRIP-0rDuzivvw1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('2e93a347-5748-4db3-a5ce-5deebc5924f1', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Safe and courteous', '2026-07-02 12:33:28', 'TRIP-aXGWjtl4Wo', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('2eadd026-fd5d-4d78-90e9-7e092db82daa', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Good delivery experience', '2026-07-28 12:33:27', 'TRIP-NZy1tnSluC', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('2f16b460-fe56-4f26-b6ca-6d3c6869f4f6', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Safe and courteous', '2026-07-16 12:33:27', 'TRIP-bmcGaTiASi', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('300a4c8b-3ca3-4c91-8c5e-aca9e613f448', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'Great communication', '2026-07-29 12:33:27', 'TRIP-wIcql4A334', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('30b26530-28a2-4442-92ab-776cd2197c2b', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'On time and reliable', '2026-07-29 12:33:26', 'TRIP-5LazjsP0ub', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('316deb39-74c3-44b0-b51b-9d99fcc55fe1', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'On time and reliable', '2026-07-14 12:33:28', 'TRIP-o35DKakkto', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3201a09e-d206-4aa1-ba31-5c530ffeb4b0', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'On time and reliable', '2026-07-02 12:33:26', 'TRIP-IchbJY3kMR', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('339d8685-bf14-4e3e-9cf1-020eb344f4da', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'cleanliness', 'Good delivery experience', '2026-07-10 12:33:27', 'TRIP-M26LjEtAvT', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('34ee8eb5-30fd-42b1-a15e-2a0e247a9b93', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'communication', 'Good delivery experience', '2026-07-16 12:33:28', 'TRIP-o36kceLJib', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('35996ad5-b631-4902-88c9-61ff0c14dd8b', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'safety', 'Excellent driver, very professional', '2026-07-06 12:33:27', 'TRIP-P4ccgCeR9U', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('366528b8-83f8-4a8f-91ae-dd5ffdea24af', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Great communication', '2026-07-02 12:33:28', 'TRIP-p6voiPut1Z', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3751eadd-1455-47d8-b86a-4a496214c1ea', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Great communication', '2026-07-25 12:33:28', 'TRIP-wP1WI30GRD', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('393393aa-2399-49ea-81d9-e879788f6ea7', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Great communication', '2026-07-23 12:33:27', 'TRIP-x95yHWYDVJ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('3a1ccb65-9840-4a55-a862-4f6b10816cfa', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'Excellent driver, very professional', '2026-07-18 12:33:28', 'TRIP-GREFZIIl0x', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3aa92253-bf1c-4d68-80e9-8de48bd1f9be', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'On time and reliable', '2026-07-20 12:33:27', 'TRIP-Cku7v8yO3a', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('3aabd8e1-ae14-4db3-8aec-2e8bb2b5e2c9', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Safe and courteous', '2026-07-12 12:33:28', 'TRIP-5NWv9gqsEa', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3bbdae28-4f6a-4cfb-8528-13619578df06', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'Safe and courteous', '2026-07-26 12:33:28', 'TRIP-8OToVsOywp', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3beb26b4-f63a-45e7-9a11-2eed3a5c4204', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Excellent driver, very professional', '2026-07-28 12:33:26', 'TRIP-YMxmVOHSuP', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('3ca974cb-c337-425d-b70f-9fcf00bbf28b', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'safety', 'Safe and courteous', '2026-07-15 12:33:27', 'TRIP-MyXy53JfGO', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('3dee9816-da9d-4948-9525-631b1fab62ba', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Good delivery experience', '2026-07-07 12:33:28', 'TRIP-Q8tIsjxJA4', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('3e67e2d0-51f5-4dc5-88a8-d2030d41f23e', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'On time and reliable', '2026-07-25 12:33:27', 'TRIP-1Ck4vRGweK', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4017bfec-e18f-4075-b964-fcb9f4134519', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Great communication', '2026-07-28 12:33:26', 'TRIP-tSjv9P1r19', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('402e90ea-e4dc-4022-a520-777bfcb2b5a2', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'On time and reliable', '2026-07-04 12:33:28', 'TRIP-fiWW9Ecg9k', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('406f6892-2085-419c-9148-280db28ba1d2', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'communication', 'Safe and courteous', '2026-07-18 12:33:26', 'TRIP-KqzSBwvk0u', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('418a84a9-6394-482d-af9f-0e0958f8c4a7', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Safe and courteous', '2026-07-08 12:33:27', 'TRIP-cIpsl6ydiv', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('42d45ff4-fe36-478a-8e66-30dd77066470', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'Good delivery experience', '2026-07-12 12:33:27', 'TRIP-NqGEUaGIl0', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('432b892d-55fa-41dd-be0a-0de3e37575ad', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'Excellent driver, very professional', '2026-07-01 12:33:27', 'TRIP-gBUj6uioXt', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('452e5093-4f58-4958-9be1-3bed43e3b6a7', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Excellent driver, very professional', '2026-07-07 12:33:26', 'TRIP-BRqmDdjEXN', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('459c0cd6-3a26-491a-a38d-33b5abaa4696', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Good delivery experience', '2026-07-07 12:33:27', 'TRIP-gThrHGXoTb', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('45a5bac6-e575-45ac-9570-e3afa50c3560', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Great communication', '2026-07-14 12:33:27', 'TRIP-PVuLFd9sKQ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('466bd4bc-79d6-4c48-a06a-e9ee2632e208', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Great communication', '2026-07-16 12:33:27', 'TRIP-6lcyvWE0i2', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('46a66609-4c92-4112-a164-d41c0e48ce93', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'On time and reliable', '2026-07-07 12:33:27', 'TRIP-hSdbc4EJ9g', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('47d8f868-98f8-4d2f-9965-c07eae9fcbd1', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Safe and courteous', '2026-07-28 12:33:27', 'TRIP-lpYvjHwfI4', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('480abb1b-fee8-49bb-9b03-2de3082a6771', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'punctuality', 'Safe and courteous', '2026-07-18 12:33:27', 'TRIP-s2xHApsqtg', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('482c17d4-b58a-41aa-9cdf-f6075354dcc5', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Safe and courteous', '2026-07-02 12:33:27', 'TRIP-JDnH1qTSax', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('497c4b63-871a-4d1d-9365-cc9e2a6bbe31', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Excellent driver, very professional', '2026-07-24 12:33:26', 'TRIP-Hla6J3Rozm', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('4a4bd3d8-95b6-43ff-8642-ae093c43adcd', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'On time and reliable', '2026-07-18 12:33:28', 'TRIP-zR4tir18TK', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4aefddd1-c4fe-420a-ae6b-7682c5b8bfe3', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'cleanliness', 'On time and reliable', '2026-07-20 12:33:27', 'TRIP-MrtAeTE2a4', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4b6b09a0-ae0b-4593-9bcd-ec4114ce18ac', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'cleanliness', 'On time and reliable', '2026-06-30 12:33:26', 'TRIP-BXnA23sZBi', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('4c23d723-28c4-4233-aee3-f38c309f479d', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'Safe and courteous', '2026-07-13 12:33:26', 'TRIP-IhEtMFXU2R', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('4cc25e10-f79c-4854-a73f-0597b372b91c', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Good delivery experience', '2026-07-19 12:33:27', 'TRIP-FfXnw1XFXL', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('4cea0866-266f-41fc-b29f-f188bf8cab0c', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'safety', 'Great communication', '2026-07-09 12:33:28', 'TRIP-exuMNzPil3', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4e105de6-af53-44da-bf6e-a0d4d67e5434', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Good delivery experience', '2026-07-18 12:33:28', 'TRIP-jq6EZo6Kdm', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4e9a79f9-f513-4fc7-9e76-104a7de570ca', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Good delivery experience', '2026-07-12 12:33:28', 'TRIP-w8dWaD2BVz', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('4ef0d1f6-04ae-40b5-aed3-bc30d588da8d', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'safety', 'Great communication', '2026-07-09 12:33:28', 'TRIP-MAYFbY4ZC6', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('50bea4b8-bb22-48bd-b3ec-bae4db6ffd50', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Great communication', '2026-07-23 12:33:28', 'TRIP-bfTB08oiQD', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('51749e80-18aa-4faa-bc05-23d5dc1f6f90', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Great communication', '2026-07-16 12:33:26', 'TRIP-l3N2pJeiCf', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('51ed3fde-b9e2-4ba8-ad98-ec23a9074b74', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'punctuality', 'Safe and courteous', '2026-07-26 12:33:27', 'TRIP-y6uY4OfmqV', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('5255878f-fabe-4e95-8b73-5e4c940cee1b', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'On time and reliable', '2026-07-14 12:33:26', 'TRIP-ayqJOLvNBX', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('53380e28-1151-47de-960c-b69f05613cf2', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'Good delivery experience', '2026-07-20 12:33:27', 'TRIP-nTFvrJ2pln', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('540d7ef6-982c-4dce-b8cb-85329da7cdd5', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'safety', 'Safe and courteous', '2026-07-07 12:33:28', 'TRIP-Efqeju0TCF', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('545f2236-dc9d-4a3f-9809-18cdc5592111', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'safety', 'Great communication', '2026-07-08 12:33:28', 'TRIP-RBXTxT2TLz', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('54b65d36-518f-41c6-968c-61ff4b079b67', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'communication', 'Excellent driver, very professional', '2026-07-15 12:33:26', 'TRIP-p0tKkZy64B', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('55c941f9-8e35-408b-8510-aecbf780a362', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Excellent driver, very professional', '2026-07-07 12:33:28', 'TRIP-eth3D93ORC', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('5612b5c0-059f-4b83-8d7a-879924649586', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Safe and courteous', '2026-07-14 12:33:26', 'TRIP-NaaBT0TD2g', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('5681ef53-07d7-4502-a69c-c3f25d9a619b', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'On time and reliable', '2026-07-14 12:33:26', 'TRIP-fHBJ6jKqO2', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('56aa6e60-aa4f-40f5-84b0-55b59e7ff8e6', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'cleanliness', 'On time and reliable', '2026-07-19 12:33:26', 'TRIP-QfnIF7dhD4', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('57808543-bc80-4fee-90f2-2a28bbc61bfc', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'On time and reliable', '2026-07-20 12:33:28', 'TRIP-TsTx50Exv1', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('57aec0b2-2ffa-48be-9d6b-c9db4bb4385c', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'punctuality', 'Excellent driver, very professional', '2026-07-21 12:33:28', 'TRIP-r5uyB4KPex', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('59018ccf-0df9-4250-ab11-94a0cfa1bac0', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Excellent driver, very professional', '2026-07-21 12:33:27', 'TRIP-B4n7ATVMK1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('59d59708-cae5-4ce6-a63b-a41a450fee80', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'safety', 'Safe and courteous', '2026-07-18 12:33:27', 'TRIP-eEiRnPYvHY', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('59dce63c-51ec-4c86-ac87-d5b9300f6ae1', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'Good delivery experience', '2026-07-24 12:33:27', 'TRIP-WRJ2KvT8dy', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('5a12a724-aac5-4ac5-8d9a-c94ab7988a28', '3bc696ba-0d80-42f8-80b5-628830647d2b', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'Safe and courteous', '2026-07-05 12:33:29', 'TRIP-pvORNHb3Rg', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('5c550c63-a102-4002-b799-2783b3caf0ff', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'safety', 'Great communication', '2026-07-17 12:33:28', 'TRIP-d5pjUhWmvj', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('5c59102f-7e54-4783-a1b7-184a444b0fd7', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Good delivery experience', '2026-07-11 12:33:26', 'TRIP-FGqz7lwJrs', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('5db1359e-35f6-4b3b-a3a6-8b6a5aa4c653', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'On time and reliable', '2026-07-22 12:33:28', 'TRIP-f5JQwxfbHE', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('5dfed0f0-5e6f-4f9e-8127-a3ded34fe846', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'punctuality', 'Safe and courteous', '2026-07-04 12:33:27', 'TRIP-Wm8QFU8akl', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('5e131eeb-f132-45ae-a1d0-82134924cf0b', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Great communication', '2026-07-18 12:33:27', 'TRIP-rB8swiZh24', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('5fee41c1-737f-4538-a3c2-da7134fd3b64', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'communication', 'Great communication', '2026-07-09 12:33:26', 'TRIP-dmCK7aH3Ah', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('60c26b56-4259-45af-95c7-a85f60d4fcd7', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'Good delivery experience', '2026-07-07 12:33:27', 'TRIP-FHsJm4z4uI', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('60ed0a52-1db8-414d-9619-6ad8a48bd4a4', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Good delivery experience', '2026-07-21 12:33:27', 'TRIP-kvasfsoroL', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('62213bc8-acab-4204-be56-164b34bd0fbe', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Great communication', '2026-07-29 12:33:26', 'TRIP-CkpMVBU4rI', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('6247a752-5ef8-48b4-878e-7f81ade29e15', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Great communication', '2026-07-06 12:33:26', 'TRIP-7S05G2tNGd', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('62f81a66-bfed-48ad-a4b0-3c02163f138b', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Great communication', '2026-07-25 12:33:28', 'TRIP-3cSJQ6Kj0v', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('634876ba-0bce-498c-a944-fb12538701f3', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'On time and reliable', '2026-07-01 12:33:28', 'TRIP-gABFDeiWoP', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('63636cb8-07ce-435a-a422-74d01119b70b', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'On time and reliable', '2026-07-12 12:33:27', 'TRIP-vlXkvrXlKa', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('63765406-0959-4564-8e8c-f97610995405', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'Great communication', '2026-07-06 12:33:27', 'TRIP-yFhW17Ru1b', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('643ca2e4-610d-4634-b1a0-d6802079383b', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Great communication', '2026-07-13 12:33:28', 'TRIP-lFqZGjaYn1', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('6555842e-ce3a-43c6-8b9b-aa56cff1b363', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Safe and courteous', '2026-07-29 12:33:27', 'TRIP-m4gFrYtvBj', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('65bc4c01-a7a5-418c-b6b0-fe7ff448bd7d', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Excellent driver, very professional', '2026-07-05 12:33:27', 'TRIP-049N8Dfq2U', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('66216465-77e7-4acd-b2f1-a3a3c502a80c', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Great communication', '2026-07-12 12:33:26', 'TRIP-X5V0kTia3z', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('67c90ece-6ba2-4837-a669-167015727c57', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Safe and courteous', '2026-07-07 12:33:26', 'TRIP-VBA0ouSRhT', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('681ffd8f-1f9f-4962-b775-7ab13deea590', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Good delivery experience', '2026-07-07 12:33:28', 'TRIP-3NUIsUVqyX', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('69912ae2-20fe-4f06-9f7f-7d825b6ed182', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Great communication', '2026-07-09 12:33:28', 'TRIP-7hyYXNxs96', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('69b52f8f-cf87-4580-b65f-91946a9ca28d', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Good delivery experience', '2026-07-04 12:33:27', 'TRIP-74PosAp2kH', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('6a9f4278-8a82-4c27-8098-f5e1bfb87374', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'communication', 'Great communication', '2026-07-25 12:33:28', 'TRIP-W5gnrWgGza', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('6cd33b0b-3ba5-4953-bd12-23df561af8b0', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'Safe and courteous', '2026-07-05 12:33:28', 'TRIP-F1xvLDQHe9', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('6f802bbc-24c7-4880-8daf-ffe7bfc2ecdc', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Great communication', '2026-07-06 12:33:28', 'TRIP-8bijWwlpSF', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('71c0b5f7-e639-49c9-81ae-d68e229d6e85', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Safe and courteous', '2026-07-05 12:33:28', 'TRIP-nbfzgyUE6D', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('745e184a-62a8-451f-9516-1e3149f2ac02', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Excellent driver, very professional', '2026-07-03 12:33:27', 'TRIP-0g8MDWZOoJ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('75a94b95-53fc-4979-aaa2-0ec69a9d23c3', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'communication', 'Excellent driver, very professional', '2026-07-21 12:33:27', 'TRIP-RDDFBsvTEC', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('76376249-c512-4842-8d28-7702a7725a99', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Safe and courteous', '2026-07-14 12:33:27', 'TRIP-aFmUd9dA5S', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('7673c6db-6483-4662-a534-93b3e7da088d', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'punctuality', 'On time and reliable', '2026-07-27 12:33:28', 'TRIP-OFZOiV2vL7', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('76ac2ef1-8648-4bee-ae61-20ea57e25e76', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Safe and courteous', '2026-07-23 12:33:27', 'TRIP-4Oe2bk9145', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('7912988f-26c2-4974-a585-b6a5a7e5d027', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'On time and reliable', '2026-07-13 12:33:28', 'TRIP-hTRLGdaQB4', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('79bfe643-3105-4767-829f-3591895235f0', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'Good delivery experience', '2026-07-21 12:33:27', 'TRIP-UdPhS6k79t', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('7ca9b7d0-56e1-4693-98d9-f42c36e4d93c', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'punctuality', 'On time and reliable', '2026-06-30 12:33:27', 'TRIP-oxQkb4pq1t', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('7d2da8c1-ceb0-4aee-b845-f253666c4977', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'safety', 'Great communication', '2026-07-29 12:33:26', 'TRIP-o0eJKiU4gN', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('7d8748bf-d184-4279-bb51-9db11b7ec3d8', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Great communication', '2026-07-10 12:33:26', 'TRIP-E0aLE4NHGM', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('808c4b5a-9ab3-46c6-9be4-9ff271cfe353', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'safety', 'Good delivery experience', '2026-07-27 12:33:28', 'TRIP-1FabmCX6Vk', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('80f4cb6e-aa64-4d42-8eec-c8afd24e3582', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'communication', 'Great communication', '2026-07-02 12:33:27', 'TRIP-AMLMaJ1bhh', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('81175c51-549a-4acc-8b51-d42518ba8d36', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Excellent driver, very professional', '2026-07-24 12:33:26', 'TRIP-0QP0HekTbh', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('82bcac19-8332-412e-b0d4-b958cfeeb78a', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Good delivery experience', '2026-07-02 12:33:28', 'TRIP-CNlqmxJJSy', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('8307fd6d-3668-4854-af65-0ea391121b49', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Good delivery experience', '2026-07-19 12:33:28', 'TRIP-EmlSZzrt5m', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('839e21c8-9384-41a1-be98-5aaea78c2dbb', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'safety', 'Good delivery experience', '2026-07-10 12:33:28', 'TRIP-TVXJCDUZ0A', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('8497db11-c26e-4d03-bd75-dd6a1f3f0ce4', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'safety', 'On time and reliable', '2026-07-02 12:33:28', 'TRIP-PVLOaTmsW3', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('85deee9f-2192-49f0-88ba-9e2ab12dce08', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'communication', 'Good delivery experience', '2026-07-23 12:33:28', 'TRIP-GFi4sgrw6g', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('861d53f2-d56f-4c09-a951-aa11e5305449', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Great communication', '2026-07-05 12:33:27', 'TRIP-7oGX2VTJ5s', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('86822a30-5062-4a9d-93e7-25e8a9001a54', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'communication', 'Excellent driver, very professional', '2026-07-25 12:33:26', 'TRIP-yfHC6GLUI8', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('87846dee-347b-46d8-b720-eec85421eaaa', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'Great communication', '2026-07-15 12:33:28', 'TRIP-v37YOHPfZ8', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('87bfdba4-ad9f-4786-be5c-bc9ecdf60501', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Safe and courteous', '2026-07-22 12:33:28', 'TRIP-RKpAZxQc74', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('8a6c7e62-ce4b-430d-8d91-2d7b0d9f3160', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'Great communication', '2026-07-09 12:33:27', 'TRIP-Ows10sVrzt', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('8b1bdec4-1ad6-439b-833c-8862a24e2748', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Good delivery experience', '2026-07-04 12:33:26', 'TRIP-c3dRcfisFI', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('8b649686-5283-4d87-8095-1fab08624a01', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'Safe and courteous', '2026-07-23 12:33:26', 'TRIP-lcjUXlsAOc', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('8b6fab90-c5f8-4a13-bcff-927ae1de685a', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'On time and reliable', '2026-07-29 12:33:26', 'TRIP-AuHWEX6Ljm', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('8b8cea1f-f290-4411-9c45-3bba0716aa77', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Good delivery experience', '2026-07-05 12:33:27', 'TRIP-HNJHBqfELM', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('8c39eb4c-e0fd-40f0-99b0-0fe67e20bece', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Safe and courteous', '2026-07-08 12:33:28', 'TRIP-vbo0tOvftA', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('8d57855c-e3be-4565-8f40-ec1a3aebf6ee', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'Safe and courteous', '2026-07-21 12:33:28', 'TRIP-WGizNT4DmN', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('90956ea4-2666-4b36-b78a-2efc61d00971', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'On time and reliable', '2026-07-05 12:33:26', 'TRIP-7DicZdMvW5', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('915940b8-fa54-4896-ac50-ce48ab20fafc', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'Great communication', '2026-07-20 12:33:27', 'TRIP-g2GeGJ6UG8', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('921dee2e-1b4d-4b4e-8037-421799e814c5', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Good delivery experience', '2026-07-25 12:33:26', 'TRIP-m2uSdQ7Gst', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('9220945c-edfc-4418-92c2-ef5d8ad434b3', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Safe and courteous', '2026-07-26 12:33:27', 'TRIP-xCAcgb7Voz', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('92e710c8-39ee-480d-8caf-a7e6fd723523', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'safety', 'Safe and courteous', '2026-07-19 12:33:28', 'TRIP-TaEpLSaM33', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('958e175b-cd87-4821-a822-4fefbeb637e9', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'Good delivery experience', '2026-07-17 12:33:26', 'TRIP-9et7cKKmnC', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('97850d69-cdae-4dce-9a46-4462862d314d', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'Excellent driver, very professional', '2026-07-21 12:33:26', 'TRIP-9N7S8S27oF', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('98be5b32-c9b9-4765-a350-5efd2bd238f1', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'Excellent driver, very professional', '2026-07-06 12:33:26', 'TRIP-SSSAe7g8uE', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('98d4fcc7-6617-4e73-b0ab-9760df09064f', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Good delivery experience', '2026-07-18 12:33:28', 'TRIP-E2MbXTITyA', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('99031c3f-22df-4437-b0cd-be9c52fdd29a', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Safe and courteous', '2026-07-04 12:33:26', 'TRIP-JVWzgTqvcJ', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('999b5023-e230-44ec-a686-70a9bbc92370', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'On time and reliable', '2026-07-18 12:33:26', 'TRIP-sUunqqaMAQ', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL);
INSERT INTO `driver_ratings` (`uuid`, `driver_uuid`, `rater_uuid`, `rating`, `category`, `review`, `rated_at`, `trip_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('9c00a7b2-5aa2-4c51-8bf2-34caffc81545', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'Safe and courteous', '2026-07-02 12:33:26', 'TRIP-uusgzHZHLR', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('9c12b7a2-1f3d-4374-8f1b-61d206e15f40', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'Good delivery experience', '2026-07-20 12:33:27', 'TRIP-HB0teOBHVl', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('9c28dd47-10d8-4da6-9bb6-5dc944f3d433', '3bc696ba-0d80-42f8-80b5-628830647d2b', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'Safe and courteous', '2026-07-26 12:33:29', 'TRIP-8TvCQAXxcE', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9cac27ec-4ddd-457d-af2a-27dd3acec618', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Safe and courteous', '2026-07-15 12:33:27', 'TRIP-l8XBr1FDZJ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('9f0617bb-10b0-406b-b0d5-8f7e16a2bb45', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Great communication', '2026-07-11 12:33:26', 'TRIP-rnuM10Kdhf', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('a0830d8c-cab2-4191-8c2f-6ca3dedeedfa', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Great communication', '2026-07-02 12:33:28', 'TRIP-ONFFjDYUj6', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('a0a53a67-1549-4593-8206-0c8b39e32624', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Excellent driver, very professional', '2026-07-12 12:33:27', 'TRIP-ppiFdHAcbM', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a1caebc4-d132-4513-a67a-2d20585f634b', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Safe and courteous', '2026-07-16 12:33:27', 'TRIP-8uBGdjpE6q', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a20bbdd4-65eb-4e07-b203-5618b7253e63', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Safe and courteous', '2026-07-15 12:33:26', 'TRIP-ZE4bSIxynr', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('a2b61adf-4f7f-4d65-b68e-7b2eb110f96f', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'punctuality', 'Great communication', '2026-07-15 12:33:28', 'TRIP-pTCWIMcT7Y', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('a335ee50-57d9-4b2f-a08e-02278d1b5e23', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'Excellent driver, very professional', '2026-07-27 12:33:27', 'TRIP-QelBvrzHrs', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a593b5dd-34e6-4988-bf5a-6d9784e5fb77', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Great communication', '2026-07-05 12:33:28', 'TRIP-9ndJV1DzSR', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('a600ec4b-6561-4144-9b89-cb35280d48ce', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'safety', 'Great communication', '2026-07-15 12:33:28', 'TRIP-eQr9MQCQxN', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('a60926c1-6e0b-47d7-b5fb-b8b7e2777d54', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'On time and reliable', '2026-07-29 12:33:28', 'TRIP-usn8t5mcSC', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('a66b99c1-4d89-4306-892d-b9a210233752', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'On time and reliable', '2026-07-26 12:33:26', 'TRIP-XJXqdQlZLr', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('a7282df8-61cf-4c31-acaa-697f106f611a', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'communication', 'On time and reliable', '2026-07-07 12:33:27', 'TRIP-QJYyv6QvlB', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('a9c0b331-dcf2-4763-b7e1-2ad9cf92c9be', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Excellent driver, very professional', '2026-07-27 12:33:26', 'TRIP-vKuel2LD33', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('a9cf752f-7401-4d46-9c72-1560d1da4106', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Safe and courteous', '2026-07-05 12:33:29', 'TRIP-a2citKXUsh', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('aa4be876-71c4-4a59-a10c-11ad921e1719', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Excellent driver, very professional', '2026-07-20 12:33:28', 'TRIP-OIZVqThiM0', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ad919c5d-6833-434c-9409-b9b384c709c9', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'communication', 'Safe and courteous', '2026-07-27 12:33:28', 'TRIP-IibAddGxRn', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('aeae63a3-c14d-4c68-8c2f-783835f6c975', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Great communication', '2026-07-12 12:33:28', 'TRIP-lSPqV3g73P', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('aee5608e-24ea-45e0-b1bd-94cd0de59f9e', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Great communication', '2026-07-03 12:33:29', 'TRIP-BAvYkswJQm', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('aee6bbcc-80ae-4343-a3d1-5e49e37db0fb', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'On time and reliable', '2026-07-12 12:33:26', 'TRIP-PxfKkvz6fN', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('af825b8f-9383-4f19-8351-84b6fa00c83e', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Excellent driver, very professional', '2026-07-04 12:33:27', 'TRIP-DHJowqNSMa', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b1a6be86-1719-4ba6-b3e1-49d198ae660e', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Great communication', '2026-07-26 12:33:27', 'TRIP-nFu25fr1VV', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b22dd1c1-51dd-4899-91b4-2c54062fa9a9', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'cleanliness', 'On time and reliable', '2026-07-21 12:33:27', 'TRIP-EjpCTncyAo', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b2d0e99f-aeff-4095-8ece-5e4b27a696c0', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'On time and reliable', '2026-07-08 12:33:26', 'TRIP-rvwGBcPLj5', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('b385973e-0a87-4a8c-bd6d-bbd51bd70cf1', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Great communication', '2026-07-20 12:33:28', 'TRIP-58xNWxmOrX', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b5194d1e-28cf-4ef2-bd9c-7665a23f4d86', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'On time and reliable', '2026-07-05 12:33:28', 'TRIP-7XvAm0ALQV', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b562db55-8eb3-43d0-89df-1af9fc35395e', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'communication', 'Excellent driver, very professional', '2026-07-08 12:33:28', 'TRIP-5cBxrotHHa', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b6874142-162e-46a7-b3a7-9886041ad5ec', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'cleanliness', 'Excellent driver, very professional', '2026-07-19 12:33:28', 'TRIP-jEaSrCU2Qn', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b7c8b27e-8b2b-44aa-a260-750e0dcaeba5', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Excellent driver, very professional', '2026-07-15 12:33:27', 'TRIP-oL3cxvuPdD', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b7e6ad1d-a0ff-488d-97d8-a29756f2d0f8', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Excellent driver, very professional', '2026-07-05 12:33:26', 'TRIP-0BN9rKSJ2a', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('b7e91a2f-a399-489e-af9b-97b34192cd10', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Safe and courteous', '2026-07-26 12:33:28', 'TRIP-s025AiJ76T', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b84c1d14-295b-497e-b80d-1b981d1caafc', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Safe and courteous', '2026-07-08 12:33:27', 'TRIP-5vtVdH4zhO', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b85345f1-34c1-4bcf-b938-4a0496bbef73', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'Great communication', '2026-07-10 12:33:28', 'TRIP-faIQZs2OKj', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('b859c5ad-9e3e-4023-8cfa-2e0fd105ee32', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'Excellent driver, very professional', '2026-07-23 12:33:27', 'TRIP-urxbtMJX3I', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('b9059a97-78bc-49a6-b8b3-a318d284c6b9', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'communication', 'Excellent driver, very professional', '2026-07-08 12:33:28', 'TRIP-tDc22JvikQ', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ba47ed1a-d737-4241-b60f-f409ca664008', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'communication', 'Safe and courteous', '2026-07-20 12:33:28', 'TRIP-UXec6rZZFA', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ba95a47f-eb07-4902-bbf1-41faa89d6b81', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Safe and courteous', '2026-07-18 12:33:27', 'TRIP-DS5tyqbhCY', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('bb830cdd-c38d-4924-af85-1c34dc15dd5a', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'Excellent driver, very professional', '2026-07-25 12:33:27', 'TRIP-SGzbr8SOvu', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('bb9dc083-a9dc-4f22-9a31-73de236a3fa8', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Excellent driver, very professional', '2026-07-02 12:33:28', 'TRIP-s2fEdGeNAk', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('bc8aa958-26e8-4060-8af1-a6ee2898043b', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'Safe and courteous', '2026-07-07 12:33:26', 'TRIP-SotuE4dccS', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('bd41d448-2c32-4eca-95a1-a47f3241ca95', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Excellent driver, very professional', '2026-07-15 12:33:27', 'TRIP-ZLIa4i53tG', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('be3b4975-275d-41ec-af33-05286e4a234d', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'communication', 'Excellent driver, very professional', '2026-07-28 12:33:26', 'TRIP-VQr4egxsA7', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('bf8d4ec9-d6df-4392-b883-fc3d2592b44d', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'On time and reliable', '2026-07-13 12:33:28', 'TRIP-oEr7OZby7L', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('c18607a9-fbbe-4669-a3b2-7ea73f6084d1', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Excellent driver, very professional', '2026-07-22 12:33:26', 'TRIP-VmdIgpZnqw', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('c253726d-5f6f-437a-a118-819e8db345ac', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'cleanliness', 'Great communication', '2026-07-02 12:33:27', 'TRIP-md2swhk2i7', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('c283f2c4-582b-4668-b5a6-423b5384f348', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'On time and reliable', '2026-07-07 12:33:26', 'TRIP-3AihGcNcv5', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('c2b3a68d-8fb2-4808-a63f-c76c35e2fb87', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'Excellent driver, very professional', '2026-07-03 12:33:28', 'TRIP-NLDc4rk5id', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('c4755e69-b35e-40ff-8c21-888c5c272ee3', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'safety', 'Good delivery experience', '2026-07-02 12:33:28', 'TRIP-lV9ppikAVv', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('c479ee7e-2c37-4a08-83ad-eee1172fe341', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'cleanliness', 'Safe and courteous', '2026-07-10 12:33:26', 'TRIP-cEr9VW8fCj', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('c533f711-02f4-43d8-a391-69ec00719c39', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Safe and courteous', '2026-07-05 12:33:27', 'TRIP-6LeCoz650s', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('c5d76a16-aefc-43c6-95c0-9cd167ab68ce', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Good delivery experience', '2026-07-13 12:33:28', 'TRIP-NBOnUzcqRW', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('c76b97be-ee80-4c87-bb69-54c1a1b0cbaf', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'communication', 'Great communication', '2026-07-27 12:33:28', 'TRIP-Fdzh7oUGbG', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('c80c7012-0315-444d-a258-effcacdccbe4', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'cleanliness', 'On time and reliable', '2026-07-14 12:33:28', 'TRIP-YSGB7mvE15', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ca852496-ed70-4101-bb8c-28ccb065a5cb', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'safety', 'Good delivery experience', '2026-07-27 12:33:27', 'TRIP-gHqSG2hCFg', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('cc683121-37dd-4b4d-8613-b251eb53eea7', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'punctuality', 'Safe and courteous', '2026-07-14 12:33:26', 'TRIP-axrfeFenTR', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('cd8c0862-8054-442a-9424-95c8a4a4d4b2', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Good delivery experience', '2026-07-26 12:33:26', 'TRIP-heiZz6yJkb', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('cdda3388-166b-446e-9c65-d4a9c8df477b', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'punctuality', 'Great communication', '2026-07-24 12:33:26', 'TRIP-nKInzFNljW', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('ce68352d-8629-4c71-8a1a-78c1e9ab721a', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'On time and reliable', '2026-06-30 12:33:26', 'TRIP-7shrgHQIi5', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('ced9b9da-ab8d-4cff-9a71-5240c72e3715', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'safety', 'Excellent driver, very professional', '2026-07-21 12:33:28', 'TRIP-zuC7wG2Xih', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('cf46f930-5ef2-4aa6-9d83-fbb370d8f898', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'cleanliness', 'Excellent driver, very professional', '2026-07-26 12:33:26', 'TRIP-hVZlThIoDd', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('cfeab8d1-3e0b-4731-aee4-5e9de9b693a0', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'punctuality', 'On time and reliable', '2026-07-21 12:33:26', 'TRIP-075eXrAuR7', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('d0bd339a-dcb1-41f6-8701-b8d3f8baa584', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Great communication', '2026-07-21 12:33:27', 'TRIP-kOUFNdP7zo', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d10152e7-9d84-45ec-824c-6d580088ff2a', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'communication', 'Excellent driver, very professional', '2026-07-05 12:33:27', 'TRIP-8QlqKPFa5A', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d2051e05-0e3c-4b72-ae81-89a8812d11fc', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'On time and reliable', '2026-07-08 12:33:28', 'TRIP-ORGZAkUwm6', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('d3912bcc-2fee-43a4-8f01-54bdc2f21ac2', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Great communication', '2026-07-10 12:33:27', 'TRIP-48XQcG29Kj', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d4038d05-1b31-472a-b4e6-39e939c84595', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Safe and courteous', '2026-07-27 12:33:28', 'TRIP-VsLqnMjnUE', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('d6ae7e6a-cbf2-4246-b8f4-adf694908831', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'punctuality', 'Good delivery experience', '2026-07-16 12:33:27', 'TRIP-hC0eUnevSF', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d73b07d4-8f00-47fd-9d2d-5ad030ba830b', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'Great communication', '2026-06-30 12:33:27', 'TRIP-xeH9PJorXM', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('d7fe655f-3021-49a8-8e06-01e1d97c49a5', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'cleanliness', 'On time and reliable', '2026-07-17 12:33:28', 'TRIP-LbQwPMQwjp', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('d85a5904-347a-48c6-b256-415822302b3e', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Safe and courteous', '2026-07-10 12:33:26', 'TRIP-T3keqaGbX0', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('d889935d-bb58-488f-92a6-ddf617309243', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'cleanliness', 'Safe and courteous', '2026-07-27 12:33:28', 'TRIP-exFP2VDfhg', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('da8be1dd-47d0-4332-84f9-a24fbd63e94a', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Good delivery experience', '2026-07-16 12:33:26', 'TRIP-Kf6ijQSEPq', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('db518286-e6f0-4548-b1de-1759207b40d8', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'cleanliness', 'On time and reliable', '2026-07-17 12:33:28', 'TRIP-PiQNru3CPq', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('de611395-f5dc-47d6-bf0e-8dd57622f3e4', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Excellent driver, very professional', '2026-07-15 12:33:27', 'TRIP-PvCLdR6Avw', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('de7d67fd-95f6-47c5-9d67-ad1a38bf8f67', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Excellent driver, very professional', '2026-07-25 12:33:28', 'TRIP-lSKHcCW2xb', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('de83fc5b-87b6-4f42-b536-f363e5cebe4d', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Great communication', '2026-07-24 12:33:27', 'TRIP-N93gTCvZXo', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('dead963e-d10c-4965-9117-42a54ed7bf76', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'safety', 'On time and reliable', '2026-07-24 12:33:28', 'TRIP-uSx1IHjUta', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('df97fc27-5a99-4b32-ac61-61567e57f433', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Great communication', '2026-07-09 12:33:28', 'TRIP-TMWMvzqxjz', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('e1db8700-4243-4551-967f-af26f95d8cff', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 3, 'communication', 'Great communication', '2026-07-23 12:33:27', 'TRIP-tNnLhORxEO', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('e214ea4f-967e-49fe-827b-aa84da41a0fa', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'communication', 'Good delivery experience', '2026-07-10 12:33:28', 'TRIP-nQO0MOMUzI', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('e3b3f970-686f-46f4-8d1c-f99018999e1a', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'communication', 'On time and reliable', '2026-07-13 12:33:27', 'TRIP-eU7pIw4eY1', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('e3f50626-7aaf-4c9e-801e-3c392de4787c', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Good delivery experience', '2026-07-22 12:33:28', 'TRIP-qIQmrgG1Th', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('e8a9c21b-0d7c-4a43-bef6-b6c0ce4e0b04', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Safe and courteous', '2026-07-02 12:33:26', 'TRIP-BSQ2jg8Ip4', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('e8d37dec-bc52-408f-867c-dad918caf5ee', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'Great communication', '2026-07-14 12:33:27', 'TRIP-k5PZQsOs8n', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('e9271031-765b-494e-a4c5-b9c2cc253f82', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'Safe and courteous', '2026-07-25 12:33:28', 'TRIP-3Ii9LVYIj5', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('e95b6fac-dfe0-49cb-be9f-9290d2934be3', '3bc696ba-0d80-42f8-80b5-628830647d2b', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Good delivery experience', '2026-07-19 12:33:29', 'TRIP-ruYJiaxMmB', NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e9dadc5c-79aa-400f-a05f-b0ac908029b7', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'punctuality', 'Excellent driver, very professional', '2026-07-10 12:33:27', 'TRIP-Eeo5PeRos3', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('ea4f58c8-ed2c-4677-9e3b-8f7447d3fb04', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Good delivery experience', '2026-07-20 12:33:28', 'TRIP-7zRstpEyNF', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ebfadf69-2d32-4240-9eb7-8cb3cab43e5d', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'cleanliness', 'Safe and courteous', '2026-07-12 12:33:28', 'TRIP-jbsijIfCkY', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ed230c2d-f6f5-43c3-9fbe-9f2c33c61a98', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Good delivery experience', '2026-07-09 12:33:28', 'TRIP-f5g6HahXke', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ed51f150-ed6c-4d69-b7ff-6d03ebb864be', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'punctuality', 'Great communication', '2026-07-04 12:33:28', 'TRIP-RUIfHVZn02', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ed627f6d-db15-411f-97d1-e7ac31b811ea', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'cleanliness', 'Safe and courteous', '2026-06-30 12:33:28', 'TRIP-eUMQf7xdWD', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ee2649fd-2efc-4e8a-afa8-8b676d375b18', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Good delivery experience', '2026-07-04 12:33:26', 'TRIP-tsfjV77ipf', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('eee21442-32c5-42e6-938c-699c262a7f16', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'On time and reliable', '2026-07-19 12:33:28', 'TRIP-xa6WdkbmW7', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f0e33afd-4456-4b01-a8d0-99b106f09b62', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'punctuality', 'Great communication', '2026-07-08 12:33:26', 'TRIP-kLAnuECDYB', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('f1258208-26c4-49b3-949d-a7420f065558', '8089066b-5020-42f8-a409-b0f3144e91b8', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'punctuality', 'On time and reliable', '2026-07-28 12:33:26', 'TRIP-VPdktuWY4D', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('f20977b3-159b-4118-9a9a-64a0bb672f42', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'communication', 'On time and reliable', '2026-07-23 12:33:26', 'TRIP-89LKwWKmNS', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('f3382cc6-7a88-45d4-bcc8-ef02299bbfbb', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Great communication', '2026-07-22 12:33:27', 'TRIP-Qx9gvISIls', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f37c838f-4219-40f9-8bab-2483e843493e', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'Good delivery experience', '2026-07-09 12:33:28', 'TRIP-kBZtnwozGD', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f39f3ebd-2ea2-4f40-960f-cb86ff054ac9', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'punctuality', 'Safe and courteous', '2026-07-20 12:33:27', 'TRIP-tWIlE7rnaL', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f3a4c8b7-a3d0-4d2b-bf03-2ee17ecad87d', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Good delivery experience', '2026-07-29 12:33:28', 'TRIP-LdlOO8Ju8B', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f3be88f2-acaa-453a-b226-d40936cf032a', '85ebf44e-3021-484a-8629-761a464da7ae', 'bd462d74-f934-4a3f-be07-6909d742d53f', 2, 'punctuality', 'Good delivery experience', '2026-07-22 12:33:28', 'TRIP-J3fvqisC8Z', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f3c365fd-944e-4b1a-8e70-33ca8cfc3dd1', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Good delivery experience', '2026-07-24 12:33:28', 'TRIP-naXgfzZd3C', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f408bedd-82b6-4a03-8635-e3d1c4140cef', 'bfe04c19-f789-4373-9386-74bb9cd846e0', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'Excellent driver, very professional', '2026-07-21 12:33:27', 'TRIP-ncMAtztrmX', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f4c6e6f1-a7cf-4667-a855-4a17b8821e6c', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'safety', 'On time and reliable', '2026-07-06 12:33:28', 'TRIP-OLMj7uBL6c', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f595b18d-6397-4ac2-9050-0a7191af8433', '08f0a792-6dfa-4e99-b3cb-12b2da73a971', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 5, 'safety', 'Good delivery experience', '2026-07-11 12:33:27', 'TRIP-8aeRZNM7B5', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f5a166d3-9e57-48fe-bdd0-b0e34c95174a', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Excellent driver, very professional', '2026-07-09 12:33:27', 'TRIP-ppHuuhpZvp', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f679f690-751b-4e6e-9072-bc6c4b4a4d87', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 4, 'communication', 'Safe and courteous', '2026-07-21 12:33:27', 'TRIP-HKN8zEZU5d', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('f6a79000-dc6c-4325-a31e-813d03d70a56', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'safety', 'On time and reliable', '2026-07-08 12:33:28', 'TRIP-wp3SrUd79V', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f6e7efab-9e1c-4da4-834b-1aeaa8e68d96', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Great communication', '2026-07-05 12:33:28', 'TRIP-N4mYRVdQg5', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f71facfd-b616-4263-a5ac-592826e389c3', '1d422eeb-30d6-478b-9a6e-d2dacc2a5144', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 3, 'cleanliness', 'Safe and courteous', '2026-07-12 12:33:26', 'TRIP-N2K71OOvAm', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('f7ce04e2-5b1f-4233-933c-224ff0055111', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'communication', 'On time and reliable', '2026-07-20 12:33:28', 'TRIP-Fa6HWnud8W', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('f8ccdfaa-3ea6-4c49-898c-4f7c78577fce', 'bfe04c19-f789-4373-9386-74bb9cd846e0', 'bd462d74-f934-4a3f-be07-6909d742d53f', 4, 'safety', 'Great communication', '2026-07-02 12:33:27', 'TRIP-YIrJ3JbKhZ', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL),
('fa00af76-bf43-43f3-8048-0c3e43573f1e', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'safety', 'On time and reliable', '2026-07-28 12:33:28', 'TRIP-4zs09BvyTZ', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fa04f739-0e05-480a-9ec0-4b61e561cb13', '8089066b-5020-42f8-a409-b0f3144e91b8', '349cc365-e531-41bd-9dd6-09e26a770d1e', 5, 'cleanliness', 'Good delivery experience', '2026-07-13 12:33:26', 'TRIP-7T0NA7rVn9', NULL, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL),
('fb6cd8b3-6122-4c7b-bf9b-05aa06bfa3f7', 'e91b23ea-6c51-4818-8969-9d111a80933c', 'bd462d74-f934-4a3f-be07-6909d742d53f', 5, 'safety', 'Great communication', '2026-07-24 12:33:28', 'TRIP-AeWh8JIjKN', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fbe07a9a-8b62-4d4a-ab17-dc2a27842554', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 2, 'cleanliness', 'Great communication', '2026-07-04 12:33:28', 'TRIP-o7GButByNk', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fcbee13e-44ae-451c-a94d-85b10a26828e', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'cleanliness', 'On time and reliable', '2026-07-28 12:33:28', 'TRIP-wulpNml2I6', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fcf2125a-3f54-4045-8f7d-ed97ab840fa3', 'e91b23ea-6c51-4818-8969-9d111a80933c', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'communication', 'Safe and courteous', '2026-07-07 12:33:28', 'TRIP-BwRBR5Tu10', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fd7c5ee5-a2d6-4e5a-8bac-1be830a47eaf', 'd97c2cbc-d976-4cb3-9bc7-0c94cf59b9ae', 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 2, 'safety', 'Good delivery experience', '2026-07-07 12:33:28', 'TRIP-GBTezYbMA7', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('fe1338c9-42d1-445b-bab9-f03fc049e945', '85ebf44e-3021-484a-8629-761a464da7ae', '349cc365-e531-41bd-9dd6-09e26a770d1e', 4, 'punctuality', 'Good delivery experience', '2026-07-08 12:33:28', 'TRIP-ylu48F4t9a', NULL, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL),
('ffb84b5e-5bd4-4168-8373-d07467ee2a0c', '8292f9f1-75c4-4157-8ae4-233a73ec43ba', '349cc365-e531-41bd-9dd6-09e26a770d1e', 3, 'punctuality', 'Good delivery experience', '2026-07-04 12:33:27', 'TRIP-nkAVkWt8r8', NULL, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `drops`
--

CREATE TABLE `drops` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `location_name` varchar(150) NOT NULL,
  `street_address` text NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(6) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_person_name` varchar(150) NOT NULL,
  `contact_person_phone` varchar(20) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `arrived_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `delivery_signature_url` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drops`
--

INSERT INTO `drops` (`id`, `uuid`, `booking_uuid`, `location_name`, `street_address`, `landmark`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `contact_person_name`, `contact_person_phone`, `scheduled_at`, `arrived_at`, `completed_at`, `delivery_signature_url`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '46943bd6-4157-44f0-9223-2cc25132bb18', '7a818d87-8671-46d4-8cd3-d9deb262c119', 'Drop Point 1', '158 Park Lane', 'Near Bus Stand', 'Pune', 'Maharashtra', '989073', 'India', '15.27000000', '91.44000000', 'Receiver 1', '9967227206', '2026-08-02 03:57:12', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(2, '2a154c61-77bf-4f03-b86d-1d02e5276096', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Drop Point 2', '340 Highway', 'Near Temple', 'Ahmedabad', 'Gujarat', '548736', 'India', '10.85000000', '96.34000000', 'Receiver 2', '9924325751', '2026-08-02 10:57:12', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(3, '00501123-f91b-48cd-b1ed-01ac4b18e27d', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', 'Drop Point 3', '562 Express Road', 'Near Temple', 'Hyderabad', 'Telangana', '360710', 'India', '29.09000000', '77.11000000', 'Receiver 3', '9980027680', '2026-08-02 00:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(4, '61a07b66-6c94-4a48-9dd6-01279ed74b99', '43d64598-113f-4fde-b778-68daeb531168', 'Drop Point 4', '849 Market Street', 'Near Temple', 'Kolkata', 'West Bengal', '569480', 'India', '13.46000000', '75.49000000', 'Receiver 4', '9939445308', '2026-08-02 15:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(5, 'ad0e0c01-f5d8-477f-8f7a-6318404ee02a', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 'Drop Point 5', '426 Express Road', 'Near School', 'Hyderabad', 'Telangana', '968231', 'India', '20.57000000', '74.98000000', 'Receiver 5', '9981469431', '2026-08-02 14:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(6, 'cf9f8293-83b2-404b-a342-fa113d0dcef9', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 'Drop Point 6', '478 Market Street', 'Near School', 'Hyderabad', 'Telangana', '642472', 'India', '18.34000000', '97.81000000', 'Receiver 6', '9983633844', '2026-08-02 09:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(7, '5f35c74c-fc6c-4256-99fa-4a53599393b0', '6ab8782b-520e-4586-b47f-8b5b37f53707', 'Drop Point 7', '367 Park Lane', 'Near Railway Station', 'Hyderabad', 'Telangana', '384779', 'India', '22.17000000', '94.62000000', 'Receiver 7', '9979727575', '2026-08-02 01:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(8, '2e598851-321b-4d6a-be47-d2f33ce70fa5', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 'Drop Point 8', '490 Industrial Road', 'Near Railway Station', 'Mumbai', 'Maharashtra', '571962', 'India', '9.79000000', '97.37000000', 'Receiver 8', '9984784520', '2026-08-02 13:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(9, '7af0d82d-3ccd-47f9-9c0d-65de078ef4ac', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'Drop Point 9', '588 Main Road', 'Near School', 'Hyderabad', 'Telangana', '980750', 'India', '30.30000000', '92.96000000', 'Receiver 9', '9952257063', '2026-08-01 19:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(10, '459d0d6a-0c3c-4bcf-8a95-3af31ef3ee14', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 'Drop Point 10', '830 Industrial Road', 'Near Temple', 'Hyderabad', 'Telangana', '616530', 'India', '33.28000000', '71.76000000', 'Receiver 10', '9974414354', '2026-08-02 14:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(11, 'ebee0eba-c2b5-4665-890f-d8fad4138440', '209da1f3-9fd1-476f-b514-7c9c546b576c', 'Drop Point 11', '883 Park Lane', 'Near School', 'Pune', 'Maharashtra', '902347', 'India', '17.05000000', '76.30000000', 'Receiver 11', '9910138763', '2026-08-02 14:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(12, '9de04e24-f470-4b8e-907f-4be96b23e739', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Drop Point 12', '330 Main Road', 'Near Hospital', 'Mumbai', 'Maharashtra', '259432', 'India', '8.79000000', '85.73000000', 'Receiver 12', '9919185016', '2026-08-02 11:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(13, 'cce5f6b8-1c8c-496c-9f87-b00a832968bb', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 'Drop Point 13', '557 Main Road', 'Near School', 'Delhi', 'Delhi', '285135', 'India', '12.26000000', '74.30000000', 'Receiver 13', '9943253491', '2026-08-01 18:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(14, '8b66be31-8cc5-461e-a221-a1642596b8e8', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 'Drop Point 14', '496 Highway', 'Near Hospital', 'Delhi', 'Delhi', '981393', 'India', '17.73000000', '77.89000000', 'Receiver 14', '9967579746', '2026-08-01 21:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(15, '2b6e81aa-10bd-45a2-a177-7d15b5b5e21f', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Drop Point 15', '575 Main Road', 'Near Bus Stand', 'Mumbai', 'Maharashtra', '392438', 'India', '16.57000000', '79.55000000', 'Receiver 15', '9999350230', '2026-08-02 13:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(16, '1158307a-3a42-45bc-910d-ec96be635d0f', 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', 'Drop Point 16', '471 Market Street', 'Near Hospital', 'Mumbai', 'Maharashtra', '658873', 'India', '31.72000000', '92.27000000', 'Receiver 16', '9995477949', '2026-08-02 14:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(17, 'c4963d97-bd59-4939-b2f5-ceadaeb33739', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 'Drop Point 17', '798 Express Road', 'Near Temple', 'Hyderabad', 'Telangana', '215863', 'India', '17.28000000', '79.68000000', 'Receiver 17', '9968586200', '2026-08-02 13:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(18, '70b009d7-68a8-4f63-87f1-d2ca0f8654d0', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Drop Point 18', '733 Market Street', 'Near Temple', 'Mumbai', 'Maharashtra', '693576', 'India', '13.72000000', '75.18000000', 'Receiver 18', '9919618043', '2026-08-01 18:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(19, '18e03956-ff57-4df2-a3e3-986159f50257', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Drop Point 19', '899 Park Lane', 'Near Temple', 'Kolkata', 'West Bengal', '575493', 'India', '32.82000000', '93.14000000', 'Receiver 19', '9934526718', '2026-08-02 06:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(20, 'ea83e63b-f9fb-44d5-80d0-97f67602a125', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 'Drop Point 20', '806 Industrial Road', 'Near Bus Stand', 'Ahmedabad', 'Gujarat', '666859', 'India', '12.74000000', '95.63000000', 'Receiver 20', '9970422551', '2026-08-02 05:57:13', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(21, 'f6499649-99b2-43ac-8592-b9fe7c819d69', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 'Drop Point 1', '815 Park Lane', 'Near Bus Stand', 'Kolkata', 'West Bengal', '500094', 'India', '19.41000000', '88.61000000', 'Receiver 1', '9973669191', '2026-08-02 11:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(22, '4389ab05-e862-4266-ad65-cc49f90ea4b9', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 'Drop Point 2', '667 Industrial Road', 'Near Bus Stand', 'Bangalore', 'Karnataka', '637780', 'India', '30.63000000', '80.43000000', 'Receiver 2', '9973091217', '2026-08-02 03:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(23, 'f8b64f0c-1e71-4d43-ac22-bef868d13369', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 'Drop Point 3', '114 Express Road', 'Near School', 'Hyderabad', 'Telangana', '376686', 'India', '9.29000000', '90.94000000', 'Receiver 3', '9944997666', '2026-08-02 07:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(24, '3977ca3d-1422-4f72-8a50-5917b996c6d0', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Drop Point 4', '357 Market Street', 'Near School', 'Pune', 'Maharashtra', '360660', 'India', '13.25000000', '90.83000000', 'Receiver 4', '9941270843', '2026-08-01 22:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(25, 'b695652a-78f5-45c5-9262-ee7d51b6a626', 'b800ca3d-e396-4630-8923-704f8c055f43', 'Drop Point 5', '631 Main Road', 'Near Temple', 'Mumbai', 'Maharashtra', '342446', 'India', '28.81000000', '88.86000000', 'Receiver 5', '9981098266', '2026-08-01 21:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(26, '7642d368-2527-4556-ad9f-134d7552581a', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 'Drop Point 6', '506 Main Road', 'Near Temple', 'Delhi', 'Delhi', '456275', 'India', '19.19000000', '72.22000000', 'Receiver 6', '9972874107', '2026-08-02 16:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(27, '4c178f80-d146-47f1-a705-6c93394215e9', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 'Drop Point 7', '190 Park Lane', 'Near Railway Station', 'Mumbai', 'Maharashtra', '440050', 'India', '29.55000000', '71.97000000', 'Receiver 7', '9972858464', '2026-08-02 00:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(28, 'eebf731a-2e9f-4322-b076-965e0e1591aa', '709ff274-58b5-4333-8233-baf43838e710', 'Drop Point 8', '777 Main Road', 'Near Hospital', 'Bangalore', 'Karnataka', '916728', 'India', '27.54000000', '90.20000000', 'Receiver 8', '9941264455', '2026-08-01 21:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(29, '2ec1ecbd-0689-43a3-a750-11468ed60e9a', '0103e6b0-b672-4e9c-9f78-949005327ea6', 'Drop Point 9', '490 Market Street', 'Near Bus Stand', 'Kolkata', 'West Bengal', '314026', 'India', '13.63000000', '79.27000000', 'Receiver 9', '9945097210', '2026-08-02 07:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(30, '7f09d87b-e400-47c7-9d34-70dd1ab3aa84', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'Drop Point 10', '459 Express Road', 'Near Railway Station', 'Ahmedabad', 'Gujarat', '388022', 'India', '15.03000000', '90.98000000', 'Receiver 10', '9937234274', '2026-08-02 02:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(31, '93db30e7-e382-446e-8acc-3e293926c29d', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 'Drop Point 11', '114 Market Street', 'Near Hospital', 'Mumbai', 'Maharashtra', '771686', 'India', '27.99000000', '88.71000000', 'Receiver 11', '9943078645', '2026-08-02 03:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(32, '1db1c71f-8c36-4336-80f0-9911307204e5', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Drop Point 12', '220 Industrial Road', 'Near Bus Stand', 'Ahmedabad', 'Gujarat', '445321', 'India', '19.83000000', '78.61000000', 'Receiver 12', '9984205270', '2026-08-02 12:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(33, '2e9dce5d-39de-4d07-8ed1-2bed0895d788', '08a3ff07-acf9-4339-9f42-8fc01ac5109a', 'Drop Point 13', '766 Main Road', 'Near Temple', 'Delhi', 'Delhi', '915670', 'India', '27.23000000', '69.41000000', 'Receiver 13', '9983805648', '2026-08-02 15:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(34, 'e2c1cb51-0f2d-49d4-9719-ceb66db988b1', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Drop Point 14', '431 Main Road', 'Near Temple', 'Hyderabad', 'Telangana', '533787', 'India', '23.12000000', '85.71000000', 'Receiver 14', '9998855385', '2026-08-01 23:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(35, 'a233dc80-f933-4097-96e2-6432a557a545', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 'Drop Point 15', '545 Express Road', 'Near Railway Station', 'Ahmedabad', 'Gujarat', '926780', 'India', '19.41000000', '76.66000000', 'Receiver 15', '9945250443', '2026-08-02 15:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(36, 'f3945e10-68b8-4ca3-98c8-1ed167a9d6f7', '52693403-a4ec-4a49-ac64-03c329b69ec8', 'Drop Point 16', '863 Industrial Road', 'Near Railway Station', 'Hyderabad', 'Telangana', '196764', 'India', '21.44000000', '72.74000000', 'Receiver 16', '9933863393', '2026-08-02 16:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(37, 'eda2db9a-a637-42f7-91cc-eed94bdb3cb1', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'Drop Point 17', '711 Main Road', 'Near Hospital', 'Kolkata', 'West Bengal', '527429', 'India', '13.67000000', '95.08000000', 'Receiver 17', '9966148099', '2026-08-02 13:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(38, '908bdf13-2da0-4e55-ba34-b8929bde997d', '9469d467-c76f-4a54-855e-39528eed20c3', 'Drop Point 18', '146 Market Street', 'Near Railway Station', 'Pune', 'Maharashtra', '333563', 'India', '19.53000000', '81.03000000', 'Receiver 18', '9997056336', '2026-08-02 15:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(39, 'bce3e901-2de2-47ad-8c0f-80b02488f15b', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Drop Point 19', '257 Market Street', 'Near Railway Station', 'Mumbai', 'Maharashtra', '263125', 'India', '12.28000000', '73.75000000', 'Receiver 19', '9942321042', '2026-08-02 08:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(40, '4d184425-2f22-42a9-b89c-b9ca49184a82', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 'Drop Point 20', '530 Highway', 'Near Railway Station', 'Delhi', 'Delhi', '503815', 'India', '33.81000000', '97.83000000', 'Receiver 20', '9955654794', '2026-08-02 17:03:29', NULL, NULL, NULL, 'Please call before delivery', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `etas`
--

CREATE TABLE `etas` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `pickup_location_latitude` decimal(10,8) NOT NULL,
  `pickup_location_longitude` decimal(11,8) NOT NULL,
  `drop_location_latitude` decimal(10,8) NOT NULL,
  `drop_location_longitude` decimal(11,8) NOT NULL,
  `estimated_pickup_time` datetime NOT NULL,
  `estimated_drop_time` datetime NOT NULL,
  `estimated_distance_km` decimal(8,2) NOT NULL,
  `estimated_duration_minutes` int(11) NOT NULL,
  `current_latitude` decimal(10,8) NOT NULL,
  `current_longitude` decimal(11,8) NOT NULL,
  `distance_remaining_km` decimal(8,2) NOT NULL,
  `time_remaining_minutes` int(11) NOT NULL,
  `last_recalculated_at` datetime NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorite_routes`
--

CREATE TABLE `favorite_routes` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `route_name` varchar(150) NOT NULL,
  `origin_city` varchar(100) NOT NULL,
  `origin_state` varchar(100) NOT NULL,
  `destination_city` varchar(100) NOT NULL,
  `destination_state` varchar(100) NOT NULL,
  `estimated_distance_km` decimal(8,2) DEFAULT NULL,
  `estimated_duration_hours` decimal(5,2) DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','occasional') NOT NULL DEFAULT 'occasional',
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `favorite_routes`
--

INSERT INTO `favorite_routes` (`uuid`, `customer_uuid`, `route_name`, `origin_city`, `origin_state`, `destination_city`, `destination_state`, `estimated_distance_km`, `estimated_duration_hours`, `frequency`, `notes`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('01d81906-c2f3-406e-8af7-89e06aac06f3', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'Swift Cargo Services - Chennai to Pune', 'Chennai', 'Tamil Nadu', 'Pune', 'Maharashtra', '1325.90', '24.32', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('02b60e0e-9631-43dc-8a03-21c8d4845cc7', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'TechVision Solutions - Delhi to Mumbai', 'Delhi', 'Delhi', 'Mumbai', 'Maharashtra', '1716.79', '10.37', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('068e029d-1e72-4228-b139-37c3b635a544', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'Global Express - Pune to Ahmedabad', 'Pune', 'Maharashtra', 'Ahmedabad', 'Gujarat', '1689.51', '32.53', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('0c730dd8-fbe0-47a6-ac46-abb718c246e6', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'Precision Freight - Hyderabad to Jaipur', 'Hyderabad', 'Telangana', 'Jaipur', 'Rajasthan', '1238.67', '46.95', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('0ccd7612-0a6a-43fc-ab73-7908bedbbe4b', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'Excellence Logistics - Bangalore to Hyderabad', 'Bangalore', 'Karnataka', 'Hyderabad', 'Telangana', '1772.85', '11.37', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('0da56cb8-9c6e-4d32-ae6b-22e859d05058', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'Swift Cargo Services - Chennai to Ahmedabad', 'Chennai', 'Tamil Nadu', 'Ahmedabad', 'Gujarat', '1544.18', '32.22', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('0fae1898-640e-450a-95fd-4015b4bf7a02', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'Direct Route Systems - Jaipur to Delhi', 'Jaipur', 'Rajasthan', 'Delhi', 'Delhi', '1534.43', '14.05', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('107181d3-d2b6-4b9d-8e6f-ccf5627cdd9d', '447b85f3-03bd-4bac-9966-180a174185e7', 'Premium Transport Hub - Ahmedabad to Delhi', 'Ahmedabad', 'Gujarat', 'Delhi', 'Delhi', '1811.12', '17.13', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('11cd62b3-5b05-46e1-b848-1ecd57b79ae9', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'Rapid Delivery Co - Kolkata to Ahmedabad', 'Kolkata', 'West Bengal', 'Ahmedabad', 'Gujarat', '1287.87', '10.82', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('1624835b-4b73-4749-b560-8b6d23efd361', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'Rapid Delivery Co - Kolkata to Lucknow', 'Kolkata', 'West Bengal', 'Lucknow', 'Uttar Pradesh', '323.11', '16.32', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('17470457-d42b-4d12-9dee-86630ba44514', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'Delhi to Mumbai', 'Delhi', 'Delhi', 'Mumbai', 'Maharashtra', '794.97', '8.32', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('1956ce33-e8f3-4cf2-b59c-b1dc8bc8f04a', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'Precision Freight - Hyderabad to Kolkata', 'Hyderabad', 'Telangana', 'Kolkata', 'West Bengal', '438.49', '23.00', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('1cc0ffbf-0273-4208-a95c-4e32f58ea91a', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'Excellence Logistics - Bangalore to Pune', 'Bangalore', 'Karnataka', 'Pune', 'Maharashtra', '526.71', '20.20', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('1d36bd1e-dfd0-47a1-a772-d4737663ae3a', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'Global Express - Pune to Lucknow', 'Pune', 'Maharashtra', 'Lucknow', 'Uttar Pradesh', '1640.27', '26.80', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('1e4fb8ea-20d5-4d0f-8ba8-3734b5cb5f74', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'Ahmedabad to Lucknow', 'Ahmedabad', 'Gujarat', 'Lucknow', 'Uttar Pradesh', '912.99', '7.73', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('1fe7cd38-77ef-41c3-82de-3d9a5222bd46', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'Excellence Logistics - Bangalore to Pune', 'Bangalore', 'Karnataka', 'Pune', 'Maharashtra', '507.13', '27.48', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('20c6bf30-c407-4fc0-849b-10aca9224cac', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'Excellence Logistics - Bangalore to Kolkata', 'Bangalore', 'Karnataka', 'Kolkata', 'West Bengal', '956.97', '34.83', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('210af7e3-ab48-4b49-aa74-9ed2b3688df0', '8847a41f-f820-4185-875e-180ba15289cd', 'Chennai to Kolkata', 'Chennai', 'Tamil Nadu', 'Kolkata', 'West Bengal', '634.37', '19.22', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('236e8b62-3a1f-48b6-ad53-2ee54548efe2', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'Global Express - Pune to Jaipur', 'Pune', 'Maharashtra', 'Jaipur', 'Rajasthan', '1265.59', '37.08', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('273947fa-07ba-4045-a8e3-7b000e791e0a', '90234901-9112-49ca-9b70-a37c48a61270', 'Premium Transport Hub - Ahmedabad to Lucknow', 'Ahmedabad', 'Gujarat', 'Lucknow', 'Uttar Pradesh', '1051.61', '22.83', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('298d01aa-0ded-49ec-86b6-66580d8a5b52', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'Global Express - Pune to Kolkata', 'Pune', 'Maharashtra', 'Kolkata', 'West Bengal', '1291.11', '21.93', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('2bf40fa4-7f1a-4ffb-946d-3465032de82c', '90234901-9112-49ca-9b70-a37c48a61270', 'Premium Transport Hub - Ahmedabad to Jaipur', 'Ahmedabad', 'Gujarat', 'Jaipur', 'Rajasthan', '301.20', '11.00', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('2cef3ef2-8492-4b0b-af9e-1bf18454d3c1', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'Precision Freight - Hyderabad to Pune', 'Hyderabad', 'Telangana', 'Pune', 'Maharashtra', '1462.95', '47.28', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('2cf84b3e-ea28-411e-9ca1-b19ac9916b7d', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'Hyderabad to Kolkata', 'Hyderabad', 'Telangana', 'Kolkata', 'West Bengal', '799.31', '22.12', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('383dbe6b-eceb-4df1-b855-d90588d9c319', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'Jaipur to Delhi', 'Jaipur', 'Rajasthan', 'Delhi', 'Delhi', '448.27', '14.62', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('3984fe8b-9edc-435e-a234-0ffef1a5d73e', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'Precision Freight - Hyderabad to Ahmedabad', 'Hyderabad', 'Telangana', 'Ahmedabad', 'Gujarat', '407.08', '34.70', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('3b477aef-1429-49af-a958-9140961788f4', 'd18f7413-6231-423b-995f-889e6f9dad03', 'TechVision Solutions - Delhi to Bangalore', 'Delhi', 'Delhi', 'Bangalore', 'Karnataka', '1641.70', '39.80', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('3bfeea1a-a2f8-42ab-8601-b930e534647b', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'Bangalore to Chennai', 'Bangalore', 'Karnataka', 'Chennai', 'Tamil Nadu', '842.14', '14.18', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('3e02d61b-7240-4063-bf21-135dfb92f5d4', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'Hyderabad to Pune', 'Hyderabad', 'Telangana', 'Pune', 'Maharashtra', '753.09', '24.05', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('414528e5-d7fe-4633-be5b-82c6883fdf56', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'Ahmedabad to Delhi', 'Ahmedabad', 'Gujarat', 'Delhi', 'Delhi', '379.47', '7.05', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4190cea8-3b34-4136-86ae-2d321f9fa975', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'Golden Transport Pvt Ltd - Mumbai to Pune', 'Mumbai', 'Maharashtra', 'Pune', 'Maharashtra', '1980.43', '43.53', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('43574aac-84cc-4004-84fc-8707a422d793', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'Jaipur to Mumbai', 'Jaipur', 'Rajasthan', 'Mumbai', 'Maharashtra', '519.46', '19.13', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('436a31db-6b10-475c-a427-f8bd90421574', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'Pune to Ahmedabad', 'Pune', 'Maharashtra', 'Ahmedabad', 'Gujarat', '460.63', '13.32', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('44fe5c30-5e66-42a2-bca0-a79bfec95d1c', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'Bangalore to Hyderabad', 'Bangalore', 'Karnataka', 'Hyderabad', 'Telangana', '972.93', '7.18', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('465b04a7-10df-442f-ad46-be1956f7d046', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'Golden Transport Pvt Ltd - Mumbai to Bangalore', 'Mumbai', 'Maharashtra', 'Bangalore', 'Karnataka', '1491.17', '21.53', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('47f95abb-e9e4-4a88-b157-a993549de35a', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'Swift Cargo Services - Chennai to Pune', 'Chennai', 'Tamil Nadu', 'Pune', 'Maharashtra', '985.06', '17.08', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('489a7c66-883b-4556-81d8-db6ea717b33a', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'Delhi to Mumbai', 'Delhi', 'Delhi', 'Mumbai', 'Maharashtra', '215.45', '15.18', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('4d740d92-6cf1-4f23-aee5-8e487d41d704', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'Pune to Kolkata', 'Pune', 'Maharashtra', 'Kolkata', 'West Bengal', '918.25', '16.20', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('4e734b01-25bf-4eee-9fe8-1a25fbd297e1', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'Hyderabad to Ahmedabad', 'Hyderabad', 'Telangana', 'Ahmedabad', 'Gujarat', '125.92', '15.17', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('509e2c18-1d6a-4242-b83d-9fdb10359979', '991a7d85-aa91-4d1c-9800-72484f76b668', 'Golden Transport Pvt Ltd - Mumbai to Pune', 'Mumbai', 'Maharashtra', 'Pune', 'Maharashtra', '955.67', '27.30', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('51d07f5b-c4c9-4288-96a0-64428cfb27f6', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', 'Precision Freight - Hyderabad to Jaipur', 'Hyderabad', 'Telangana', 'Jaipur', 'Rajasthan', '456.75', '9.28', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('55117f35-669d-4e26-96bd-58868ef869fb', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'Rapid Delivery Co - Kolkata to Delhi', 'Kolkata', 'West Bengal', 'Delhi', 'Delhi', '1265.62', '19.08', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('56aa1327-10d0-49f4-a47e-a40a19241f9b', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'Bangalore to Hyderabad', 'Bangalore', 'Karnataka', 'Hyderabad', 'Telangana', '378.92', '14.05', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('5aef0492-9c58-4d13-b207-6bd3906367f9', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'Delhi to Chennai', 'Delhi', 'Delhi', 'Chennai', 'Tamil Nadu', '417.90', '23.23', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('5c7fcf47-f664-4df5-b93a-8ac285d735cd', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'Swift Cargo Services - Chennai to Kolkata', 'Chennai', 'Tamil Nadu', 'Kolkata', 'West Bengal', '1811.38', '21.12', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5d0025d8-ce8a-4228-bdb3-8359ddde3b4d', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'Precision Freight - Hyderabad to Kolkata', 'Hyderabad', 'Telangana', 'Kolkata', 'West Bengal', '814.68', '11.32', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5e0c02df-a78b-43e7-964a-280a644d317e', '447b85f3-03bd-4bac-9966-180a174185e7', 'Premium Transport Hub - Ahmedabad to Lucknow', 'Ahmedabad', 'Gujarat', 'Lucknow', 'Uttar Pradesh', '1065.16', '48.50', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5fd81823-c010-40a9-b14d-4d8ed991154e', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'Jaipur to Lucknow', 'Jaipur', 'Rajasthan', 'Lucknow', 'Uttar Pradesh', '909.43', '17.03', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('60e6fd8c-2343-42e7-a49d-094e2bfa31ae', '8847a41f-f820-4185-875e-180ba15289cd', 'Chennai to Hyderabad', 'Chennai', 'Tamil Nadu', 'Hyderabad', 'Telangana', '334.70', '13.57', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('62ad70c0-3ff8-4aa3-8661-f4a0ff09b24b', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'Golden Transport Pvt Ltd - Mumbai to Chennai', 'Mumbai', 'Maharashtra', 'Chennai', 'Tamil Nadu', '1855.69', '26.95', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('62cb302d-bea9-4e79-b219-5f56ce580080', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'Lucknow to Delhi', 'Lucknow', 'Uttar Pradesh', 'Delhi', 'Delhi', '439.48', '11.33', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('632b19e4-f751-4e51-95fd-91fcbe3b4959', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'Quantum Logistics - Lucknow to Mumbai', 'Lucknow', 'Uttar Pradesh', 'Mumbai', 'Maharashtra', '256.30', '44.70', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6379ecc4-49a3-4cb6-b97a-2f352d1b1b7e', 'd18f7413-6231-423b-995f-889e6f9dad03', 'TechVision Solutions - Delhi to Hyderabad', 'Delhi', 'Delhi', 'Hyderabad', 'Telangana', '1125.24', '24.27', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('643ee292-77c1-4c40-83eb-23149d02a213', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'Jaipur to Mumbai', 'Jaipur', 'Rajasthan', 'Mumbai', 'Maharashtra', '292.36', '24.43', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('657406e1-863c-4397-a82d-89b7d03161ff', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'Kolkata to Lucknow', 'Kolkata', 'West Bengal', 'Lucknow', 'Uttar Pradesh', '150.35', '19.15', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6868fdeb-6bfe-4b85-b681-bd1a9be57cdc', '406d0808-68a9-4f43-86c7-742774b247b2', 'Mumbai to Chennai', 'Mumbai', 'Maharashtra', 'Chennai', 'Tamil Nadu', '964.20', '24.30', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('6879489b-1a5b-4bf7-816a-f4ed52468483', '991a7d85-aa91-4d1c-9800-72484f76b668', 'Golden Transport Pvt Ltd - Mumbai to Hyderabad', 'Mumbai', 'Maharashtra', 'Hyderabad', 'Telangana', '1179.43', '34.37', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6a6a16cd-cee3-4a26-9d7f-37f72f0f925c', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'Chennai to Pune', 'Chennai', 'Tamil Nadu', 'Pune', 'Maharashtra', '792.99', '8.47', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('6b0cb08e-d3a9-4956-9511-bc5ed58f2590', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'Jaipur to Lucknow', 'Jaipur', 'Rajasthan', 'Lucknow', 'Uttar Pradesh', '514.65', '10.60', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6eaadcda-9a7b-4ff6-99cf-3af38616f57e', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'Rapid Delivery Co - Kolkata to Ahmedabad', 'Kolkata', 'West Bengal', 'Ahmedabad', 'Gujarat', '743.51', '24.60', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('70908046-ac05-4e84-8089-4ae67f9eb965', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'Direct Route Systems - Jaipur to Lucknow', 'Jaipur', 'Rajasthan', 'Lucknow', 'Uttar Pradesh', '1380.47', '16.18', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('72a1b383-39e9-42b7-b5f7-3338435c9b35', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'Kolkata to Lucknow', 'Kolkata', 'West Bengal', 'Lucknow', 'Uttar Pradesh', '806.71', '8.35', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('72b743d9-f1b9-4df1-a29f-7e211b07c449', '90234901-9112-49ca-9b70-a37c48a61270', 'Premium Transport Hub - Ahmedabad to Delhi', 'Ahmedabad', 'Gujarat', 'Delhi', 'Delhi', '1225.67', '30.50', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7457453f-6f9e-4afc-9e42-6805e82cea13', '991a7d85-aa91-4d1c-9800-72484f76b668', 'Golden Transport Pvt Ltd - Mumbai to Chennai', 'Mumbai', 'Maharashtra', 'Chennai', 'Tamil Nadu', '1323.88', '47.50', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('74d0fef6-b66a-4164-8d0e-905da33e35ef', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', 'Golden Transport Pvt Ltd - Mumbai to Hyderabad', 'Mumbai', 'Maharashtra', 'Hyderabad', 'Telangana', '1664.86', '26.02', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('76a48cc2-7c04-4e66-9608-58f3dcca4b08', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'Hyderabad to Ahmedabad', 'Hyderabad', 'Telangana', 'Ahmedabad', 'Gujarat', '426.58', '10.77', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('794d2811-b9a1-4a94-b353-9388c422c3cb', '447b85f3-03bd-4bac-9966-180a174185e7', 'Premium Transport Hub - Ahmedabad to Mumbai', 'Ahmedabad', 'Gujarat', 'Mumbai', 'Maharashtra', '1749.59', '21.55', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('7af302c3-dab5-404d-a737-a272c614c9f6', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'Quantum Logistics - Lucknow to Chennai', 'Lucknow', 'Uttar Pradesh', 'Chennai', 'Tamil Nadu', '1557.45', '22.60', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('7c78a5d7-5ca3-4662-8b35-e4d184cfd5da', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'Chennai to Hyderabad', 'Chennai', 'Tamil Nadu', 'Hyderabad', 'Telangana', '384.81', '20.08', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('7d37f703-93fc-42ad-88bf-3b56340c841a', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'Delhi to Chennai', 'Delhi', 'Delhi', 'Chennai', 'Tamil Nadu', '904.20', '7.65', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('7de74d8f-16f3-443e-817a-6d6842f2c59e', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'Quantum Logistics - Lucknow to Delhi', 'Lucknow', 'Uttar Pradesh', 'Delhi', 'Delhi', '774.62', '22.43', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('7eb981e5-ed33-4b74-ad6a-7ae895700cfe', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'Pune to Jaipur', 'Pune', 'Maharashtra', 'Jaipur', 'Rajasthan', '599.55', '20.03', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('8f69cede-11ac-4b54-909b-a209bae89d3b', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'Direct Route Systems - Jaipur to Delhi', 'Jaipur', 'Rajasthan', 'Delhi', 'Delhi', '1706.54', '47.53', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('90dc1245-8bae-4459-9ac3-ba3bbc62ed73', '90234901-9112-49ca-9b70-a37c48a61270', 'Premium Transport Hub - Ahmedabad to Mumbai', 'Ahmedabad', 'Gujarat', 'Mumbai', 'Maharashtra', '904.61', '42.10', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('91328fb3-4c23-4b8b-af4e-118b0ef2c3c9', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'Bangalore to Chennai', 'Bangalore', 'Karnataka', 'Chennai', 'Tamil Nadu', '818.64', '18.43', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('94f7fb0b-0550-4717-864f-e2961c0c1e35', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'Hyderabad to Pune', 'Hyderabad', 'Telangana', 'Pune', 'Maharashtra', '452.94', '20.58', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('962b72c8-460b-4af2-b387-8c87ea24096c', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'TechVision Solutions - Delhi to Chennai', 'Delhi', 'Delhi', 'Chennai', 'Tamil Nadu', '1186.93', '21.63', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9639efe0-a078-498e-8f43-b73aa8c70d41', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'Global Express - Pune to Kolkata', 'Pune', 'Maharashtra', 'Kolkata', 'West Bengal', '702.44', '45.42', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9b1290ec-71e8-4c98-9139-998af916375a', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'Pune to Kolkata', 'Pune', 'Maharashtra', 'Kolkata', 'West Bengal', '735.53', '5.85', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9b24f9ca-bcd6-4836-a72d-8d76cbe0be55', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'Quantum Logistics - Lucknow to Delhi', 'Lucknow', 'Uttar Pradesh', 'Delhi', 'Delhi', '284.10', '48.45', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9b2c8d0a-6442-44b5-be39-5bc770a3329c', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'Quantum Logistics - Lucknow to Chennai', 'Lucknow', 'Uttar Pradesh', 'Chennai', 'Tamil Nadu', '338.76', '16.42', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('9b7a12f2-8fda-4c06-9c32-84149aabeb0e', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'Lucknow to Mumbai', 'Lucknow', 'Uttar Pradesh', 'Mumbai', 'Maharashtra', '432.99', '6.38', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9f3af143-bea2-41e0-831a-6e699bed353a', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'Kolkata to Ahmedabad', 'Kolkata', 'West Bengal', 'Ahmedabad', 'Gujarat', '663.87', '23.80', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9fa29ce1-8d04-4728-b957-61f46f2f8fe5', '8847a41f-f820-4185-875e-180ba15289cd', 'Chennai to Pune', 'Chennai', 'Tamil Nadu', 'Pune', 'Maharashtra', '708.22', '7.00', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a0818086-1da3-4f5c-ac5a-14719aa20fc5', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'Kolkata to Jaipur', 'Kolkata', 'West Bengal', 'Jaipur', 'Rajasthan', '107.48', '6.72', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a5199d6b-44bd-4773-9c6b-71a6048df06c', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'TechVision Solutions - Delhi to Hyderabad', 'Delhi', 'Delhi', 'Hyderabad', 'Telangana', '574.92', '21.92', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a69f2681-7f8f-440a-bffd-1fc7a560fb17', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'Bangalore to Pune', 'Bangalore', 'Karnataka', 'Pune', 'Maharashtra', '690.74', '17.22', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('a7f8b17b-52d1-4a0d-90ec-822db40bab2b', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'Quantum Logistics - Lucknow to Bangalore', 'Lucknow', 'Uttar Pradesh', 'Bangalore', 'Karnataka', '1252.37', '35.43', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('a906f8ba-a0d8-43f1-a416-65c243adce1b', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'Kolkata to Jaipur', 'Kolkata', 'West Bengal', 'Jaipur', 'Rajasthan', '126.95', '5.48', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a9c6962d-35ff-484f-bea7-ab4714770a77', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'Direct Route Systems - Jaipur to Bangalore', 'Jaipur', 'Rajasthan', 'Bangalore', 'Karnataka', '799.07', '27.12', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ab24e014-c4f3-4960-a78a-1d870f767ba9', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'Chennai to Kolkata', 'Chennai', 'Tamil Nadu', 'Kolkata', 'West Bengal', '612.96', '12.05', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('abac5fef-1ff7-48d6-88a4-1d00c2256557', '406d0808-68a9-4f43-86c7-742774b247b2', 'Mumbai to Bangalore', 'Mumbai', 'Maharashtra', 'Bangalore', 'Karnataka', '400.07', '14.38', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('afbdb7c4-d0fb-448e-987d-fce162ed227c', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', 'Global Express - Pune to Jaipur', 'Pune', 'Maharashtra', 'Jaipur', 'Rajasthan', '1327.28', '44.50', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b1000382-ba0a-457a-a3e8-829a4bee24a6', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'Ahmedabad to Jaipur', 'Ahmedabad', 'Gujarat', 'Jaipur', 'Rajasthan', '279.56', '14.03', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b39077bb-d36d-4c6f-bea7-69df06b0e029', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'Kolkata to Ahmedabad', 'Kolkata', 'West Bengal', 'Ahmedabad', 'Gujarat', '751.85', '13.67', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b44b9d84-ccce-41a1-94e1-25a3e0dfc222', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'Mumbai to Chennai', 'Mumbai', 'Maharashtra', 'Chennai', 'Tamil Nadu', '320.74', '5.53', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b48bae7c-150f-4305-bf98-02a21c274132', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'Bangalore to Pune', 'Bangalore', 'Karnataka', 'Pune', 'Maharashtra', '733.89', '19.80', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b76df4e7-bb36-4894-92e3-b1938af1b917', '4720a80b-9615-4abc-b989-6732c1535ef0', 'Lucknow to Mumbai', 'Lucknow', 'Uttar Pradesh', 'Mumbai', 'Maharashtra', '537.02', '11.02', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b7f4796d-5681-41a0-b428-b3a385e34453', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'Global Express - Pune to Ahmedabad', 'Pune', 'Maharashtra', 'Ahmedabad', 'Gujarat', '1397.33', '10.73', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('b81dc3d5-2f90-41a7-9fab-ca57ad5bd38b', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', 'Rapid Delivery Co - Kolkata to Jaipur', 'Kolkata', 'West Bengal', 'Jaipur', 'Rajasthan', '807.48', '26.83', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b8ed2a9d-577a-4405-9d59-4ab6c9136608', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'Direct Route Systems - Jaipur to Lucknow', 'Jaipur', 'Rajasthan', 'Lucknow', 'Uttar Pradesh', '1260.60', '17.30', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c140de1c-e440-4628-a256-351bb5022c95', 'd18f7413-6231-423b-995f-889e6f9dad03', 'TechVision Solutions - Delhi to Mumbai', 'Delhi', 'Delhi', 'Mumbai', 'Maharashtra', '1408.79', '9.63', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c320dfe0-a00f-4fa2-9edb-5cd63b8be6a4', 'd18f7413-6231-423b-995f-889e6f9dad03', 'TechVision Solutions - Delhi to Chennai', 'Delhi', 'Delhi', 'Chennai', 'Tamil Nadu', '1552.20', '23.98', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c35629a1-7fd4-4d57-b472-a1a832ce5733', '406d0808-68a9-4f43-86c7-742774b247b2', 'Mumbai to Hyderabad', 'Mumbai', 'Maharashtra', 'Hyderabad', 'Telangana', '864.91', '23.32', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('c47f8db5-ed27-4d25-ab61-ea874d944085', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'Rapid Delivery Co - Kolkata to Lucknow', 'Kolkata', 'West Bengal', 'Lucknow', 'Uttar Pradesh', '1113.94', '25.18', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('c9ddc087-827b-4404-9d61-91b779c6d707', '991a7d85-aa91-4d1c-9800-72484f76b668', 'Golden Transport Pvt Ltd - Mumbai to Bangalore', 'Mumbai', 'Maharashtra', 'Bangalore', 'Karnataka', '1130.28', '37.13', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('ca7def23-8477-4d2c-91c6-5d0a7571179c', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'Swift Cargo Services - Chennai to Hyderabad', 'Chennai', 'Tamil Nadu', 'Hyderabad', 'Telangana', '1167.45', '33.62', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('cb33c916-0524-445b-9958-038ec1031c98', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'Swift Cargo Services - Chennai to Kolkata', 'Chennai', 'Tamil Nadu', 'Kolkata', 'West Bengal', '509.82', '35.17', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('cb45b545-0d71-4021-9731-d65693b150fd', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', 'Swift Cargo Services - Chennai to Hyderabad', 'Chennai', 'Tamil Nadu', 'Hyderabad', 'Telangana', '1722.21', '10.07', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('cbb591d2-90af-4c02-b148-392368b766af', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', 'Direct Route Systems - Jaipur to Mumbai', 'Jaipur', 'Rajasthan', 'Mumbai', 'Maharashtra', '260.53', '20.23', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('cf66c63e-89b0-47a5-9fbd-e43a47d2da93', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'Pune to Jaipur', 'Pune', 'Maharashtra', 'Jaipur', 'Rajasthan', '638.05', '15.12', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('cfeb4a63-6069-42a4-9573-cdcb4de262e4', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'Pune to Ahmedabad', 'Pune', 'Maharashtra', 'Ahmedabad', 'Gujarat', '347.38', '12.17', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d0ce75fc-0e3d-486a-ab69-b022b2c14d06', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'Direct Route Systems - Jaipur to Bangalore', 'Jaipur', 'Rajasthan', 'Bangalore', 'Karnataka', '1831.02', '46.18', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d409e036-5d07-4382-a5b2-3a9cc9213815', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'Delhi to Bangalore', 'Delhi', 'Delhi', 'Bangalore', 'Karnataka', '450.98', '10.42', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('d49460cd-0463-4cc9-833e-07fa42f0d928', '4720a80b-9615-4abc-b989-6732c1535ef0', 'Lucknow to Delhi', 'Lucknow', 'Uttar Pradesh', 'Delhi', 'Delhi', '278.92', '10.30', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d7b70309-689a-466f-a7c6-69e1b47e87c8', '56922ed8-effd-4e12-bf72-30609858ea63', 'Ahmedabad to Jaipur', 'Ahmedabad', 'Gujarat', 'Jaipur', 'Rajasthan', '518.49', '16.37', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d84adf98-a741-4465-89f2-682e9a082918', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'Rapid Delivery Co - Kolkata to Delhi', 'Kolkata', 'West Bengal', 'Delhi', 'Delhi', '1252.86', '10.98', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('db158550-2c1f-44bf-906a-e495dc3ee0ea', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'Mumbai to Hyderabad', 'Mumbai', 'Maharashtra', 'Hyderabad', 'Telangana', '467.07', '19.95', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('dbdb2dd9-b647-4df4-a92c-613d905877e1', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'Delhi to Bangalore', 'Delhi', 'Delhi', 'Bangalore', 'Karnataka', '271.67', '16.52', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('dbf78960-291e-4a19-9ee0-a71612a4131a', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'Excellence Logistics - Bangalore to Hyderabad', 'Bangalore', 'Karnataka', 'Hyderabad', 'Telangana', '277.04', '26.53', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('dfef91c6-9cd7-47e2-bc7d-b53645312f39', '56922ed8-effd-4e12-bf72-30609858ea63', 'Ahmedabad to Delhi', 'Ahmedabad', 'Gujarat', 'Delhi', 'Delhi', '796.55', '10.33', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e0aeea86-e6b1-4e97-a183-05553e17c07c', '882c6b27-ad53-45d6-a73b-76d8973c42b2', 'Rapid Delivery Co - Kolkata to Jaipur', 'Kolkata', 'West Bengal', 'Jaipur', 'Rajasthan', '795.98', '8.93', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e2c0ec24-406b-4e2a-bdbe-0a3c14c3dd86', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'Excellence Logistics - Bangalore to Kolkata', 'Bangalore', 'Karnataka', 'Kolkata', 'West Bengal', '713.20', '46.22', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e37802b7-8f05-4ce2-b302-0a99822472d5', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', 'Excellence Logistics - Bangalore to Chennai', 'Bangalore', 'Karnataka', 'Chennai', 'Tamil Nadu', '1492.02', '31.07', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e3df7300-6d71-48b6-af00-7a5dd9f2ec5c', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'Precision Freight - Hyderabad to Ahmedabad', 'Hyderabad', 'Telangana', 'Ahmedabad', 'Gujarat', '490.64', '21.25', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e4260774-243e-46b2-832b-908036b3eae4', '4720a80b-9615-4abc-b989-6732c1535ef0', 'Lucknow to Bangalore', 'Lucknow', 'Uttar Pradesh', 'Bangalore', 'Karnataka', '617.38', '9.03', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e5691e53-0e2f-4243-962f-e863d946f38e', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', 'Direct Route Systems - Jaipur to Mumbai', 'Jaipur', 'Rajasthan', 'Mumbai', 'Maharashtra', '1582.09', '11.92', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e60dae93-474c-4587-b7ec-5b35c3a30aa0', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', 'Quantum Logistics - Lucknow to Bangalore', 'Lucknow', 'Uttar Pradesh', 'Bangalore', 'Karnataka', '1936.33', '14.58', 'monthly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e7d9ecb6-e480-4c5b-ad81-32963d7785f7', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'Hyderabad to Kolkata', 'Hyderabad', 'Telangana', 'Kolkata', 'West Bengal', '427.10', '17.08', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('edd4be76-a620-4fb6-a24b-492d276a1dd8', 'd5e79369-a506-4f67-b286-0a5b560d024c', 'Excellence Logistics - Bangalore to Chennai', 'Bangalore', 'Karnataka', 'Chennai', 'Tamil Nadu', '1883.46', '24.95', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f1fe3363-b9b5-49b8-bd12-bf0adef0392c', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'Jaipur to Delhi', 'Jaipur', 'Rajasthan', 'Delhi', 'Delhi', '666.47', '16.73', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f475b880-385e-4089-82f8-520136b1f797', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', 'Precision Freight - Hyderabad to Pune', 'Hyderabad', 'Telangana', 'Pune', 'Maharashtra', '938.72', '34.45', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('f5156b74-9149-424c-8b28-be80cdc5cf71', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', 'Quantum Logistics - Lucknow to Mumbai', 'Lucknow', 'Uttar Pradesh', 'Mumbai', 'Maharashtra', '815.03', '47.22', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('f9e9ba2e-00ad-4004-aa3a-dab37c2efb25', '447b85f3-03bd-4bac-9966-180a174185e7', 'Premium Transport Hub - Ahmedabad to Jaipur', 'Ahmedabad', 'Gujarat', 'Jaipur', 'Rajasthan', '1342.46', '46.78', 'daily', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('fa982794-0632-49a4-8578-7e5025a78d14', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'Lucknow to Bangalore', 'Lucknow', 'Uttar Pradesh', 'Bangalore', 'Karnataka', '273.73', '4.37', 'monthly', 'Regular route for business purposes', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('fb57bb3c-fc44-4afc-acf5-85e2b3e773cb', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', 'Swift Cargo Services - Chennai to Ahmedabad', 'Chennai', 'Tamil Nadu', 'Ahmedabad', 'Gujarat', '1350.66', '37.53', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fbb541a6-e636-4e87-bebd-d27e2f463381', 'c87cffd8-ec15-4f90-8af1-361f86170e27', 'Global Express - Pune to Lucknow', 'Pune', 'Maharashtra', 'Lucknow', 'Uttar Pradesh', '448.59', '24.25', 'daily', 'Commercial shipment route - Regular schedule', 0, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('fcc10c19-53bd-4053-bc9f-7f2bd4910634', '934b83a2-698c-4669-86d9-e771b9ee2bc1', 'TechVision Solutions - Delhi to Bangalore', 'Delhi', 'Delhi', 'Bangalore', 'Karnataka', '1622.30', '27.65', 'weekly', 'Commercial shipment route - Regular schedule', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fce50944-3034-4dcd-b946-9cb3f930967d', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'Mumbai to Bangalore', 'Mumbai', 'Maharashtra', 'Bangalore', 'Karnataka', '495.90', '24.98', 'daily', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fd6bfb06-23ae-4923-8a32-82fc23aa3152', '56922ed8-effd-4e12-bf72-30609858ea63', 'Ahmedabad to Lucknow', 'Ahmedabad', 'Gujarat', 'Lucknow', 'Uttar Pradesh', '396.84', '13.32', 'weekly', 'Regular route for business purposes', 1, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fleets`
--

CREATE TABLE `fleets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `vehicle_number` varchar(50) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `vehicle_type` varchar(100) NOT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `year` smallint(5) UNSIGNED DEFAULT NULL,
  `capacity` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive','maintenance','retired') NOT NULL DEFAULT 'active',
  `current_location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goods`
--

CREATE TABLE `goods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_description` text DEFAULT NULL,
  `item_type` enum('furniture','electronics','clothing','food','machinery','materials','documents','other') NOT NULL DEFAULT 'other',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_of_measurement` varchar(50) NOT NULL DEFAULT 'pieces',
  `weight_kg` decimal(10,2) DEFAULT NULL,
  `length_cm` decimal(8,2) DEFAULT NULL,
  `breadth_cm` decimal(8,2) DEFAULT NULL,
  `height_cm` decimal(8,2) DEFAULT NULL,
  `declared_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `insurance_required` tinyint(1) NOT NULL DEFAULT 0,
  `fragile` tinyint(1) NOT NULL DEFAULT 0,
  `hazardous` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `goods`
--

INSERT INTO `goods` (`id`, `uuid`, `booking_uuid`, `item_name`, `item_description`, `item_type`, `quantity`, `unit_of_measurement`, `weight_kg`, `length_cm`, `breadth_cm`, `height_cm`, `declared_value`, `insurance_required`, `fragile`, `hazardous`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'a3135412-8749-46f7-a114-c396184fcfe1', '7a818d87-8671-46d4-8cd3-d9deb262c119', 'Item 1 for Booking 1', 'Test item description for goods tracking', 'documents', 7, 'pieces', '81.00', '147.00', '183.00', '56.00', '56295.00', 1, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(2, 'a77a48f8-a916-41d6-9c81-904f61c237ab', '7a818d87-8671-46d4-8cd3-d9deb262c119', 'Item 2 for Booking 1', 'Test item description for goods tracking', 'materials', 8, 'pieces', '43.00', '36.00', '125.00', '181.00', '43691.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(3, 'db20d2f4-9f23-4bd5-8338-c0f731579bff', '7a818d87-8671-46d4-8cd3-d9deb262c119', 'Item 3 for Booking 1', 'Test item description for goods tracking', 'materials', 2, 'pieces', '89.00', '110.00', '114.00', '32.00', '60467.00', 1, 0, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(4, 'f85cf9ab-a01b-4ade-9bb9-1e0cd801b1c2', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Item 1 for Booking 2', 'Test item description for goods tracking', 'electronics', 1, 'pieces', '30.00', '81.00', '155.00', '171.00', '55708.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(5, '103767fc-dbc7-442b-8063-f9718a87cd7e', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Item 2 for Booking 2', 'Test item description for goods tracking', 'materials', 1, 'pieces', '10.00', '57.00', '40.00', '107.00', '41041.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(6, '9d75037a-1143-4812-a0c4-75b3877819cc', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Item 3 for Booking 2', 'Test item description for goods tracking', 'documents', 2, 'pieces', '91.00', '43.00', '71.00', '130.00', '91636.00', 1, 1, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(7, '2c4c079a-e7a1-46c8-b344-99fddba2b9f9', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Item 4 for Booking 2', 'Test item description for goods tracking', 'machinery', 6, 'pieces', '86.00', '39.00', '162.00', '37.00', '80359.00', 0, 0, 0, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(8, '34f8d87a-1984-4625-b683-e18be5d53dc0', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', 'Item 1 for Booking 3', 'Test item description for goods tracking', 'food', 5, 'pieces', '87.00', '151.00', '170.00', '123.00', '30188.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(9, '1521eddc-1f02-4ed7-a355-755878a01f64', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', 'Item 2 for Booking 3', 'Test item description for goods tracking', 'documents', 1, 'pieces', '52.00', '173.00', '51.00', '91.00', '94979.00', 0, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(10, 'b148b055-4a30-4eb1-8f93-4e01a163ec94', '43d64598-113f-4fde-b778-68daeb531168', 'Item 1 for Booking 4', 'Test item description for goods tracking', 'documents', 3, 'pieces', '10.00', '59.00', '153.00', '118.00', '85638.00', 0, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(11, 'e32c6864-4a4d-4635-98b6-81ef4d524b2c', '43d64598-113f-4fde-b778-68daeb531168', 'Item 2 for Booking 4', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '30.00', '75.00', '144.00', '76.00', '36752.00', 0, 1, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(12, '14dbbc18-e71e-4f3c-bfdd-ff1c1b118f33', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 'Item 1 for Booking 5', 'Test item description for goods tracking', 'materials', 10, 'pieces', '82.00', '29.00', '64.00', '188.00', '72542.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(13, 'd9c09555-19e8-4f7a-a520-282df3ab0780', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 'Item 2 for Booking 5', 'Test item description for goods tracking', 'electronics', 10, 'pieces', '34.00', '108.00', '80.00', '96.00', '78570.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(14, '5b3d7585-e34b-4753-9d5f-b1e2e2d71d09', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 'Item 1 for Booking 6', 'Test item description for goods tracking', 'electronics', 3, 'pieces', '73.00', '115.00', '55.00', '20.00', '14823.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(15, '51af4abf-e95a-475c-a699-d5aa9897139b', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 'Item 2 for Booking 6', 'Test item description for goods tracking', 'documents', 7, 'pieces', '37.00', '156.00', '174.00', '148.00', '90639.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(16, '8b0a4e01-c3df-4295-a146-ad1024fcbd2a', '6ab8782b-520e-4586-b47f-8b5b37f53707', 'Item 1 for Booking 7', 'Test item description for goods tracking', 'materials', 8, 'pieces', '57.00', '29.00', '182.00', '141.00', '56257.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(17, 'a72c3d6a-0adb-4b1b-9c4a-d91d2afa55fa', '6ab8782b-520e-4586-b47f-8b5b37f53707', 'Item 2 for Booking 7', 'Test item description for goods tracking', 'documents', 8, 'pieces', '86.00', '152.00', '93.00', '75.00', '75689.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(18, '5e3bd5de-8644-4fea-a888-8148c27fec9d', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 'Item 1 for Booking 8', 'Test item description for goods tracking', 'materials', 8, 'pieces', '23.00', '77.00', '58.00', '182.00', '85403.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(19, '9e65ddd9-d54f-47a6-8460-761ca11058bc', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 'Item 2 for Booking 8', 'Test item description for goods tracking', 'food', 4, 'pieces', '1.00', '79.00', '66.00', '121.00', '15491.00', 0, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(20, '950d97ba-4045-4029-8825-726270a57e87', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 'Item 3 for Booking 8', 'Test item description for goods tracking', 'documents', 1, 'pieces', '43.00', '170.00', '34.00', '125.00', '80019.00', 1, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(21, '390e7974-5b4b-4ea8-aa2f-4e707ae443c8', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'Item 1 for Booking 9', 'Test item description for goods tracking', 'furniture', 10, 'pieces', '44.00', '82.00', '156.00', '67.00', '66387.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(22, 'b278a02f-826e-480c-b60a-170965050705', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'Item 2 for Booking 9', 'Test item description for goods tracking', 'documents', 8, 'pieces', '95.00', '51.00', '24.00', '45.00', '95584.00', 0, 1, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(23, '977e374a-c208-4d60-81c1-6541c6a1083a', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 'Item 1 for Booking 10', 'Test item description for goods tracking', 'machinery', 4, 'pieces', '96.00', '62.00', '95.00', '29.00', '44036.00', 1, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(24, '1f39a31e-05fe-470a-ac1b-b10783b09ad9', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 'Item 2 for Booking 10', 'Test item description for goods tracking', 'clothing', 7, 'pieces', '3.00', '118.00', '66.00', '165.00', '26783.00', 0, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(25, 'ebc9b920-d9dc-47b2-be2d-73f486744bda', '209da1f3-9fd1-476f-b514-7c9c546b576c', 'Item 1 for Booking 11', 'Test item description for goods tracking', 'clothing', 7, 'pieces', '18.00', '37.00', '26.00', '66.00', '21861.00', 1, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(26, '17920948-fe69-43b4-9bb6-6c34dc09e52e', '209da1f3-9fd1-476f-b514-7c9c546b576c', 'Item 2 for Booking 11', 'Test item description for goods tracking', 'machinery', 5, 'pieces', '36.00', '99.00', '168.00', '50.00', '81165.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(27, '0ca93585-f56e-4df4-a35c-02fbbad268f4', '209da1f3-9fd1-476f-b514-7c9c546b576c', 'Item 3 for Booking 11', 'Test item description for goods tracking', 'documents', 8, 'pieces', '20.00', '179.00', '139.00', '168.00', '96908.00', 0, 1, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(28, '73e77e82-3e45-4d85-8140-8b4855b5e212', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Item 1 for Booking 12', 'Test item description for goods tracking', 'food', 1, 'pieces', '11.00', '200.00', '96.00', '80.00', '26337.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(29, '3129e288-7f40-4f6d-9555-d08cda93cb11', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Item 2 for Booking 12', 'Test item description for goods tracking', 'electronics', 4, 'pieces', '11.00', '30.00', '117.00', '125.00', '75096.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(30, 'bfd009be-68b1-48dd-964f-1ea7d7763222', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Item 3 for Booking 12', 'Test item description for goods tracking', 'machinery', 8, 'pieces', '90.00', '112.00', '137.00', '169.00', '52039.00', 1, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(31, '8c65c314-69e2-4c7f-a78b-1b1a5ffb6535', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Item 4 for Booking 12', 'Test item description for goods tracking', 'machinery', 4, 'pieces', '61.00', '52.00', '93.00', '30.00', '49895.00', 0, 0, 0, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(32, '59e42731-5af2-4435-b27b-85a1e4e74bb9', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 'Item 1 for Booking 13', 'Test item description for goods tracking', 'machinery', 6, 'pieces', '48.00', '117.00', '22.00', '77.00', '26500.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(33, 'b27b2f77-7a42-4487-a74b-bcbebc355de3', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 'Item 2 for Booking 13', 'Test item description for goods tracking', 'electronics', 8, 'pieces', '63.00', '124.00', '176.00', '23.00', '89003.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(34, 'e6a1478f-f53d-4bdd-95e6-b75e166f47a8', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 'Item 3 for Booking 13', 'Test item description for goods tracking', 'machinery', 7, 'pieces', '9.00', '192.00', '159.00', '21.00', '59024.00', 0, 1, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(35, 'b0db2bc2-ed82-40fc-b83b-72e6f2b3b721', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 'Item 1 for Booking 14', 'Test item description for goods tracking', 'documents', 1, 'pieces', '12.00', '83.00', '144.00', '93.00', '48146.00', 1, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(36, 'f298db27-9ab8-478b-aea0-2d305c1125ef', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 'Item 2 for Booking 14', 'Test item description for goods tracking', 'materials', 1, 'pieces', '88.00', '98.00', '69.00', '54.00', '35964.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(37, '80cbc54e-11a9-403c-8a7d-abf286d29a9e', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Item 1 for Booking 15', 'Test item description for goods tracking', 'clothing', 10, 'pieces', '29.00', '20.00', '92.00', '107.00', '60582.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(38, '4afb3fd2-d462-4264-be60-5520b542823b', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Item 2 for Booking 15', 'Test item description for goods tracking', 'clothing', 5, 'pieces', '70.00', '171.00', '80.00', '121.00', '81784.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(39, 'b2172857-9c7e-4184-8c47-89e42b7fb67f', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Item 3 for Booking 15', 'Test item description for goods tracking', 'materials', 3, 'pieces', '82.00', '49.00', '195.00', '70.00', '41328.00', 0, 1, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(40, 'ba32f1f0-7bf9-4669-9eb1-f88b6b638319', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Item 4 for Booking 15', 'Test item description for goods tracking', 'electronics', 5, 'pieces', '54.00', '153.00', '89.00', '60.00', '91305.00', 1, 1, 1, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(41, '9c3630c8-62e9-46c8-a878-f1f7204866c6', 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', 'Item 1 for Booking 16', 'Test item description for goods tracking', 'clothing', 5, 'pieces', '9.00', '165.00', '175.00', '64.00', '81422.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(42, 'b3eb6572-a645-4738-a288-4d89602c4a67', 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', 'Item 2 for Booking 16', 'Test item description for goods tracking', 'materials', 4, 'pieces', '76.00', '51.00', '168.00', '135.00', '10981.00', 0, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(43, 'ec1e002d-2ce6-4873-b01b-e3d83c333ba1', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 'Item 1 for Booking 17', 'Test item description for goods tracking', 'food', 1, 'pieces', '87.00', '128.00', '188.00', '170.00', '61032.00', 1, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(44, '9026f714-471c-4fcc-aad6-bf34a2bd1644', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 'Item 2 for Booking 17', 'Test item description for goods tracking', 'materials', 5, 'pieces', '89.00', '70.00', '20.00', '35.00', '46354.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(45, '485988bb-bcb5-4955-aad8-3c1483ae9538', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 'Item 3 for Booking 17', 'Test item description for goods tracking', 'food', 1, 'pieces', '75.00', '44.00', '32.00', '25.00', '81653.00', 1, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(46, 'c73cdb51-1637-489a-ab17-71179e41228c', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Item 1 for Booking 18', 'Test item description for goods tracking', 'food', 9, 'pieces', '21.00', '73.00', '62.00', '143.00', '37307.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(47, '8c75370c-4346-481c-82db-a00c690d580e', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Item 2 for Booking 18', 'Test item description for goods tracking', 'materials', 8, 'pieces', '94.00', '154.00', '99.00', '20.00', '20343.00', 0, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(48, 'd888c38d-a4c5-480a-b8a2-369500b51d60', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Item 3 for Booking 18', 'Test item description for goods tracking', 'electronics', 4, 'pieces', '10.00', '95.00', '180.00', '125.00', '67611.00', 0, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(49, '40203e70-a18a-4761-a292-013b95e0158b', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Item 4 for Booking 18', 'Test item description for goods tracking', 'furniture', 7, 'pieces', '36.00', '108.00', '192.00', '146.00', '31359.00', 1, 1, 1, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(50, 'cdbfe105-a55f-4391-8a72-dc9079af36b5', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Item 1 for Booking 19', 'Test item description for goods tracking', 'electronics', 10, 'pieces', '59.00', '51.00', '59.00', '31.00', '76552.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(51, '222ac622-0b76-4dca-b69f-3ab6e7ffcb9c', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Item 2 for Booking 19', 'Test item description for goods tracking', 'clothing', 7, 'pieces', '99.00', '75.00', '136.00', '110.00', '93445.00', 0, 1, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(52, 'ebad6d75-65e1-4cdf-9fa4-7730562593fb', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Item 3 for Booking 19', 'Test item description for goods tracking', 'food', 1, 'pieces', '41.00', '114.00', '94.00', '64.00', '6517.00', 1, 0, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(53, '4c19a2a2-b0ac-4df1-a931-2300eacab429', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Item 4 for Booking 19', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '38.00', '186.00', '122.00', '64.00', '61555.00', 1, 0, 0, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(54, '0d257b4d-0901-453c-8306-9e9fdb8478f3', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 'Item 1 for Booking 20', 'Test item description for goods tracking', 'materials', 2, 'pieces', '98.00', '70.00', '64.00', '25.00', '84248.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(55, 'a4dd1950-dd41-46a7-9d4b-19ab3d4c5b89', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 'Item 2 for Booking 20', 'Test item description for goods tracking', 'materials', 7, 'pieces', '44.00', '112.00', '59.00', '102.00', '87545.00', 1, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(56, '38bb445b-3bb9-4bad-9bf7-0ca5919e5374', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 'Item 3 for Booking 20', 'Test item description for goods tracking', 'clothing', 2, 'pieces', '66.00', '143.00', '134.00', '83.00', '68618.00', 1, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(57, 'b772ed2c-15ff-45fa-8513-e58ead79bb4e', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 'Item 1 for Booking 1', 'Test item description for goods tracking', 'furniture', 6, 'pieces', '100.00', '38.00', '40.00', '135.00', '59181.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(58, '47e2c8b6-1a39-4397-a386-e7a239a7aa97', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 'Item 2 for Booking 1', 'Test item description for goods tracking', 'electronics', 4, 'pieces', '15.00', '152.00', '123.00', '153.00', '52271.00', 1, 1, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(59, '004de814-6382-4cfd-8d9a-4b22dda1d7f2', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 'Item 3 for Booking 1', 'Test item description for goods tracking', 'documents', 7, 'pieces', '64.00', '101.00', '180.00', '177.00', '69013.00', 1, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(60, '307d2328-847c-4743-8ce5-a783d344764a', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 'Item 1 for Booking 2', 'Test item description for goods tracking', 'clothing', 1, 'pieces', '87.00', '172.00', '149.00', '147.00', '60568.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(61, 'ff63110a-d5b7-47e0-b9aa-4e608480ef0d', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 'Item 2 for Booking 2', 'Test item description for goods tracking', 'machinery', 4, 'pieces', '74.00', '102.00', '95.00', '112.00', '85729.00', 0, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(62, 'e7d1a039-98fc-4fc2-84fe-4357c3369379', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 'Item 3 for Booking 2', 'Test item description for goods tracking', 'electronics', 5, 'pieces', '35.00', '146.00', '195.00', '87.00', '33103.00', 1, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(63, '4b5f2b13-5036-4603-bb90-a1e446133f41', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 'Item 1 for Booking 3', 'Test item description for goods tracking', 'machinery', 4, 'pieces', '16.00', '152.00', '93.00', '181.00', '18424.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(64, 'faaadb18-42f2-4de8-8fb2-862202a2d770', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 'Item 2 for Booking 3', 'Test item description for goods tracking', 'electronics', 8, 'pieces', '28.00', '32.00', '24.00', '116.00', '80116.00', 0, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(65, '86777521-438b-4f79-9191-f4a4c24a872f', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Item 1 for Booking 4', 'Test item description for goods tracking', 'electronics', 8, 'pieces', '23.00', '24.00', '119.00', '116.00', '89744.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(66, '496ac82b-4677-4678-ba34-ddc5d373fac8', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Item 2 for Booking 4', 'Test item description for goods tracking', 'food', 4, 'pieces', '80.00', '49.00', '72.00', '66.00', '75275.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(67, '9647ba0e-af5e-40fd-9901-04e06deb252c', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Item 3 for Booking 4', 'Test item description for goods tracking', 'electronics', 5, 'pieces', '37.00', '51.00', '41.00', '160.00', '71628.00', 0, 0, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(68, '7af5f715-7bf2-4e9f-bcd7-68820023895d', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Item 4 for Booking 4', 'Test item description for goods tracking', 'clothing', 7, 'pieces', '76.00', '163.00', '135.00', '71.00', '31511.00', 0, 1, 1, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(69, '78b0e1e1-1b1a-475e-9f93-c8b5f172a7b6', 'b800ca3d-e396-4630-8923-704f8c055f43', 'Item 1 for Booking 5', 'Test item description for goods tracking', 'food', 2, 'pieces', '83.00', '200.00', '66.00', '192.00', '11612.00', 1, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(70, '8c0ab9f2-5b56-4cfa-8550-fc6946fc159a', 'b800ca3d-e396-4630-8923-704f8c055f43', 'Item 2 for Booking 5', 'Test item description for goods tracking', 'food', 6, 'pieces', '60.00', '150.00', '78.00', '81.00', '35310.00', 1, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(71, 'a82af60d-c590-4216-bf95-a810fa746ea5', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 'Item 1 for Booking 6', 'Test item description for goods tracking', 'clothing', 5, 'pieces', '51.00', '70.00', '183.00', '199.00', '88425.00', 0, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(72, '73aae566-c53c-44f1-8648-11f1f7e314b8', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 'Item 2 for Booking 6', 'Test item description for goods tracking', 'machinery', 6, 'pieces', '66.00', '34.00', '68.00', '74.00', '94729.00', 0, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(73, 'a1ef30d5-9c05-48ca-9dfe-e360fe62b4bd', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 'Item 3 for Booking 6', 'Test item description for goods tracking', 'clothing', 1, 'pieces', '21.00', '79.00', '190.00', '99.00', '51556.00', 0, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(74, '67df68db-79bf-425a-a481-22e4bd5f4625', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 'Item 1 for Booking 7', 'Test item description for goods tracking', 'materials', 9, 'pieces', '95.00', '43.00', '176.00', '193.00', '43288.00', 1, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(75, 'dc993d07-117f-40ee-8f54-fccb85d61b08', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 'Item 2 for Booking 7', 'Test item description for goods tracking', 'documents', 5, 'pieces', '75.00', '152.00', '78.00', '144.00', '98137.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(76, 'c60897ff-97b6-4c53-b74a-08417ee4825a', '709ff274-58b5-4333-8233-baf43838e710', 'Item 1 for Booking 8', 'Test item description for goods tracking', 'machinery', 5, 'pieces', '28.00', '171.00', '73.00', '118.00', '24160.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(77, 'cb78824d-2b95-4204-8eaa-6940af5dc9f1', '709ff274-58b5-4333-8233-baf43838e710', 'Item 2 for Booking 8', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '44.00', '144.00', '37.00', '177.00', '54654.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(78, 'ecd86957-c1d3-4500-b7e1-d85cf39140b6', '709ff274-58b5-4333-8233-baf43838e710', 'Item 3 for Booking 8', 'Test item description for goods tracking', 'documents', 3, 'pieces', '36.00', '44.00', '55.00', '28.00', '92233.00', 0, 1, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(79, '2ab64941-f6d1-4bc3-a147-0994d7bd9e6c', '709ff274-58b5-4333-8233-baf43838e710', 'Item 4 for Booking 8', 'Test item description for goods tracking', 'clothing', 2, 'pieces', '74.00', '34.00', '131.00', '112.00', '7370.00', 0, 1, 1, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(80, '8619236f-5231-43e0-ad9c-60841b69c9b3', '0103e6b0-b672-4e9c-9f78-949005327ea6', 'Item 1 for Booking 9', 'Test item description for goods tracking', 'furniture', 7, 'pieces', '34.00', '131.00', '119.00', '191.00', '74980.00', 0, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(81, '5fe4abb1-cb37-4187-9b4d-4fb3c5583e7d', '0103e6b0-b672-4e9c-9f78-949005327ea6', 'Item 2 for Booking 9', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '41.00', '56.00', '132.00', '123.00', '67170.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(82, 'b3594760-c641-4ba1-bfe2-3e97931833cb', '0103e6b0-b672-4e9c-9f78-949005327ea6', 'Item 3 for Booking 9', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '14.00', '194.00', '23.00', '63.00', '67555.00', 0, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(83, 'def63130-abde-4cda-89f7-5905bc1434e2', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'Item 1 for Booking 10', 'Test item description for goods tracking', 'materials', 10, 'pieces', '55.00', '36.00', '168.00', '104.00', '77986.00', 0, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(84, '27594643-2c3c-4a47-8776-a9b1a0ee87ac', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'Item 2 for Booking 10', 'Test item description for goods tracking', 'furniture', 9, 'pieces', '9.00', '51.00', '158.00', '113.00', '16372.00', 1, 1, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(85, 'ace61a80-30be-49ff-9d45-2c1878bf4d60', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'Item 3 for Booking 10', 'Test item description for goods tracking', 'food', 10, 'pieces', '73.00', '30.00', '200.00', '119.00', '16612.00', 0, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(86, '514983f1-4f5f-46a4-b96c-f1dfd5f95b8d', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 'Item 1 for Booking 11', 'Test item description for goods tracking', 'electronics', 5, 'pieces', '92.00', '146.00', '106.00', '82.00', '9392.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(87, 'ec38e4e7-dce0-4879-af08-e527e5541553', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 'Item 2 for Booking 11', 'Test item description for goods tracking', 'materials', 1, 'pieces', '30.00', '36.00', '116.00', '101.00', '82006.00', 0, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(88, 'aad6e746-7fbd-42b3-8867-ccc77b174a0d', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Item 1 for Booking 12', 'Test item description for goods tracking', 'materials', 9, 'pieces', '46.00', '82.00', '54.00', '123.00', '24404.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(89, 'b13e1911-0f84-494d-bc28-8e1c9288d912', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Item 2 for Booking 12', 'Test item description for goods tracking', 'food', 5, 'pieces', '23.00', '84.00', '60.00', '25.00', '93862.00', 0, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(90, 'ac930625-c501-4170-bb78-0afcd3a8e99a', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Item 3 for Booking 12', 'Test item description for goods tracking', 'food', 8, 'pieces', '70.00', '81.00', '92.00', '170.00', '52990.00', 0, 0, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(91, '7b8373e6-2c6d-4330-81c2-07a48f3c2a58', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Item 4 for Booking 12', 'Test item description for goods tracking', 'materials', 4, 'pieces', '45.00', '166.00', '43.00', '181.00', '52477.00', 0, 0, 0, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(92, '6cc5481a-5a20-4b92-911e-551bde2b3495', '08a3ff07-acf9-4339-9f42-8fc01ac5109a', 'Item 1 for Booking 13', 'Test item description for goods tracking', 'furniture', 3, 'pieces', '12.00', '193.00', '130.00', '79.00', '6944.00', 1, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(93, '39224942-8c22-4f70-8f50-65e720bb5a61', '08a3ff07-acf9-4339-9f42-8fc01ac5109a', 'Item 2 for Booking 13', 'Test item description for goods tracking', 'electronics', 6, 'pieces', '68.00', '90.00', '22.00', '141.00', '89722.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(94, '8585b891-000c-4328-87bb-2a90c756fec6', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Item 1 for Booking 14', 'Test item description for goods tracking', 'materials', 1, 'pieces', '9.00', '169.00', '93.00', '68.00', '6938.00', 1, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(95, '84374378-7099-43d3-bd9b-7562e7c7aa48', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Item 2 for Booking 14', 'Test item description for goods tracking', 'electronics', 7, 'pieces', '68.00', '57.00', '82.00', '102.00', '93269.00', 1, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(96, '08110b32-db0c-45af-bc89-0633c6957939', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Item 3 for Booking 14', 'Test item description for goods tracking', 'machinery', 8, 'pieces', '58.00', '89.00', '93.00', '173.00', '39852.00', 0, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(97, 'c6679c6a-dc74-4f39-b15b-bf8b4bff1cf6', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Item 4 for Booking 14', 'Test item description for goods tracking', 'documents', 1, 'pieces', '3.00', '130.00', '27.00', '80.00', '23098.00', 1, 1, 0, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(98, '4c6ba6b6-1a6c-42f8-b66a-908ee2f73ee2', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 'Item 1 for Booking 15', 'Test item description for goods tracking', 'food', 5, 'pieces', '36.00', '91.00', '165.00', '57.00', '78389.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(99, '28b52e9e-7343-4df5-8a26-695c5af5a4ff', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 'Item 2 for Booking 15', 'Test item description for goods tracking', 'electronics', 2, 'pieces', '84.00', '187.00', '175.00', '168.00', '40998.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(100, 'aab077fa-cb74-4644-8907-8ab7367534a0', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 'Item 3 for Booking 15', 'Test item description for goods tracking', 'documents', 10, 'pieces', '74.00', '175.00', '124.00', '75.00', '53541.00', 0, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(101, '688ecffe-3d2d-4d9b-aac8-f7d81b788629', '52693403-a4ec-4a49-ac64-03c329b69ec8', 'Item 1 for Booking 16', 'Test item description for goods tracking', 'machinery', 1, 'pieces', '35.00', '135.00', '101.00', '92.00', '76322.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(102, '92f17641-403b-4555-8ba8-b0cf3dd1a20e', '52693403-a4ec-4a49-ac64-03c329b69ec8', 'Item 2 for Booking 16', 'Test item description for goods tracking', 'clothing', 8, 'pieces', '92.00', '97.00', '24.00', '106.00', '19265.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(103, 'b81ecaa7-fe03-4d49-a5e7-5a1ccb7c2907', '52693403-a4ec-4a49-ac64-03c329b69ec8', 'Item 3 for Booking 16', 'Test item description for goods tracking', 'furniture', 10, 'pieces', '50.00', '96.00', '105.00', '121.00', '62265.00', 0, 0, 1, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(104, '8452b2c2-5e6c-47d2-aed4-70447afc91a0', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'Item 1 for Booking 17', 'Test item description for goods tracking', 'furniture', 9, 'pieces', '94.00', '100.00', '94.00', '199.00', '43607.00', 0, 1, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(105, '320e26c2-a634-44b3-80f5-312aed3f2bba', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'Item 2 for Booking 17', 'Test item description for goods tracking', 'clothing', 6, 'pieces', '36.00', '149.00', '175.00', '65.00', '40525.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(106, '3abc5271-2d9b-46b7-8e61-c06999410d0a', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'Item 3 for Booking 17', 'Test item description for goods tracking', 'electronics', 1, 'pieces', '71.00', '177.00', '77.00', '21.00', '6335.00', 1, 1, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(107, '96d1aba3-ff52-47b8-9a45-ecb8ea7ae2b9', '9469d467-c76f-4a54-855e-39528eed20c3', 'Item 1 for Booking 18', 'Test item description for goods tracking', 'documents', 1, 'pieces', '59.00', '79.00', '171.00', '172.00', '39534.00', 0, 0, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(108, 'c8bf2b84-a621-47d2-a5ca-5d4a5c4d6d27', '9469d467-c76f-4a54-855e-39528eed20c3', 'Item 2 for Booking 18', 'Test item description for goods tracking', 'food', 5, 'pieces', '54.00', '96.00', '109.00', '125.00', '42746.00', 0, 0, 0, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(109, '0c19984f-3f7e-4d60-aace-6d44347817f2', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Item 1 for Booking 19', 'Test item description for goods tracking', 'documents', 9, 'pieces', '58.00', '113.00', '70.00', '114.00', '83842.00', 0, 1, 0, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(110, '90cc183c-b9a4-4224-a58a-b2e6bee94866', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Item 2 for Booking 19', 'Test item description for goods tracking', 'machinery', 4, 'pieces', '19.00', '46.00', '186.00', '91.00', '60052.00', 1, 1, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(111, '39a47dec-b93e-4226-8f74-ecfd520ea1ae', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Item 3 for Booking 19', 'Test item description for goods tracking', 'documents', 4, 'pieces', '66.00', '133.00', '164.00', '72.00', '51980.00', 0, 0, 0, 'Goods details - Item 3', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(112, '7939f6f5-e1c8-4736-8eb3-061a074181ab', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Item 4 for Booking 19', 'Test item description for goods tracking', 'electronics', 6, 'pieces', '61.00', '57.00', '111.00', '133.00', '34976.00', 1, 1, 1, 'Goods details - Item 4', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(113, '5696eb5c-ac95-44a2-bf3f-d31f9145ceef', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 'Item 1 for Booking 20', 'Test item description for goods tracking', 'electronics', 6, 'pieces', '1.00', '191.00', '137.00', '28.00', '50347.00', 0, 0, 1, 'Goods details - Item 1', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(114, 'dfe8020e-e98b-42d8-ba78-0ea8eb6341a8', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 'Item 2 for Booking 20', 'Test item description for goods tracking', 'electronics', 1, 'pieces', '43.00', '33.00', '150.00', '45.00', '46650.00', 1, 0, 1, 'Goods details - Item 2', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `gps_devices`
--

CREATE TABLE `gps_devices` (
  `uuid` char(36) NOT NULL,
  `vehicle_uuid` char(36) DEFAULT NULL,
  `device_id` varchar(255) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `device_model` varchar(255) NOT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `sim_number` varchar(255) DEFAULT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_endpoint` varchar(255) DEFAULT NULL,
  `polling_interval_seconds` int(11) NOT NULL DEFAULT 30,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `last_heartbeat_at` datetime DEFAULT NULL,
  `last_location_received_at` datetime DEFAULT NULL,
  `battery_voltage` decimal(5,2) DEFAULT NULL,
  `signal_strength` int(11) DEFAULT NULL,
  `location_accuracy` decimal(8,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gps_locations`
--

CREATE TABLE `gps_locations` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `vehicle_uuid` char(36) DEFAULT NULL,
  `gps_device_uuid` char(36) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` decimal(8,2) DEFAULT NULL,
  `speed` decimal(8,2) DEFAULT NULL,
  `heading` decimal(8,2) DEFAULT NULL,
  `altitude` decimal(8,2) DEFAULT NULL,
  `source` varchar(255) NOT NULL DEFAULT 'driver_mobile',
  `source_device_id` varchar(255) DEFAULT NULL,
  `recorded_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gsts`
--

CREATE TABLE `gsts` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `gst_number` varchar(20) NOT NULL,
  `business_name_gst` varchar(150) NOT NULL,
  `registration_type` enum('regular','composition','unregistered') NOT NULL DEFAULT 'regular',
  `state` varchar(50) NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `certificate_url` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gsts`
--

INSERT INTO `gsts` (`uuid`, `customer_uuid`, `gst_number`, `business_name_gst`, `registration_type`, `state`, `verified_at`, `certificate_url`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('09921893-6277-4bb4-afb6-f73a9e268b10', '841ebd9b-e413-4082-bde5-ca8c1eca9fd7', '20CCCC8728H1Z5', 'Quantum Logistics', 'regular', 'Ut', NULL, 'https://example.com/gst/cda6a0a4-3dfb-4a00-a8e5-2c804caf4e64.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('126e74af-d6e7-429e-99f3-db6dbce585aa', 'ae0c8289-1a2e-45ca-b73a-f9deaf7c6f1f', '33FFFF2881Y1Z5', 'Precision Freight', 'regular', 'Te', '2026-07-24 11:27:07', 'https://example.com/gst/69108dd9-419f-4990-8bf0-d0c69169d60f.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('311a8cbd-d521-472e-8870-ceb0d795f25a', '7625fcda-3e9b-4bbd-9cd7-07ede9bece86', '20AAAA2642O1Z5', 'Swift Cargo Services', 'regular', 'Ta', '2026-07-18 12:33:29', 'https://example.com/gst/962e4ccd-8663-4549-9e2e-dfad68dfadd4.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('34783ecc-b229-4707-b877-cd1cec87df4c', '934b83a2-698c-4669-86d9-e771b9ee2bc1', '08KKKK6292Y1Z5', 'TechVision Solutions', 'regular', 'De', '2026-07-10 12:33:29', 'https://example.com/gst/198cdcaa-409c-4cc6-a4d2-9ca4a5e59a7e.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('3dd81738-d98b-4503-93b4-edff43f5aa95', 'c361a239-287a-4767-b8e8-9c9d52fd07c3', '09FFFF1820Z1Z5', 'Precision Freight', 'regular', 'Te', '2026-06-01 12:33:29', 'https://example.com/gst/d3411b1a-aea8-436f-a1d5-9edcd0b9d49f.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('4ebfe194-0a89-4af5-93ba-a989fa2d37eb', 'c87cffd8-ec15-4f90-8af1-361f86170e27', '27KKKK9214N1Z5', 'Global Express', 'regular', 'Ma', '2026-07-26 11:27:07', 'https://example.com/gst/96569837-e68b-445f-8aac-078c17ba8c3e.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('5e88a6e2-5ca2-4b97-8d86-353fb25699cc', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', '27JJJJ8663M1Z5', 'Quantum Logistics', 'regular', 'Ut', NULL, 'https://example.com/gst/85c19a50-4b9a-4d9f-9109-1b3c80df4b6e.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('6d6fb172-baf4-4d64-a3be-bb67be2ca1c8', 'e2b9e78b-c90d-4890-84c7-be38bba275d0', '19EEEE7099G1Z5', 'Direct Route Systems', 'regular', 'Ra', NULL, 'https://example.com/gst/5b7967f4-2d52-47fd-aec4-edf510d8d79d.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('744fb533-f8f4-4e70-a5cb-76a45a965a05', 'd5590a4b-1d3a-48a8-9a14-986d0202a7bd', '33GGGG3821L1Z5', 'Direct Route Systems', 'regular', 'Ra', NULL, 'https://example.com/gst/f2dd83fa-0b2a-440b-8054-2373ef7b0c1a.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('87d5d82d-da61-4194-8e07-8f53eff93f8a', '991a7d85-aa91-4d1c-9800-72484f76b668', '09DDDD8840B1Z5', 'Golden Transport Pvt Ltd', 'regular', 'Ma', '2026-07-18 11:27:07', 'https://example.com/gst/5e259a0c-675b-4c15-9b90-077cedcf17ac.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('a3a939db-a95b-43ab-a79b-05b2d6ce2d63', '882c6b27-ad53-45d6-a73b-76d8973c42b2', '27DDDD5784S1Z5', 'Rapid Delivery Co', 'regular', 'We', '2026-06-14 11:27:07', 'https://example.com/gst/f6315bb5-1b62-4457-93c0-46ea95b2c491.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('aa6a49dc-8b66-4231-a232-a5fc3e32e629', '4bb644ff-daa2-4947-914d-6b6ce65fc1e6', '36DDDD1842X1Z5', 'Golden Transport Pvt Ltd', 'regular', 'Ma', '2026-06-25 12:33:29', 'https://example.com/gst/bea918a8-24cf-49ed-802a-375d889e731c.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('b03c4c7c-b0aa-4d35-b99a-016eac30a9ed', 'd5e79369-a506-4f67-b286-0a5b560d024c', '20FFFF6091L1Z5', 'Excellence Logistics', 'regular', 'Ka', '2026-06-02 11:27:07', 'https://example.com/gst/f1a73ed9-fd3d-476c-9f33-c0842cb5e586.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('b66002eb-aae6-413f-8340-2fb2f75a6008', 'efde88ae-73dd-4916-b09b-abeb2ad30b3d', '27AAAA1008F1Z5', 'Rapid Delivery Co', 'regular', 'We', '2026-06-01 12:33:29', 'https://example.com/gst/874b2e34-e787-484f-9512-f336b8932dc2.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('ca6f8e9f-4fd8-4cf2-8220-bc97d4eab75c', 'd18f7413-6231-423b-995f-889e6f9dad03', '06DDDD5906L1Z5', 'TechVision Solutions', 'regular', 'De', '2026-06-12 11:27:07', 'https://example.com/gst/7b3a966a-9a9c-44d0-9e77-51e4316231e9.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d23c2eb2-86a3-4bab-a48a-092e01d86d0e', '447b85f3-03bd-4bac-9966-180a174185e7', '20CCCC1516B1Z5', 'Premium Transport Hub', 'regular', 'Gu', NULL, 'https://example.com/gst/2eb11421-6e1f-4dea-9fb8-fa0399866bc5.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d9fddb1e-18b3-45c8-828a-bdb214c256d1', 'b18a0f50-6e74-4b76-983d-4e052ce12c45', '06BBBB4577G1Z5', 'Global Express', 'regular', 'Ma', '2026-06-05 12:33:29', 'https://example.com/gst/a7b44a91-cbf2-425c-9f2e-bb101b9523fc.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('e21960c5-bec8-444a-a0a8-dfb8a0f45583', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', '27JJJJ2527K1Z5', 'Swift Cargo Services', 'regular', 'Ta', '2026-07-03 11:27:07', 'https://example.com/gst/b9af2e58-912b-46d5-b2d2-b2e1f418a100.pdf', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e6666dd8-72e9-4ef3-918c-63f9b9f5f86e', '6d0aa410-e153-4219-a58e-d07cb5e6c3fa', '27BBBB6637R1Z5', 'Excellence Logistics', 'regular', 'Ka', '2026-06-20 12:33:29', 'https://example.com/gst/7d18b99f-6b2e-47ef-8bfd-cc4954e6f728.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('f47b9093-d717-4962-a8b5-babca88bab56', '90234901-9112-49ca-9b70-a37c48a61270', '08EEEE5368U1Z5', 'Premium Transport Hub', 'regular', 'Gu', NULL, 'https://example.com/gst/bb9327a1-3a8d-4895-a566-bc6beab87a89.pdf', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `gst_configs`
--

CREATE TABLE `gst_configs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `gst_type` enum('split','integrated') NOT NULL DEFAULT 'split',
  `sgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `igst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cess_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `pan_number` varchar(50) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gst_configs`
--

INSERT INTO `gst_configs` (`id`, `uuid`, `company_uuid`, `gst_number`, `gst_type`, `sgst_rate`, `cgst_rate`, `igst_rate`, `cess_rate`, `pan_number`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `email`, `phone`, `is_active`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '1a0bd41c-4f37-46de-98e3-caa33d445762', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', '27AABCR1234H1Z0', 'split', '9.00', '9.00', '18.00', '0.00', 'AAACR1234H', '123 Business Street', 'Tech Park', 'Bangalore', 'Karnataka', '560001', 'India', 'gst@company.com', '+91-9876543210', 1, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `individuals`
--

CREATE TABLE `individuals` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `pan_verified_at` timestamp NULL DEFAULT NULL,
  `aadhaar` varchar(20) DEFAULT NULL,
  `aadhaar_verified_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `individuals`
--

INSERT INTO `individuals` (`uuid`, `customer_uuid`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `pan`, `pan_verified_at`, `aadhaar`, `aadhaar_verified_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('345aeb5f-a85d-41f8-820f-d1dffcad2817', '84c80c82-6409-45ef-985d-782e6c86d1d4', 'Vikram', 'Gupta', 'vikram.gupta@example.com', '96013165185', '1981-07-30', 'male', 'FFFF8114O', '2026-05-31 11:27:06', '938714254831', '2026-07-01 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('3b187b3f-4efa-45b4-94e4-84a4e1231047', '9ebdbfb5-a5f2-495f-9d98-ea57126b6007', 'Sanjay', 'Reddy', 'sanjay.reddy@example.com', '94616899306', '1977-07-30', 'male', 'GGGG5647X', '2026-07-05 11:27:07', '113328238580', '2026-07-23 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('3c21976a-ecfa-4bc0-aa18-2394d7f3b322', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'Rajesh', 'Kumar', 'rajesh.kumar@example.com', '93142142523', '1974-07-30', 'male', 'FFFF4187G', '2026-07-11 12:33:29', '823967906455', '2026-05-20 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('541e0ae7-fa74-406f-8d2c-a66783c3a18d', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'Pooja', 'Rao', 'pooja.rao@example.com', '98044304779', '1964-07-30', 'female', 'CCCC5961T', '2026-06-18 12:33:29', '135811485662', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('64fd31e7-700e-4055-b037-aae6ea28dc66', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', 'Deepika', 'Sharma', 'deepika.sharma@example.com', '91688751044', '1974-07-30', 'female', 'GGGG7485Q', '2026-06-24 11:27:06', '247268823951', '2026-07-25 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('74afbd7d-dc5c-4a51-97df-c5e11261edab', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', 'Amit', 'Patel', 'amit.patel@example.com', '92694705463', '1964-07-30', 'male', 'DDDD8594D', '2026-07-29 11:27:06', '265604891932', '2026-06-04 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('75a93d79-0601-4c4c-88dc-28be8503e544', 'fc3090a1-eb26-4980-bb9e-4b93ba7da463', 'Amit', 'Patel', 'amit.patel@example.com', '97451350385', '1963-07-30', 'male', 'EEEE3024F', '2026-07-12 12:33:29', '578886642076', '2026-06-14 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('79a912d8-e8a6-4aac-b384-1855402eac0d', 'e2b8338d-c55b-4e77-95fe-2e2fd410c674', 'Arun', 'Desai', 'arun.desai@example.com', '98520956319', '1997-07-30', 'male', 'HHHH9585I', '2026-07-21 12:33:29', '125857213809', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('816790b5-96e2-49f6-9221-62434c629a94', '56922ed8-effd-4e12-bf72-30609858ea63', 'Pooja', 'Rao', 'pooja.rao@example.com', '97223850295', '1982-07-30', 'female', 'FFFF4534I', '2026-07-28 11:27:07', '328083149419', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('9208d6d9-30df-40ff-9afe-fc9f929c535c', 'd3ac351c-74c4-4a77-b984-7e7873f36a78', 'Priya', 'Singh', 'priya.singh@example.com', '96452315093', '1965-07-30', 'female', 'FFFF8018V', '2026-07-17 12:33:29', '459927440821', '2026-06-23 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('cc40791d-f94e-4cc9-984e-bb4737ffb2bc', 'fd003822-9b0f-4316-8b30-936657ba8baa', 'Vikram', 'Gupta', 'vikram.gupta@example.com', '92025957189', '1994-07-30', 'male', 'GGGG8416V', '2026-06-20 12:33:29', '765488568836', '2026-07-29 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d4c67209-0b75-43fb-8232-6bc1137224c6', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'Neha', 'Menon', 'neha.menon@example.com', '99798738995', '1968-07-30', 'female', 'JJJJ2753P', NULL, '392743522751', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('d6106a2f-500a-416b-b9de-093e23713981', '4720a80b-9615-4abc-b989-6732c1535ef0', 'Neha', 'Menon', 'neha.menon@example.com', '93465586146', '1989-07-30', 'female', 'JJJJ4430Y', NULL, '546870422064', NULL, NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('d7ffd287-152f-418d-8851-cd3982fc057a', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'Rajesh', 'Kumar', 'rajesh.kumar@example.com', '95999368759', '2000-07-30', 'male', 'BBBB1803R', '2026-06-18 11:27:06', '196687246690', '2026-06-16 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('e560fabf-d47d-414a-af0f-8d7ac88a89a3', 'c4d43208-f81f-4e10-863c-c83a6cc5a799', 'Arun', 'Desai', 'arun.desai@example.com', '94954627955', '1964-07-30', 'male', 'GGGG8783D', '2026-07-04 11:27:07', '116586653968', NULL, NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL),
('e7bed33b-8769-4ea9-801c-7c6d7a854312', 'a11b97a7-8dbb-4280-9c4c-7b3893d5e513', 'Sanjay', 'Reddy', 'sanjay.reddy@example.com', '97804802562', '1979-07-30', 'male', 'KKKK3900B', '2026-06-14 12:33:29', '949686596497', '2026-05-18 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('eb18de20-b68d-4a8f-8afa-ef24ed629a4f', '406d0808-68a9-4f43-86c7-742774b247b2', 'Priya', 'Singh', 'priya.singh@example.com', '91714687950', '1992-07-30', 'female', 'JJJJ2521M', '2026-07-15 11:27:06', '901904500645', '2026-06-15 11:27:06', NULL, NULL, NULL, '2026-07-30 11:27:06', '2026-07-30 11:27:06', NULL),
('f1cb03ef-5c7d-49c8-acdc-0c39748fa571', '8847a41f-f820-4185-875e-180ba15289cd', 'Deepika', 'Sharma', 'deepika.sharma@example.com', '99123597650', '1983-07-30', 'female', 'KKKK9264O', '2026-06-17 12:33:29', '446818553861', '2026-07-13 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fb98549a-3d14-408f-9a81-3c082abaafbb', 'be7376ce-e23d-491f-932b-4e630ed68ae2', 'Anjali', 'Verma', 'anjali.verma@example.com', '96180516577', '1964-07-30', 'female', 'FFFF9811A', '2026-06-23 12:33:29', '360895697348', '2026-05-25 12:33:29', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
('fdc59d9f-111d-4bbd-8467-be46027c3bb5', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'Anjali', 'Verma', 'anjali.verma@example.com', '98037900132', '1974-07-30', 'female', 'CCCC7472C', '2026-07-13 11:27:07', '525002221756', '2026-06-01 11:27:07', NULL, NULL, NULL, '2026-07-30 11:27:07', '2026-07-30 11:27:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `invoice_number` varchar(255) NOT NULL,
  `invoice_date` timestamp NOT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `sgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `sgst_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cgst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `cgst_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `igst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `igst_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_reason` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'draft' COMMENT 'draft, sent, viewed, partial, paid, overdue, cancelled',
  `notes` text DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`uuid`, `booking_uuid`, `customer_uuid`, `company_uuid`, `invoice_number`, `invoice_date`, `due_date`, `subtotal`, `gst_number`, `sgst_rate`, `sgst_amount`, `cgst_rate`, `cgst_amount`, `igst_rate`, `igst_amount`, `tax_amount`, `discount_amount`, `discount_reason`, `total_amount`, `status`, `notes`, `terms`, `sent_at`, `viewed_at`, `paid_at`, `cancelled_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('32995ccc-31af-4922-a8ad-5a6f09c83b27', '6ab8782b-520e-4586-b47f-8b5b37f53707', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202604-00001', '2026-04-02 18:30:00', '2026-05-02 18:30:00', '9000.00', '27AABCR1234H1Z0', '9.00', '810.00', '9.00', '810.00', '18.00', '0.00', '1620.00', '267.00', 'Early payment discount', '10353.00', 'paid', NULL, NULL, '2026-04-02 20:30:00', '2026-04-02 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('471ad370-7b1a-4266-86a2-95b52c5c0e2e', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202603-00001', '2026-03-07 18:30:00', '2026-04-06 18:30:00', '10000.00', '27AABCR1234H1Z0', '9.00', '900.00', '9.00', '900.00', '18.00', '0.00', '1800.00', '55.00', 'Early payment discount', '11745.00', 'viewed', NULL, NULL, '2026-03-07 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('500fba62-6825-478d-a118-f402eed80019', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202605-00002', '2026-05-18 18:30:00', '2026-06-17 18:30:00', '20000.00', '27AABCR1234H1Z0', '9.00', '1800.00', '9.00', '1800.00', '18.00', '0.00', '3600.00', '27.00', 'Early payment discount', '23573.00', 'overdue', NULL, NULL, '2026-05-18 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('60e47176-367e-409a-9fc3-47385ad3397c', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202511-00001', '2025-11-14 18:30:00', '2025-12-14 18:30:00', '14000.00', '27AABCR1234H1Z0', '9.00', '1260.00', '9.00', '1260.00', '18.00', '0.00', '2520.00', '462.00', 'Early payment discount', '16058.00', 'paid', NULL, NULL, '2025-11-14 20:30:00', '2025-11-14 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('60ef2d86-2e70-416e-bec4-08dab780a181', '43d64598-113f-4fde-b778-68daeb531168', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202603-00002', '2026-03-05 18:30:00', '2026-04-04 18:30:00', '11000.00', '27AABCR1234H1Z0', '9.00', '990.00', '9.00', '990.00', '18.00', '0.00', '1980.00', '200.00', 'Early payment discount', '12780.00', 'draft', NULL, NULL, '2026-03-05 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('6c7d7fb4-3e63-401e-965e-2bc5c17a9cf9', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202605-00001', '2026-04-30 18:30:00', '2026-05-30 18:30:00', '8000.00', '27AABCR1234H1Z0', '9.00', '720.00', '9.00', '720.00', '18.00', '0.00', '1440.00', '380.00', 'Early payment discount', '9060.00', 'partial', NULL, NULL, '2026-04-30 20:30:00', '2026-04-30 22:30:00', '2026-05-15 18:30:00', NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('6ff3cca0-3932-4a3e-919c-668db99c92d5', '6ab8782b-520e-4586-b47f-8b5b37f53707', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202603-00003', '2026-03-05 18:30:00', '2026-04-04 18:30:00', '22000.00', '27AABCR1234H1Z0', '9.00', '1980.00', '9.00', '1980.00', '18.00', '0.00', '3960.00', '144.00', 'Early payment discount', '25816.00', 'issued', NULL, NULL, '2026-03-05 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('73099919-2354-4d79-ac98-c004722133cb', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202509-00001', '2025-09-07 18:30:00', '2025-10-07 18:30:00', '16000.00', '27AABCR1234H1Z0', '9.00', '1440.00', '9.00', '1440.00', '18.00', '0.00', '2880.00', '164.00', 'Early payment discount', '18716.00', 'partial', NULL, NULL, '2025-09-07 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('85d47dc3-c116-494a-96f3-c364ab206bcf', '279c6661-e423-4fd9-a902-a37e223ebbe1', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202601-00001', '2026-01-11 18:30:00', '2026-02-10 18:30:00', '12000.00', '27AABCR1234H1Z0', '9.00', '1080.00', '9.00', '1080.00', '18.00', '0.00', '2160.00', '112.00', 'Early payment discount', '14048.00', 'partial', NULL, NULL, '2026-01-11 20:30:00', '2026-01-11 22:30:00', '2026-01-26 18:30:00', NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('882873bb-17c7-4728-be43-447f23a99ffd', '6ab8782b-520e-4586-b47f-8b5b37f53707', '34b4d050-3750-4ef3-a71f-902d8024ca7a', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202601-00002', '2026-01-10 18:30:00', '2026-02-09 18:30:00', '24000.00', '27AABCR1234H1Z0', '9.00', '2160.00', '9.00', '2160.00', '18.00', '0.00', '4320.00', '269.00', 'Early payment discount', '28051.00', 'overdue', NULL, NULL, '2026-01-10 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('9068585c-c475-460e-a189-2c34eab13c96', '6ab8782b-520e-4586-b47f-8b5b37f53707', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202508-00001', '2025-08-10 18:30:00', '2025-09-09 18:30:00', '17000.00', '27AABCR1234H1Z0', '9.00', '1530.00', '9.00', '1530.00', '18.00', '0.00', '3060.00', '289.00', 'Early payment discount', '19771.00', 'viewed', NULL, NULL, '2025-08-10 20:30:00', '2025-08-10 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('98937ee0-ee60-4e36-aa3f-b99097ea6171', 'a0ecbc3b-5276-4157-b46c-45380aca88de', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202603-00004', '2026-03-13 18:30:00', '2026-04-12 18:30:00', '23000.00', '27AABCR1234H1Z0', '9.00', '2070.00', '9.00', '2070.00', '18.00', '0.00', '4140.00', '500.00', 'Early payment discount', '26640.00', 'partial', NULL, NULL, '2026-03-13 20:30:00', '2026-03-13 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('b0ce23fa-743e-44d4-bdc9-ef3e789375b4', 'a0ecbc3b-5276-4157-b46c-45380aca88de', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202604-00002', '2026-04-05 18:30:00', '2026-05-05 18:30:00', '21000.00', '27AABCR1234H1Z0', '9.00', '1890.00', '9.00', '1890.00', '18.00', '0.00', '3780.00', '161.00', 'Early payment discount', '24619.00', 'issued', NULL, NULL, '2026-04-05 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('c2bdba5e-ffb9-4e9f-8b29-da9fc128c84f', 'ba8e5541-eeee-41c3-ac67-e938e38da949', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202512-00002', '2025-12-10 18:30:00', '2026-01-09 18:30:00', '25000.00', '27AABCR1234H1Z0', '9.00', '2250.00', '9.00', '2250.00', '18.00', '0.00', '4500.00', '118.00', 'Early payment discount', '29382.00', 'paid', NULL, NULL, '2025-12-10 20:30:00', '2025-12-10 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('c9dd6ec7-3d5d-4200-b7ac-0c46eb1e3c1c', '43d64598-113f-4fde-b778-68daeb531168', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202512-00001', '2025-12-24 18:30:00', '2026-01-23 18:30:00', '13000.00', '27AABCR1234H1Z0', '9.00', '1170.00', '9.00', '1170.00', '18.00', '0.00', '2340.00', '397.00', 'Early payment discount', '14943.00', 'draft', NULL, NULL, '2025-12-24 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('d12a337d-b0e8-43fa-bc86-8a595c86338d', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202607-00002', '2026-07-20 18:30:00', '2026-08-19 18:30:00', '18000.00', '27AABCR1234H1Z0', '9.00', '1620.00', '9.00', '1620.00', '18.00', '0.00', '3240.00', '251.00', 'Early payment discount', '20989.00', 'draft', NULL, NULL, '2026-07-20 20:30:00', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('dcdd8e87-c39e-4f28-98de-8b96ef162433', 'a0ecbc3b-5276-4157-b46c-45380aca88de', '3fd5243f-222a-406f-ad4a-e44e91e554aa', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202510-00001', '2025-10-15 18:30:00', '2025-11-14 18:30:00', '15000.00', '27AABCR1234H1Z0', '9.00', '1350.00', '9.00', '1350.00', '18.00', '0.00', '2700.00', '154.00', 'Early payment discount', '17546.00', 'issued', NULL, NULL, '2025-10-15 20:30:00', NULL, '2025-10-30 18:30:00', NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('e76cff22-425c-4cb0-b7a5-3832e26a3f04', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202606-00001', '2026-06-18 18:30:00', '2026-07-18 18:30:00', '7000.00', '27AABCR1234H1Z0', '9.00', '630.00', '9.00', '630.00', '18.00', '0.00', '1260.00', '348.00', 'Early payment discount', '7912.00', 'viewed', NULL, NULL, '2026-06-18 20:30:00', '2026-06-18 22:30:00', '2026-07-03 18:30:00', NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('ece266a6-4e0f-4e8a-948e-f4b3f9d17aea', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202607-00001', '2026-07-14 18:30:00', '2026-08-13 18:30:00', '6000.00', '27AABCR1234H1Z0', '9.00', '540.00', '9.00', '540.00', '18.00', '0.00', '1080.00', '259.00', 'Early payment discount', '6821.00', 'overdue', NULL, NULL, '2026-07-14 20:30:00', '2026-07-14 22:30:00', NULL, NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
('fe2abf0b-6549-499b-a0c6-6d254c1b38c8', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'INV-202606-00002', '2026-06-15 18:30:00', '2026-07-15 18:30:00', '19000.00', '27AABCR1234H1Z0', '9.00', '1710.00', '9.00', '1710.00', '18.00', '0.00', '3420.00', '342.00', 'Early payment discount', '22078.00', 'issued', NULL, NULL, '2026-06-15 20:30:00', '2026-06-15 22:30:00', '2026-06-30 18:30:00', NULL, NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ledgers`
--

CREATE TABLE `ledgers` (
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `customer_uuid` char(36) DEFAULT NULL,
  `ledger_type` varchar(255) NOT NULL COMMENT 'company_ledger, customer_ledger, driver_ledger',
  `account_code` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `opening_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_debit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'active' COMMENT 'active, inactive, archived',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ledgers`
--

INSERT INTO `ledgers` (`uuid`, `company_uuid`, `customer_uuid`, `ledger_type`, `account_code`, `account_name`, `opening_balance`, `current_balance`, `total_debit`, `total_credit`, `status`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('b45bf63f-97c5-41e1-8e98-cc538e77896e', NULL, '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'customer_ledger', 'CUST-1mS6bm', 'Account for ', '0.00', '0.00', '0.00', '0.00', 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ledger_entries`
--

CREATE TABLE `ledger_entries` (
  `uuid` char(36) NOT NULL,
  `ledger_uuid` char(36) NOT NULL,
  `payment_uuid` char(36) DEFAULT NULL,
  `invoice_uuid` char(36) DEFAULT NULL,
  `transaction_type` varchar(255) NOT NULL COMMENT 'debit, credit',
  `amount` decimal(12,2) NOT NULL,
  `reference_type` varchar(255) DEFAULT NULL COMMENT 'payment, booking, refund, adjustment',
  `reference_uuid` char(36) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `remarks` text DEFAULT NULL,
  `cheque_number` varchar(255) DEFAULT NULL,
  `cheque_date` timestamp NULL DEFAULT NULL,
  `is_reconciled` tinyint(1) NOT NULL DEFAULT 0,
  `reconciled_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ledger_entries`
--

INSERT INTO `ledger_entries` (`uuid`, `ledger_uuid`, `payment_uuid`, `invoice_uuid`, `transaction_type`, `amount`, `reference_type`, `reference_uuid`, `description`, `remarks`, `cheque_number`, `cheque_date`, `is_reconciled`, `reconciled_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('202ab789-df99-45aa-94c7-d5f5c3d9c29a', 'b45bf63f-97c5-41e1-8e98-cc538e77896e', NULL, NULL, 'credit', '7132.00', 'booking', NULL, 'Sample ledger entry for booking', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `live_locations`
--

CREATE TABLE `live_locations` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `current_latitude` decimal(10,8) NOT NULL,
  `current_longitude` decimal(11,8) NOT NULL,
  `last_updated_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `device_battery_percentage` int(11) DEFAULT NULL,
  `network_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loads`
--

CREATE TABLE `loads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `load_reference` varchar(50) NOT NULL,
  `posted_by_uuid` char(36) DEFAULT NULL,
  `posted_by_role` varchar(30) DEFAULT NULL,
  `posted_by_name` varchar(200) DEFAULT NULL,
  `on_behalf_of_customer` varchar(200) DEFAULT NULL,
  `pickup_city` varchar(100) NOT NULL,
  `drop_city` varchar(100) NOT NULL,
  `pickup_address` varchar(500) DEFAULT NULL,
  `drop_address` varchar(500) DEFAULT NULL,
  `material` varchar(255) NOT NULL,
  `weight_tons` decimal(10,2) NOT NULL DEFAULT 0.00,
  `vehicle_type` varchar(100) NOT NULL,
  `pickup_date` date DEFAULT NULL,
  `budget` decimal(14,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('open','applications_received','booked','in_transit','delivered','cancelled') NOT NULL DEFAULT 'open',
  `applications_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `load_applications`
--

CREATE TABLE `load_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `application_reference` varchar(50) NOT NULL,
  `load_uuid` char(36) NOT NULL,
  `applicant_uuid` char(36) NOT NULL,
  `applicant_role` varchar(30) NOT NULL,
  `applicant_name` varchar(200) NOT NULL,
  `vehicle_reg_number` varchar(30) NOT NULL,
  `vehicle_type` varchar(100) NOT NULL,
  `availability` varchar(100) NOT NULL,
  `quoted_amount` decimal(14,2) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','negotiating','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marketplace_bookings`
--

CREATE TABLE `marketplace_bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `load_uuid` char(36) NOT NULL,
  `application_uuid` char(36) NOT NULL,
  `owner_uuid` char(36) NOT NULL,
  `provider_uuid` char(36) NOT NULL,
  `gross_freight` decimal(14,2) NOT NULL,
  `shipper_fee` decimal(14,2) DEFAULT NULL,
  `provider_fee` decimal(14,2) DEFAULT NULL,
  `total_commission` decimal(14,2) DEFAULT NULL,
  `shipper_payable` decimal(14,2) DEFAULT NULL,
  `provider_payout` decimal(14,2) DEFAULT NULL,
  `commission_policy_version` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('awaiting_tokens','confirmed','in_transit','completed','cancelled','disputed') NOT NULL DEFAULT 'awaiting_tokens',
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marketplace_disputes`
--

CREATE TABLE `marketplace_disputes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `raised_by_uuid` char(36) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('open','under_review','resolved') NOT NULL DEFAULT 'open',
  `resolution` varchar(40) DEFAULT NULL,
  `resolved_by_uuid` char(36) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marketplace_settlements`
--

CREATE TABLE `marketplace_settlements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `gross_freight` decimal(14,2) NOT NULL,
  `shipper_fee` decimal(14,2) NOT NULL,
  `provider_fee` decimal(14,2) NOT NULL,
  `shipper_payable` decimal(14,2) NOT NULL,
  `provider_payout` decimal(14,2) NOT NULL,
  `status` enum('pending','processing','settled','held','failed') NOT NULL DEFAULT 'pending',
  `settled_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000001_create_payments_table', 1),
(5, '2024_01_01_000002_create_wallets_table', 1),
(6, '2024_01_01_000003_create_wallet_transactions_table', 1),
(7, '2024_01_01_000004_create_upi_payments_table', 1),
(8, '2024_01_01_000005_create_online_payments_table', 1),
(9, '2024_01_01_000006_create_cod_payments_table', 1),
(10, '2024_01_01_000007_create_invoices_table', 1),
(11, '2024_01_01_000008_create_ledgers_table', 1),
(12, '2024_01_01_000009_create_ledger_entries_table', 1),
(13, '2026080100_create_customers_table', 1),
(14, '2026080101_create_addresses_table', 1),
(15, '2026080102_create_businesses_table', 1),
(16, '2026080103_create_favorite_routes_table', 1),
(17, '2026080104_create_gsts_table', 1),
(18, '2026080105_create_individuals_table', 1),
(19, '2026080199_create_bookings_table', 1),
(20, '2026080200_create_pickups_table', 1),
(21, '2026080201_create_drops_table', 1),
(22, '2026080202_create_goods_table', 1),
(23, '2026080203_create_stopages_table', 1),
(24, '2026080204_create_gps_locations_table', 1),
(25, '2026080205_create_live_locations_table', 1),
(26, '2026080206_create_etas_table', 1),
(27, '2026080207_create_route_histories_table', 1),
(28, '2026080208_create_tracking_notifications_table', 1),
(29, '2026080209_create_gps_devices_table', 1),
(30, '2026_01_01_000000_create_branches_table', 1),
(31, '2026_01_01_000001_create_companies_table', 1),
(32, '2026_01_01_000001_create_departments_table', 1),
(33, '2026_01_01_000001_create_designations_table', 1),
(34, '2026_01_01_000001_create_fleets_table', 1),
(35, '2026_01_01_000001_create_states_table', 1),
(36, '2026_01_01_000001_create_trackings_table', 1),
(37, '2026_01_01_000001_create_vehicles_table', 1),
(38, '2026_07_02_182007_create_personal_access_tokens_table', 1),
(39, '2026_07_02_182051_create_permission_tables', 1),
(40, '2026_07_02_182139_create_activity_log_table', 1),
(41, '2026_07_02_182140_add_event_column_to_activity_log_table', 1),
(42, '2026_07_02_182141_add_batch_uuid_column_to_activity_log_table', 1),
(43, '2026_07_19_000001_migrate_users_table', 1),
(44, '2026_07_19_000002_create_role_permission_table', 1),
(45, '2026_07_19_000003_create_role_user_table', 1),
(46, '2026_07_19_114430_add_custom_columns_to_spatie_tables', 1),
(47, '2026_07_19_114900_fix_users_table_schema', 1),
(48, '2026_07_19_130915_create_refresh_tokens_table', 1),
(49, '2026_07_19_151000_create_access_tokens_table', 1),
(50, '2026_07_19_153000_add_mpin_to_users_table', 1),
(51, '2026_07_19_160000_create_mpin_reset_otps_table', 1),
(52, '2026_07_19_170000_create_registration_otps_table', 1),
(53, '2026_07_19_171000_alter_users_status_column', 1),
(54, '2026_07_19_221500_create_sms_messages_table', 1),
(55, '2026_07_19_222500_add_retry_metadata_to_sms_messages_table', 1),
(56, '2026_07_19_223000_create_notifications_table', 1),
(57, '2026_07_27_000002_add_compliance_and_contact_fields_to_companies_table', 1),
(58, '2026_07_29_000000_add_user_type_and_mpin_to_users_table', 1),
(59, '2026_07_29_000001_create_drivers_table', 1),
(60, '2026_07_29_000001_create_trucks_table', 1),
(61, '2026_07_29_000002_create_driver_profiles_table', 1),
(62, '2026_07_29_000002_create_trailers_table', 1),
(63, '2026_07_29_000003_create_containers_table', 1),
(64, '2026_07_29_000003_create_driver_aadhaar_table', 1),
(65, '2026_07_29_000004_create_driver_licenses_table', 1),
(66, '2026_07_29_000004_create_vehicle_insurance_table', 1),
(67, '2026_07_29_000005_create_driver_experience_table', 1),
(68, '2026_07_29_000005_create_vehicle_fitness_table', 1),
(69, '2026_07_29_000006_create_driver_ratings_table', 1),
(70, '2026_07_29_000006_create_vehicle_rc_table', 1),
(71, '2026_07_29_000007_create_driver_emergency_contacts_table', 1),
(72, '2026_07_29_000007_create_vehicle_permits_table', 1),
(73, '2026_07_29_000008_create_vehicle_pollution_table', 1),
(74, '2026_07_29_000009_create_vehicle_gps_table', 1),
(75, '2026_07_29_172423_update_bookings_table_add_new_fields', 1),
(79, '2024_12_30_create_gst_configs_table', 2),
(80, '2024_12_30_create_receipts_table', 2),
(81, 'create_invoices_table', 2),
(82, '2024_12_31_create_notification_channel_configs_table', 3),
(83, '2024_12_31_create_notification_templates_table', 3),
(84, '2024_12_31_create_notifications_table', 3),
(85, '2026100601_create_loads_table', 4),
(86, '2026100602_create_load_applications_table', 4),
(87, '2026100603_create_negotiation_offers_table', 4),
(88, '2026100604_create_marketplace_bookings_table', 4),
(89, '2026100605_create_booking_token_orders_table', 4),
(90, '2026100606_create_payment_webhook_events_table', 4),
(91, '2026100607_add_refund_fields_to_booking_token_orders_table', 4),
(92, '2026_08_01_230000_create_companies_table', 4),
(93, '2026_08_01_230100_create_departments_table', 4),
(94, '2026_08_01_230200_create_designations_table', 4),
(95, '2026_08_01_235500_create_documents_table', 4),
(96, '2026_08_01_235600_create_document_templates_table', 4),
(97, '2026_08_01_235700_create_document_approvals_table', 4),
(98, 'create_notifications_table', 5),
(99, '2026100608_add_commission_snapshot_to_marketplace_bookings_table', 6),
(100, '2026100609_create_marketplace_settlements_table', 7),
(101, '2026100610_create_marketplace_disputes_table', 8);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mpin_reset_otps`
--

CREATE TABLE `mpin_reset_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_uuid` varchar(36) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `max_attempts` smallint(5) UNSIGNED NOT NULL DEFAULT 5,
  `verified_at` timestamp NULL DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `negotiation_offers`
--

CREATE TABLE `negotiation_offers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `application_uuid` char(36) NOT NULL,
  `load_uuid` char(36) NOT NULL,
  `by_role` varchar(20) NOT NULL,
  `by_uuid` char(36) NOT NULL,
  `by_name` varchar(200) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `message` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `recipient_id` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `template_key` varchar(255) DEFAULT NULL,
  `subject` longtext DEFAULT NULL,
  `content` longtext NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `retry_count` int(11) NOT NULL DEFAULT 0,
  `max_retries` int(11) NOT NULL DEFAULT 3,
  `external_id` varchar(255) DEFAULT NULL,
  `provider_response` longtext DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `queued_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `failure_reason` longtext DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`uuid`, `company_uuid`, `recipient_id`, `channel`, `template_key`, `subject`, `content`, `variables`, `status`, `retry_count`, `max_retries`, `external_id`, `provider_response`, `metadata`, `queued_at`, `sent_at`, `failed_at`, `failure_reason`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('14a5d051-0718-4bcb-b51f-f10dc68a9f1b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'driver@email.com', 'email', 'booking_created', 'Booking Confirmation', 'Booking #BK004 confirmed for delivery.', '{\"booking_id\":\"BK004\",\"customer_name\":\"Test Customer 4\"}', 'pending', 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('24e41b53-e0d9-4282-9960-d77add3db560', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', '9876543210', 'sms', 'booking_created', 'Booking Confirmation', 'Booking #BK001 confirmed for delivery.', '{\"booking_id\":\"BK001\",\"customer_name\":\"Test Customer 1\"}', 'sent', 0, 3, 'EXT6a6b9d2358a30', NULL, NULL, NULL, '2026-07-30 13:21:15', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('55b0ee81-1e02-4e7e-b1fa-5006f9e4b204', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'customer@email.com', 'email', 'booking_created', 'Booking Confirmation', 'Booking #BK003 confirmed for delivery.', '{\"booking_id\":\"BK003\",\"customer_name\":\"Test Customer 3\"}', 'sent', 0, 3, 'EXT6a6b9d235a0f6', NULL, NULL, NULL, '2026-07-30 11:21:15', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('69b590d1-bab6-4222-a8c2-9918a663d272', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'device_token_123', 'push', 'booking_created', 'Booking Confirmation', 'Booking #BK005 confirmed for delivery.', '{\"booking_id\":\"BK005\",\"customer_name\":\"Test Customer 5\"}', 'queued', 0, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('cf3038e2-592c-4b1d-b0c0-a7c0e689a153', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', '9876543211', 'sms', 'booking_created', 'Booking Confirmation', 'Booking #BK002 confirmed for delivery.', '{\"booking_id\":\"BK002\",\"customer_name\":\"Test Customer 2\"}', 'sent', 0, 3, 'EXT6a6b9d2359bb7', NULL, NULL, NULL, '2026-07-30 12:21:15', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('ec00acec-3222-406b-ad90-48a711e2efd5', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', '919876543210', 'whatsapp', 'booking_created', 'Booking Confirmation', 'Booking #BK006 confirmed for delivery.', '{\"booking_id\":\"BK006\",\"customer_name\":\"Test Customer 6\"}', 'failed', 2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification_channel_configs`
--

CREATE TABLE `notification_channel_configs` (
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `credentials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`credentials`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `rate_limit_per_minute` varchar(255) DEFAULT NULL,
  `supported_features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`supported_features`)),
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `notes` longtext DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_channel_configs`
--

INSERT INTO `notification_channel_configs` (`uuid`, `company_uuid`, `channel`, `provider`, `credentials`, `is_active`, `rate_limit_per_minute`, `supported_features`, `settings`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('172677d6-fc90-44b3-8dd4-f7a64e8b3a81', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'push', 'firebase', '{\"api_key\":\"FlUvPETSFxv6BzAUJ49A8E6ySFWzT8SrHFIPRWR\",\"project_id\":\"transportseva-project\"}', 1, '300', '[\"fcm\",\"apns\",\"custom_data\"]', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('3492af5a-9ba6-4442-83ef-3c1416b34bc7', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'email', 'laravel_mail', '{\"from_address\":\"notifications@transportseva.com\",\"from_name\":\"TransportSeva\"}', 1, '200', '[\"html\",\"attachments\",\"cc_bcc\"]', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('59ecc8e0-cc64-439b-bf60-e3074e2dd511', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'sms', 'twilio', '{\"account_sid\":\"ACfTR6KAorj75RshzTUH6tqFYard50ltXK\",\"auth_token\":\"83daW2Ahs5Y8BWm2philSmRWpWqY0FYW8p\",\"from_number\":\"+1234567890\"}', 1, '100', '[\"bulk_send\",\"delivery_reports\",\"long_codes\"]', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('fdc8cb07-4fad-4527-83f9-b64f00694357', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'whatsapp', 'twilio', '{\"account_sid\":\"ACL0ohmcmOyKNw5JVQbZwoDIHmEIwopJia\",\"auth_token\":\"xhsu3kcnxmCvz6G7mnv2XIuGrAT4XzkBlM\",\"whatsapp_number\":\"+1234567890\"}', 1, '50', '[\"template_messages\",\"media\",\"interactive\"]', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification_templates`
--

CREATE TABLE `notification_templates` (
  `uuid` char(36) NOT NULL,
  `company_uuid` char(36) NOT NULL,
  `key` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` longtext NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `priority` int(11) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_templates`
--

INSERT INTO `notification_templates` (`uuid`, `company_uuid`, `key`, `channel`, `name`, `subject`, `body`, `variables`, `is_active`, `priority`, `description`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('04f2d068-e6f1-46df-b75b-a614ffda15b5', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'payment_received', 'email', 'Payment Received Email', 'Payment Confirmation - Booking #{{booking_id}}', 'Payment of ₹{{amount}} has been received for booking #{{booking_id}}. Your receipt: {{receipt_url}}', '[\"amount\",\"booking_id\",\"receipt_url\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('22dc7eba-8b73-450a-ba25-ce06f915a7b0', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'booking_created', 'whatsapp', 'Booking Created WhatsApp', NULL, 'Booking #{{booking_id}} confirmed! Pickup: {{pickup_location}}', '[\"booking_id\",\"pickup_location\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('287373b7-3744-4b55-9a58-2c9611e56d7e', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'payment_reminder', 'email', 'Payment Reminder Email', 'Payment Reminder - Invoice {{invoice_id}}', 'Your invoice {{invoice_id}} for ₹{{amount}} is due on {{due_date}}.', '[\"invoice_id\",\"amount\",\"due_date\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('430a3c2f-a894-495d-8d97-218c8fb15a1c', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'booking_created', 'sms', 'Booking Created SMS', NULL, 'Hi {{customer_name}}, your booking #{{booking_id}} has been created. Pickup: {{pickup_location}}, Drop: {{drop_location}}', '[\"customer_name\",\"booking_id\",\"pickup_location\",\"drop_location\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('48fbc42c-ef8c-41da-ac56-b364a1d669d9', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'payment_reminder', 'sms', 'Payment Reminder SMS', NULL, 'Reminder: Invoice {{invoice_id}} for ₹{{amount}} is due. Pay now', '[\"invoice_id\",\"amount\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('4a9142ad-4405-4ed9-a4ac-9cbbe65f52fc', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'driver_assigned', 'sms', 'Driver Assigned SMS', NULL, 'Driver {{driver_name}} assigned to your booking. Contact: {{driver_phone}}', '[\"driver_name\",\"driver_phone\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('6028b4f2-495f-47be-98ad-79b08e54761b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'booking_created', 'push', 'Booking Created Push', 'Booking Confirmed', 'Your booking #{{booking_id}} is confirmed', '[\"booking_id\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('798a7820-06cd-4d82-a025-3e68bf7477a2', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'booking_created', 'email', 'Booking Created Email', 'Booking Confirmation #{{booking_id}}', 'Dear {{customer_name}},\\n\\nYour booking #{{booking_id}} has been confirmed.\\n\\nPickup: {{pickup_location}}\\nDrop: {{drop_location}}\\nEstimated Cost: {{estimated_cost}}\\n\\nThank you!', '[\"customer_name\",\"booking_id\",\"pickup_location\",\"drop_location\",\"estimated_cost\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('a2aa812b-3756-4030-8bc7-a51a6fec0e7b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'payment_received', 'sms', 'Payment Received SMS', NULL, 'Payment of ₹{{amount}} received for booking #{{booking_id}}. Thank you!', '[\"amount\",\"booking_id\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL),
('fa7a3e17-edb9-4ce8-8f82-1f199869828b', 'cc73de5e-0a55-4d2f-98df-4ab0083559a1', 'driver_assigned', 'push', 'Driver Assigned Push', 'Driver Assigned', '{{driver_name}} is heading to pickup', '[\"driver_name\"]', 1, 0, NULL, NULL, NULL, NULL, '2026-07-30 13:21:15', '2026-07-30 13:21:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `online_payments`
--

CREATE TABLE `online_payments` (
  `uuid` char(36) NOT NULL,
  `payment_uuid` char(36) NOT NULL,
  `gateway` varchar(255) NOT NULL COMMENT 'razorpay, stripe, paypal, instamojo',
  `gateway_payment_id` varchar(255) NOT NULL,
  `method` varchar(255) DEFAULT NULL COMMENT 'card, netbanking, emandate, etc',
  `card_last_four` varchar(255) DEFAULT NULL,
  `bank_code` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, authorized, captured, failed, refunded',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(255) NOT NULL DEFAULT 'INR',
  `created_at_gateway` timestamp NULL DEFAULT NULL,
  `captured_at` timestamp NULL DEFAULT NULL,
  `gateway_response` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `customer_uuid` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL COMMENT 'wallet, upi, cod, online',
  `payment_type` varchar(255) NOT NULL DEFAULT 'full' COMMENT 'advance, full, partial',
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, processing, completed, failed, cancelled, refunded',
  `transaction_id` varchar(255) DEFAULT NULL,
  `gateway_reference` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`uuid`, `booking_uuid`, `customer_uuid`, `amount`, `payment_method`, `payment_type`, `status`, `transaction_id`, `gateway_reference`, `payment_date`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('12d2f535-5296-4715-8cb1-ae8715fb6749', 'a0ecbc3b-5276-4157-b46c-45380aca88de', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', '1205.16', 'wallet', 'advance', 'completed', 'TXN-thX2aKXo8N', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('130d221c-0fd0-4a23-814f-5d58ec7535b2', 'f98e0bbf-857f-4db4-b099-1af0035470ae', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', '0.00', 'wallet', 'full', 'completed', 'TXN-kKMthLUGPQ', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('158cddde-5c6b-4445-b2c3-7873d8bd5714', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', '0.00', 'cod', 'advance', 'completed', 'TXN-o6k8DdqfMi', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('1cd1f10b-291f-4f99-ab45-486883cd7f38', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', '4282.32', 'wallet', 'full', 'completed', 'TXN-qvThhKf1b8', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('2a6a9b4a-da10-4201-912c-f10683d5ebb5', 'a0ecbc3b-5276-4157-b46c-45380aca88de', '9b9bdafd-6b2c-4f86-b985-c7f685cbc16d', '0.00', 'upi', 'full', 'completed', 'TXN-srSugRiw8G', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('31ec86d3-fb83-4f20-a61a-447032f4125c', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', '0.00', 'wallet', 'advance', 'completed', 'TXN-aTqOd4D461', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('3e9a891f-bdd6-424b-82a8-b7567bc0a7c3', '6ab8782b-520e-4586-b47f-8b5b37f53707', '882c6b27-ad53-45d6-a73b-76d8973c42b2', '0.00', 'upi', 'advance', 'completed', 'TXN-xlgKcCMr43', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('4d21d624-07d3-4172-b77c-654185e82bd0', '6ab8782b-520e-4586-b47f-8b5b37f53707', '882c6b27-ad53-45d6-a73b-76d8973c42b2', '14118.86', 'upi', 'partial', 'completed', 'TXN-Q0Bf5CnuQP', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('513b94d0-960f-49f2-ab14-c87d458366fa', '7a818d87-8671-46d4-8cd3-d9deb262c119', '406d0808-68a9-4f43-86c7-742774b247b2', '12305.42', 'online', 'advance', 'completed', 'TXN-dHSZZXfvGK', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('6384dc60-37ff-4fa8-b2f4-3007d57af519', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'd5e79369-a506-4f67-b286-0a5b560d024c', '0.00', 'upi', 'partial', 'completed', 'TXN-Z8Lh37DpWO', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('6f3e228c-dc87-492b-9998-278d3a0839ad', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'e5c63c53-89fa-4341-ad94-daee980fdfbb', '17522.82', 'online', 'partial', 'completed', 'TXN-cCJWtnC6Yc', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('808c9893-5983-4c21-bf83-f4a90b8fbd25', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'd5e79369-a506-4f67-b286-0a5b560d024c', '14049.72', 'wallet', 'full', 'completed', 'TXN-h1qpQHaYdt', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('917dc87c-5425-49c0-93d2-af3a1f03b341', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', '18138.15', 'wallet', 'full', 'completed', 'TXN-spsXaRBMHM', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('91f2f3ed-1ad5-4e51-8643-558351f4fd42', '43d64598-113f-4fde-b778-68daeb531168', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', '4854.16', 'cod', 'partial', 'completed', 'TXN-KZqnbXsr6A', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('95b8e86d-3432-4e9e-91fa-c36a169d5fe5', 'ba8e5541-eeee-41c3-ac67-e938e38da949', '882c6b27-ad53-45d6-a73b-76d8973c42b2', '0.00', 'cod', 'advance', 'completed', 'TXN-LSpglb6mM8', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('9d3055f0-cdb7-4795-a757-0466c3c866f9', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', '0.00', 'wallet', 'full', 'completed', 'TXN-wO5209FcW4', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('a62f166e-46d7-4676-be1f-e77065fab33e', 'f98e0bbf-857f-4db4-b099-1af0035470ae', '5bbbdbe1-cfb7-433c-99ac-fedcb3459392', '18479.79', 'online', 'partial', 'completed', 'TXN-1TosvsDrJp', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('b63741bd-9aef-4e88-823d-be2c515d6fda', '43d64598-113f-4fde-b778-68daeb531168', '5df3c447-490c-4fc0-871e-4b8ee25e4dd4', '0.00', 'upi', 'advance', 'completed', 'TXN-6CS4AAabXR', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('c3d08b07-1a86-4668-ae5f-10398714feef', 'ba8e5541-eeee-41c3-ac67-e938e38da949', '882c6b27-ad53-45d6-a73b-76d8973c42b2', '3462.16', 'online', 'full', 'completed', 'TXN-cTeY0WtFr8', NULL, '2026-07-30 11:32:32', NULL, NULL, NULL, NULL, '2026-07-30 11:32:32', '2026-07-30 11:32:32', NULL),
('c9220914-8a47-4174-875d-a4b7bc64a7a0', '7a818d87-8671-46d4-8cd3-d9deb262c119', '406d0808-68a9-4f43-86c7-742774b247b2', '0.00', 'cod', 'partial', 'completed', 'TXN-cDa8DsLkOD', NULL, '2026-07-30 11:27:19', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_webhook_events`
--

CREATE TABLE `payment_webhook_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_key` varchar(128) NOT NULL,
  `provider` varchar(40) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `payload_hash` varchar(128) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `resource` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `uuid`, `name`, `slug`, `code`, `module`, `resource`, `action`, `description`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '85f99137-89be-493a-b3b6-4ba4b348c853', 'View Roles', 'role.view', NULL, 'role', 'role', 'view', 'View Roles', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(2, 'f6574ce1-ab90-492b-9d9e-04f713e73ac4', 'Create Role', 'role.create', NULL, 'role', 'role', 'create', 'Create Role', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(3, '206ff545-244b-4162-b6ff-da255d66695d', 'Edit Role', 'role.edit', NULL, 'role', 'role', 'edit', 'Edit Role', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(4, '634fd3a8-197e-4584-9251-a2cb37433916', 'Delete Role', 'role.delete', NULL, 'role', 'role', 'delete', 'Delete Role', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(5, '287d543b-324c-4ce3-b5df-ce06d621cb5b', 'View Permissions', 'permission.view', NULL, 'permission', 'permission', 'view', 'View Permissions', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(6, '766832b7-e019-41c7-9312-5884632632a9', 'Create Permission', 'permission.create', NULL, 'permission', 'permission', 'create', 'Create Permission', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(7, 'e06deccd-7e21-4ba5-b4fc-eda207e76367', 'Edit Permission', 'permission.edit', NULL, 'permission', 'permission', 'edit', 'Edit Permission', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(8, '9e5d04e0-7d3e-40ab-8ee1-47ded7f0556c', 'Delete Permission', 'permission.delete', NULL, 'permission', 'permission', 'delete', 'Delete Permission', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(9, 'fb46a79b-552c-462a-982b-6dff2980ed7c', 'View Users', 'user.view', NULL, 'user', 'user', 'view', 'View Users', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(10, '232676b3-cf54-4bfa-99dc-c990d05d8e75', 'Create User', 'user.create', NULL, 'user', 'user', 'create', 'Create User', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(11, 'f0463501-3206-4721-8e65-dd6cc37fe994', 'Edit User', 'user.edit', NULL, 'user', 'user', 'edit', 'Edit User', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(12, '843fa04c-1384-42e9-9e09-b72a24b31463', 'Delete User', 'user.delete', NULL, 'user', 'user', 'delete', 'Delete User', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(13, '24c8558b-32d7-4df4-956c-701a4246d322', 'View Company', 'company.view', NULL, 'company', 'company', 'view', 'View Company', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(14, '3d5194e6-7b03-4872-9cfd-42fe7339f681', 'Create Company', 'company.create', NULL, 'company', 'company', 'create', 'Create Company', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(15, '691bc591-713a-4bfd-8eb7-634ee13bcfd6', 'Edit Company', 'company.edit', NULL, 'company', 'company', 'edit', 'Edit Company', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(16, '1b19747e-19b6-4b11-ac35-5c89708b7c72', 'Delete Company', 'company.delete', NULL, 'company', 'company', 'delete', 'Delete Company', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(17, '88a51a3e-3c9e-45e3-b92d-6f5c745f8406', 'Assign Roles', 'role.assign', NULL, 'role', 'user', 'assign', 'Assign Roles', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pickups`
--

CREATE TABLE `pickups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `location_name` varchar(150) NOT NULL,
  `street_address` text NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(6) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_person_name` varchar(150) NOT NULL,
  `contact_person_phone` varchar(20) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `arrived_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pickups`
--

INSERT INTO `pickups` (`id`, `uuid`, `booking_uuid`, `location_name`, `street_address`, `landmark`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `contact_person_name`, `contact_person_phone`, `scheduled_at`, `arrived_at`, `completed_at`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '91e3ed0b-33ea-4398-8ed2-bc865888600e', '7a818d87-8671-46d4-8cd3-d9deb262c119', 'Pickup Point 1', '187 Highway', 'Near Railway Station', 'Kolkata', 'West Bengal', '731961', 'India', '21.73000000', '93.21000000', 'Sender 1', '9890665156', '2026-07-30 20:57:12', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(2, '715d8f19-67fc-4581-84d9-f4cf3a5ef9a7', '279c6661-e423-4fd9-a902-a37e223ebbe1', 'Pickup Point 2', '717 Highway', 'Near Hospital', 'Kolkata', 'West Bengal', '941748', 'India', '31.27000000', '93.73000000', 'Sender 2', '9892600257', '2026-07-31 02:57:12', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(3, '90e371cf-29e6-45ff-ab09-6ccbc155bb00', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', 'Pickup Point 3', '348 Market Street', 'Near School', 'Pune', 'Maharashtra', '971465', 'India', '15.17000000', '72.09000000', 'Sender 3', '9828534616', '2026-08-01 13:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(4, '23c39cbc-30ad-47ad-85e0-f32ffb9dc015', '43d64598-113f-4fde-b778-68daeb531168', 'Pickup Point 4', '586 Express Road', 'Near Temple', 'Bangalore', 'Karnataka', '488062', 'India', '13.78000000', '70.48000000', 'Sender 4', '9828481625', '2026-07-31 12:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(5, '8732137e-d9bd-4cd2-90a3-d8479d491d0c', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 'Pickup Point 5', '248 Main Road', 'Near Temple', 'Chennai', 'Tamil Nadu', '363688', 'India', '18.89000000', '70.52000000', 'Sender 5', '9861101836', '2026-08-01 00:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(6, '6a7384c0-30dd-4835-a9a2-669c6312475a', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 'Pickup Point 6', '375 Highway', 'Near Hospital', 'Pune', 'Maharashtra', '394467', 'India', '25.07000000', '96.80000000', 'Sender 6', '9870099713', '2026-07-30 22:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(7, '61a3854b-6d22-4f03-85ec-252183a2aa6f', '6ab8782b-520e-4586-b47f-8b5b37f53707', 'Pickup Point 7', '905 Park Lane', 'Near School', 'Ahmedabad', 'Gujarat', '622467', 'India', '29.91000000', '88.72000000', 'Sender 7', '9822368096', '2026-07-31 01:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(8, '1f3e19aa-cc1d-4399-ba55-72ea12f763ca', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 'Pickup Point 8', '413 Park Lane', 'Near Hospital', 'Bangalore', 'Karnataka', '428006', 'India', '29.06000000', '83.28000000', 'Sender 8', '9865371739', '2026-07-31 20:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(9, '1fd925d4-6caf-48b1-b8bd-3e755d30546d', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 'Pickup Point 9', '618 Industrial Road', 'Near Temple', 'Chennai', 'Tamil Nadu', '422188', 'India', '31.66000000', '68.52000000', 'Sender 9', '9898003567', '2026-08-01 09:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(10, 'ae604886-9b3f-498a-bfdc-a93983418f33', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 'Pickup Point 10', '402 Main Road', 'Near Temple', 'Hyderabad', 'Telangana', '833112', 'India', '26.48000000', '77.48000000', 'Sender 10', '9825957693', '2026-08-01 16:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(11, '21efd64b-21aa-406f-8caf-f99bcef2be9e', '209da1f3-9fd1-476f-b514-7c9c546b576c', 'Pickup Point 11', '628 Industrial Road', 'Near Hospital', 'Mumbai', 'Maharashtra', '441099', 'India', '23.92000000', '77.80000000', 'Sender 11', '9869943053', '2026-07-31 22:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(12, 'ec65b6d1-caeb-4724-bc2f-40d9130308e5', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 'Pickup Point 12', '720 Main Road', 'Near Bus Stand', 'Ahmedabad', 'Gujarat', '280246', 'India', '22.39000000', '69.53000000', 'Sender 12', '9873832444', '2026-07-30 17:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(13, '310cfcc1-1b21-4dfd-9f35-b9702bec6180', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 'Pickup Point 13', '337 Park Lane', 'Near Temple', 'Kolkata', 'West Bengal', '624085', 'India', '18.55000000', '78.19000000', 'Sender 13', '9821255053', '2026-07-31 04:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(14, '99fa597e-38c6-452e-b589-b63b98d5852f', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 'Pickup Point 14', '554 Main Road', 'Near School', 'Pune', 'Maharashtra', '334518', 'India', '30.73000000', '77.22000000', 'Sender 14', '9892082634', '2026-07-31 19:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(15, 'cd569700-b6ad-44bb-a237-71e4a4daf3ea', '343a21a2-3501-442d-8066-68fab3b0f0e7', 'Pickup Point 15', '750 Market Street', 'Near Hospital', 'Kolkata', 'West Bengal', '572128', 'India', '11.11000000', '87.78000000', 'Sender 15', '9892733196', '2026-07-30 19:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(16, 'e31c40d7-d889-4ed4-b0ef-b36548b6be45', 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', 'Pickup Point 16', '916 Industrial Road', 'Near School', 'Bangalore', 'Karnataka', '906077', 'India', '19.23000000', '71.08000000', 'Sender 16', '9843058644', '2026-07-30 17:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(17, '90f0faad-5641-4aa1-a0d3-55f22649659c', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 'Pickup Point 17', '608 Express Road', 'Near School', 'Mumbai', 'Maharashtra', '951605', 'India', '18.39000000', '94.48000000', 'Sender 17', '9873864581', '2026-08-01 10:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(18, 'cb63d2e1-399a-4fae-8773-3c7f1a161dbc', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 'Pickup Point 18', '973 Highway', 'Near Bus Stand', 'Ahmedabad', 'Gujarat', '756348', 'India', '23.31000000', '87.35000000', 'Sender 18', '9820171372', '2026-08-01 02:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(19, '10a027ea-3d97-447a-a847-67c51d8cf1ad', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 'Pickup Point 19', '395 Industrial Road', 'Near School', 'Bangalore', 'Karnataka', '761672', 'India', '13.82000000', '82.49000000', 'Sender 19', '9829928904', '2026-07-30 23:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(20, 'f05126f7-100b-4d3a-b8df-e9091ab1e29e', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 'Pickup Point 20', '333 Main Road', 'Near Temple', 'Chennai', 'Tamil Nadu', '459233', 'India', '14.45000000', '83.28000000', 'Sender 20', '9825296987', '2026-07-31 15:57:13', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(21, 'fce6c08b-2351-40e3-89b2-36aa75c34ff5', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 'Pickup Point 1', '992 Park Lane', 'Near Railway Station', 'Ahmedabad', 'Gujarat', '987658', 'India', '31.28000000', '81.90000000', 'Sender 1', '9888893546', '2026-08-01 14:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(22, 'e6973091-34cd-486b-8fdf-02fa757a3d27', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 'Pickup Point 2', '842 Main Road', 'Near Bus Stand', 'Chennai', 'Tamil Nadu', '648958', 'India', '33.32000000', '72.25000000', 'Sender 2', '9817668739', '2026-07-30 20:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(23, '184d18be-6228-4071-8454-49cfcf316cba', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 'Pickup Point 3', '429 Industrial Road', 'Near Hospital', 'Bangalore', 'Karnataka', '912667', 'India', '9.12000000', '85.44000000', 'Sender 3', '9843474513', '2026-07-31 02:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(24, '13fcbb6c-14f3-49bd-b54e-85649ed0ff08', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 'Pickup Point 4', '856 Industrial Road', 'Near School', 'Delhi', 'Delhi', '100786', 'India', '11.80000000', '73.20000000', 'Sender 4', '9828698279', '2026-07-30 20:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(25, '4cdb3059-611f-4808-9a7d-055f5e685bc4', 'b800ca3d-e396-4630-8923-704f8c055f43', 'Pickup Point 5', '128 Express Road', 'Near School', 'Mumbai', 'Maharashtra', '120905', 'India', '19.29000000', '73.92000000', 'Sender 5', '9862474490', '2026-07-31 12:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(26, '035c35ff-228f-4706-86de-9e061c6d7bf8', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 'Pickup Point 6', '979 Market Street', 'Near School', 'Ahmedabad', 'Gujarat', '682887', 'India', '18.55000000', '95.16000000', 'Sender 6', '9891080699', '2026-08-01 15:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(27, 'b32b44bc-50c1-4810-81f1-97637e703639', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 'Pickup Point 7', '281 Market Street', 'Near Bus Stand', 'Mumbai', 'Maharashtra', '479789', 'India', '28.52000000', '97.37000000', 'Sender 7', '9866118440', '2026-07-31 08:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(28, 'fdd03067-0711-4c01-9140-57bedf341794', '709ff274-58b5-4333-8233-baf43838e710', 'Pickup Point 8', '807 Highway', 'Near Bus Stand', 'Bangalore', 'Karnataka', '594229', 'India', '18.59000000', '92.59000000', 'Sender 8', '9817579227', '2026-07-31 01:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(29, '34c31cb9-7039-4cf1-a4c5-197f4c0c624a', '0103e6b0-b672-4e9c-9f78-949005327ea6', 'Pickup Point 9', '947 Market Street', 'Near Temple', 'Kolkata', 'West Bengal', '860749', 'India', '22.54000000', '68.83000000', 'Sender 9', '9830706020', '2026-07-31 13:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(30, 'd6acb7dd-a114-4980-9273-b136d17704f1', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 'Pickup Point 10', '188 Industrial Road', 'Near Temple', 'Bangalore', 'Karnataka', '782990', 'India', '30.53000000', '81.95000000', 'Sender 10', '9893578565', '2026-08-01 11:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(31, '8ea7d63b-f1a2-48ce-9600-a7b445fec453', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 'Pickup Point 11', '374 Market Street', 'Near Bus Stand', 'Chennai', 'Tamil Nadu', '360663', 'India', '28.35000000', '91.46000000', 'Sender 11', '9882833124', '2026-08-01 16:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(32, '840c9402-aeb2-45a0-af26-a4fb68c09c9e', '176d110a-b58e-444c-9bcd-140c625c7ddb', 'Pickup Point 12', '972 Highway', 'Near Railway Station', 'Kolkata', 'West Bengal', '714813', 'India', '21.62000000', '77.53000000', 'Sender 12', '9865556095', '2026-07-31 12:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(33, 'b4160d1b-7a03-4548-bfa9-2a6cd5a1e218', '08a3ff07-acf9-4339-9f42-8fc01ac5109a', 'Pickup Point 13', '441 Express Road', 'Near School', 'Bangalore', 'Karnataka', '419204', 'India', '15.90000000', '91.10000000', 'Sender 13', '9817305986', '2026-07-31 11:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(34, '5e2156e9-0001-44c6-a98c-a3651652303f', '252aafa3-28b4-4b74-930c-9561b6f192b0', 'Pickup Point 14', '645 Highway', 'Near Temple', 'Bangalore', 'Karnataka', '265592', 'India', '11.17000000', '87.67000000', 'Sender 14', '9816032599', '2026-08-01 07:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(35, 'ba1e8475-37eb-493d-8301-30a41b13a140', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 'Pickup Point 15', '991 Industrial Road', 'Near Hospital', 'Delhi', 'Delhi', '759257', 'India', '28.97000000', '87.42000000', 'Sender 15', '9879259353', '2026-08-01 17:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(36, '72892896-7300-4299-9363-bf3c2e0f8fe1', '52693403-a4ec-4a49-ac64-03c329b69ec8', 'Pickup Point 16', '696 Main Road', 'Near Hospital', 'Pune', 'Maharashtra', '647078', 'India', '20.37000000', '73.01000000', 'Sender 16', '9873562693', '2026-08-01 09:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(37, '41fd5c05-e3ac-4403-a5f5-e6d19b0d2de7', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 'Pickup Point 17', '964 Industrial Road', 'Near Bus Stand', 'Ahmedabad', 'Gujarat', '407638', 'India', '31.21000000', '78.69000000', 'Sender 17', '9827413670', '2026-07-31 14:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(38, 'd67203b4-b7cc-44db-b93f-3081224e3134', '9469d467-c76f-4a54-855e-39528eed20c3', 'Pickup Point 18', '954 Highway', 'Near Hospital', 'Hyderabad', 'Telangana', '869953', 'India', '12.24000000', '68.70000000', 'Sender 18', '9855833570', '2026-07-31 18:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(39, 'c950b009-a56d-4ee0-846d-b0c57ee6b9ea', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 'Pickup Point 19', '402 Highway', 'Near Temple', 'Bangalore', 'Karnataka', '349548', 'India', '11.56000000', '87.26000000', 'Sender 19', '9833162067', '2026-07-31 13:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(40, 'ada5760d-6512-42ec-bf0c-3c854dc773a3', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 'Pickup Point 20', '346 Industrial Road', 'Near Temple', 'Pune', 'Maharashtra', '245879', 'India', '31.64000000', '80.19000000', 'Sender 20', '9812632439', '2026-07-31 10:03:29', NULL, NULL, 'Standard pickup instructions', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `invoice_uuid` char(36) DEFAULT NULL,
  `customer_uuid` char(36) DEFAULT NULL,
  `receipt_number` varchar(50) NOT NULL,
  `receipt_date` timestamp NOT NULL,
  `payment_method` enum('cash','cheque','bank_transfer','upi','credit_card','wallet') NOT NULL DEFAULT 'cash',
  `amount_received` decimal(12,2) NOT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','verified','cancelled') NOT NULL DEFAULT 'pending',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`id`, `uuid`, `invoice_uuid`, `customer_uuid`, `receipt_number`, `receipt_date`, `payment_method`, `amount_received`, `payment_reference`, `notes`, `status`, `verified_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'd73ffaae-6e37-499a-afea-66d2bfb7d5e7', '32995ccc-31af-4922-a8ad-5a6f09c83b27', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'RCP-202607-00001', '2026-07-17 12:39:26', 'bank_transfer', '3451.00', 'REF-QTRCFPUQZS', 'Payment received for invoice INV-202604-00001', 'verified', '2026-07-17 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(2, '2954cabd-e874-4251-b878-cdbd1b1f8677', '32995ccc-31af-4922-a8ad-5a6f09c83b27', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'RCP-202607-00002', '2026-07-29 12:39:26', 'upi', '3451.00', 'REF-63HDXWKWO6', 'Payment received for invoice INV-202604-00001', 'verified', '2026-07-29 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(3, 'db93c86c-c943-4c2b-8223-35088b5ea5ab', '32995ccc-31af-4922-a8ad-5a6f09c83b27', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', 'RCP-202607-00003', '2026-07-02 12:39:26', 'cheque', '3451.00', 'REF-77FX54VGTP', 'Payment received for invoice INV-202604-00001', 'verified', '2026-07-02 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(4, 'eb33512a-a100-4ee7-91a7-a3723a33f6ae', '60e47176-367e-409a-9fc3-47385ad3397c', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'RCP-202607-00004', '2026-07-10 12:39:26', 'upi', '5352.67', 'REF-ZBWWJMDREG', 'Payment received for invoice INV-202511-00001', 'verified', '2026-07-10 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(5, 'c5eaf141-2e70-4709-98be-bee52588bb6c', '60e47176-367e-409a-9fc3-47385ad3397c', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'RCP-202607-00005', '2026-07-16 12:39:26', 'upi', '5352.67', 'REF-V4XVFTS0E0', 'Payment received for invoice INV-202511-00001', 'verified', '2026-07-16 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(6, '0cc82f1b-26a3-42ed-be84-4ebd603eebdf', '60e47176-367e-409a-9fc3-47385ad3397c', '3f251d68-6bbb-4200-b16e-ab34fe07714c', 'RCP-202607-00006', '2026-07-01 12:39:26', 'bank_transfer', '5352.67', 'REF-B8PH2FURI6', 'Payment received for invoice INV-202511-00001', 'verified', '2026-07-01 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(7, '69639a63-f3ce-4ab8-9c23-f6099e698a04', 'c2bdba5e-ffb9-4e9f-8b29-da9fc128c84f', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'RCP-202607-00007', '2026-07-08 12:39:26', 'cheque', '9794.00', 'REF-RCKBLCQFJY', 'Payment received for invoice INV-202512-00002', 'verified', '2026-07-08 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(8, '1fee315f-b6e0-440e-8b60-49645896349b', 'c2bdba5e-ffb9-4e9f-8b29-da9fc128c84f', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'RCP-202607-00008', '2026-07-20 12:39:26', 'upi', '9794.00', 'REF-K5DHOKDIGS', 'Payment received for invoice INV-202512-00002', 'verified', '2026-07-20 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL),
(9, '7cb37f73-7130-4f99-b635-16619bc42172', 'c2bdba5e-ffb9-4e9f-8b29-da9fc128c84f', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', 'RCP-202607-00009', '2026-07-08 12:39:26', 'cheque', '9794.00', 'REF-FENQDMVEL8', 'Payment received for invoice INV-202512-00002', 'verified', '2026-07-08 13:39:26', NULL, NULL, NULL, '2026-07-30 12:39:26', '2026-07-30 12:39:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_uuid` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_uuid`, `token`, `expires_at`, `revoked`, `created_at`, `updated_at`) VALUES
(1, '349cc365-e531-41bd-9dd6-09e26a770d1e', '113f7e4742060608135d453df335b2501415c6e6229947feff14332d980401a7', '2026-08-12 10:33:25', 0, '2026-08-05 10:33:25', '2026-08-05 10:33:25'),
(2, 'db93dc4a-b647-4eba-8166-68b5a1618ebc', '0b3088f2093b2fa05185d3e7cde52d73b9cb815b027659de59589cb1374efdf1', '2026-08-12 10:36:36', 0, '2026-08-05 10:36:36', '2026-08-05 10:36:36'),
(3, '349cc365-e531-41bd-9dd6-09e26a770d1e', 'af1636b84650b19813c14e32e6ef91777456e0eaa4f44848d7fff0d091b08ac9', '2026-08-12 10:36:53', 0, '2026-08-05 10:36:53', '2026-08-05 10:36:53'),
(4, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '0813953155a47b1ae35d42bebcf83eddfdfb0e778c30d99182cc9289f955e9fb', '2026-08-12 10:50:11', 0, '2026-08-05 10:50:11', '2026-08-05 10:50:11'),
(5, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'd992df9777df0481855161e6845b91141451c23b13a0d89673eb95c592bbe13d', '2026-08-12 10:50:54', 0, '2026-08-05 10:50:54', '2026-08-05 10:50:54'),
(6, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'a5a4e442c153dccd7a3407d8a23ea4a03459e3f0a4833e9617b6d4f8a56ea844', '2026-08-12 10:51:22', 0, '2026-08-05 10:51:22', '2026-08-05 10:51:22'),
(7, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '56f4c87f16a3a510ff725e798741f5f9210750bfe028246f168c943e04e75151', '2026-08-12 10:56:19', 0, '2026-08-05 10:56:19', '2026-08-05 10:56:19'),
(8, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'ec9bb62b6281c7d6c1c7bc1af668f1cf17f75de8f1a8bfb8563210e351638d4f', '2026-08-12 10:57:18', 0, '2026-08-05 10:57:18', '2026-08-05 10:57:18'),
(9, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'de139db02bb0874fd82ab6a2140f591926260395defe5e9935fc12870ab5ee35', '2026-08-12 10:58:37', 0, '2026-08-05 10:58:37', '2026-08-05 10:58:37'),
(10, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'bdc112ff7e55336b17a1341eaec9c008ed2b29a7f30c82633cf3ede968e22208', '2026-08-12 10:59:59', 0, '2026-08-05 10:59:59', '2026-08-05 10:59:59'),
(11, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '78fb9c60c538813f5073a630f9b08f42b006308a1aba7872160d4459a0184818', '2026-08-12 11:00:03', 0, '2026-08-05 11:00:03', '2026-08-05 11:00:03'),
(12, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'aa8e9baead0c83c03c9500911260f5fd008e04a388034b114faf6edcdd6dbb03', '2026-08-12 11:04:41', 0, '2026-08-05 11:04:41', '2026-08-05 11:04:41'),
(13, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '25dc654ec9bd392641153ce43c62908bbbc947e9d768b8f7e5877651dce6ffd1', '2026-08-12 11:20:48', 0, '2026-08-05 11:20:48', '2026-08-05 11:20:48'),
(14, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '738cd4e4b1d6736010b8e56bcd646172169868227c9ee487d754ba71b2a4a51d', '2026-08-12 12:44:15', 0, '2026-08-05 12:44:15', '2026-08-05 12:44:15'),
(15, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '1a879e25c4145d802cad80735a7dbe83a6335487beb927ee3a1ccb93e7afe902', '2026-08-13 09:55:42', 0, '2026-08-06 09:55:42', '2026-08-06 09:55:42'),
(16, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '15e3489d6ce56c9920798edd6cfac62b6437654ea19e935196f2a0b48318e545', '2026-08-13 10:03:01', 0, '2026-08-06 10:03:01', '2026-08-06 10:03:01'),
(17, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', '874d528dcb575b4affd7d07b26d2f0202fc6377aee0ef1f957605abe9af71a1d', '2026-08-13 10:06:08', 0, '2026-08-06 10:06:08', '2026-08-06 10:06:08'),
(18, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'f13d3bc963c932d740343799f8892ae4097f21d6d0788bb6d5f30f046af19798', '2026-08-13 10:13:12', 0, '2026-08-06 10:13:12', '2026-08-06 10:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `registration_otps`
--

CREATE TABLE `registration_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `phone` varchar(20) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `max_attempts` smallint(5) UNSIGNED NOT NULL DEFAULT 5,
  `verified_at` timestamp NULL DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `user_uuid` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `uuid`, `name`, `code`, `description`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'Admin', 'ADMIN', 'Administrator with full system access', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(2, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', 'Manager', 'MANAGER', 'Manager with departmental access', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(3, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', 'Employee', 'EMPLOYEE', 'Regular employee with limited access', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL),
(4, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', 'Driver', 'DRIVER', 'Driver with booking access', 1, NULL, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `permission_id` varchar(36) NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`id`, `role_id`, `permission_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '85f99137-89be-493a-b3b6-4ba4b348c853', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(2, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'f6574ce1-ab90-492b-9d9e-04f713e73ac4', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(3, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '206ff545-244b-4162-b6ff-da255d66695d', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(4, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '634fd3a8-197e-4584-9251-a2cb37433916', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(5, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '287d543b-324c-4ce3-b5df-ce06d621cb5b', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(6, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '766832b7-e019-41c7-9312-5884632632a9', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(7, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'e06deccd-7e21-4ba5-b4fc-eda207e76367', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(8, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '9e5d04e0-7d3e-40ab-8ee1-47ded7f0556c', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(9, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'fb46a79b-552c-462a-982b-6dff2980ed7c', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(10, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '232676b3-cf54-4bfa-99dc-c990d05d8e75', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(11, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'f0463501-3206-4721-8e65-dd6cc37fe994', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(12, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '843fa04c-1384-42e9-9e09-b72a24b31463', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(13, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '24c8558b-32d7-4df4-956c-701a4246d322', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(14, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '3d5194e6-7b03-4872-9cfd-42fe7339f681', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(15, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '691bc591-713a-4bfd-8eb7-634ee13bcfd6', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(16, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '1b19747e-19b6-4b11-ac35-5c89708b7c72', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(17, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '88a51a3e-3c9e-45e3-b92d-6f5c745f8406', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(18, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '85f99137-89be-493a-b3b6-4ba4b348c853', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(19, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '287d543b-324c-4ce3-b5df-ce06d621cb5b', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(20, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', 'fb46a79b-552c-462a-982b-6dff2980ed7c', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(21, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '232676b3-cf54-4bfa-99dc-c990d05d8e75', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(22, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', 'f0463501-3206-4721-8e65-dd6cc37fe994', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(23, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '843fa04c-1384-42e9-9e09-b72a24b31463', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(24, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '24c8558b-32d7-4df4-956c-701a4246d322', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(25, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '3d5194e6-7b03-4872-9cfd-42fe7339f681', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(26, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '691bc591-713a-4bfd-8eb7-634ee13bcfd6', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(27, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', '1b19747e-19b6-4b11-ac35-5c89708b7c72', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(28, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', '85f99137-89be-493a-b3b6-4ba4b348c853', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(29, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', '287d543b-324c-4ce3-b5df-ce06d621cb5b', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(30, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', 'fb46a79b-552c-462a-982b-6dff2980ed7c', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(31, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', '24c8558b-32d7-4df4-956c-701a4246d322', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(32, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', '24c8558b-32d7-4df4-956c-701a4246d322', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(33, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', '3d5194e6-7b03-4872-9cfd-42fe7339f681', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(34, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', '691bc591-713a-4bfd-8eb7-634ee13bcfd6', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(35, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', '1b19747e-19b6-4b11-ac35-5c89708b7c72', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05');

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_user`
--

INSERT INTO `role_user` (`id`, `role_id`, `user_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'db93dc4a-b647-4eba-8166-68b5a1618ebc', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(2, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', 'adf01823-4c18-49fb-bdde-a201e2a2a129', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(3, 'ad8316f2-ecda-4fb9-a1a6-4a1cb4421f94', '4618dca0-522f-48ac-97f1-378fa63a5027', NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05'),
(4, '3678706e-3aa8-4d37-94bd-3ab32f5837d4', '4e0731c6-b4da-4c2a-ab87-bbf00365cdb5', NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06'),
(5, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', '7a0d6868-fa31-4b2f-84b1-94fe1ac13d9a', NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06'),
(6, 'af28a304-37a8-4c72-acc2-2eb5a72254e8', 'f2b4cbd7-1a6c-4eb0-9add-96715a485d3f', NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06'),
(7, '7edb0230-0d7a-44db-b5da-7de4fb5cba64', 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', NULL, '2026-08-06 10:04:42', '2026-08-06 10:04:42');

-- --------------------------------------------------------

--
-- Table structure for table `route_histories`
--

CREATE TABLE `route_histories` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `route_sequence` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `altitude` decimal(8,2) DEFAULT NULL,
  `speed` decimal(8,2) DEFAULT NULL,
  `heading` decimal(8,2) DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `distance_from_previous_km` decimal(8,3) DEFAULT NULL,
  `time_from_previous_seconds` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_messages`
--

CREATE TABLE `sms_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `recipient_number` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` varchar(30) DEFAULT NULL,
  `purpose` varchar(50) DEFAULT NULL,
  `provider` varchar(30) NOT NULL DEFAULT 'smslocal',
  `status` varchar(30) NOT NULL DEFAULT 'queued',
  `provider_status` varchar(30) DEFAULT NULL,
  `event_type` varchar(30) DEFAULT NULL,
  `provider_timestamp` timestamp NULL DEFAULT NULL,
  `retryable` tinyint(1) NOT NULL DEFAULT 0,
  `retry_count` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `last_error` text DEFAULT NULL,
  `sandbox` tinyint(1) NOT NULL DEFAULT 0,
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context`)),
  `provider_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_response`)),
  `delivery_report` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`delivery_report`)),
  `webhook_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`webhook_payload`)),
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spatie_permissions_backup`
--

CREATE TABLE `spatie_permissions_backup` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spatie_roles_backup`
--

CREATE TABLE `spatie_roles_backup` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `state`
--

CREATE TABLE `state` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stopages`
--

CREATE TABLE `stopages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `stop_sequence` int(11) NOT NULL,
  `location_name` varchar(150) NOT NULL,
  `street_address` text NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(6) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_person_name` varchar(150) NOT NULL,
  `contact_person_phone` varchar(20) NOT NULL,
  `stop_type` enum('pickup','drop','intermediate') NOT NULL DEFAULT 'intermediate',
  `scheduled_at` datetime NOT NULL,
  `arrived_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stopages`
--

INSERT INTO `stopages` (`id`, `uuid`, `booking_uuid`, `stop_sequence`, `location_name`, `street_address`, `landmark`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `contact_person_name`, `contact_person_phone`, `stop_type`, `scheduled_at`, `arrived_at`, `completed_at`, `notes`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '02d26c83-835b-4979-964e-c9c9f4e92d24', '7a818d87-8671-46d4-8cd3-d9deb262c119', 1, 'Stop 1', '904 Highway', 'Near Railway Station', 'Ahmedabad', 'Telangana', '607243', 'India', '25.22000000', '85.59000000', 'Stop Contact 1', '9712812098', 'intermediate', '2026-08-01 16:57:12', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:12', '2026-07-30 11:27:12', NULL),
(2, 'e0b2824e-ea47-4455-8355-f3a5f0eab30d', '279c6661-e423-4fd9-a902-a37e223ebbe1', 1, 'Stop 1', '223 Industrial Road', 'Near School', 'Hyderabad', 'Tamil Nadu', '466008', 'India', '9.15000000', '80.76000000', 'Stop Contact 1', '9788145702', 'intermediate', '2026-08-01 08:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(3, '9960dbc6-ad4e-4982-90ff-b4941da120b1', '946d27e0-f1ea-4fe4-88b5-1dc493cfe1d0', 1, 'Stop 1', '650 Park Lane', 'Near Hospital', 'Hyderabad', 'Gujarat', '837146', 'India', '31.79000000', '84.06000000', 'Stop Contact 1', '9797154105', 'intermediate', '2026-07-31 22:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(4, '50f8a0cf-49f2-4de6-acf7-c8f1b846dede', '43d64598-113f-4fde-b778-68daeb531168', 1, 'Stop 1', '413 Park Lane', 'Near Hospital', 'Delhi', 'West Bengal', '196990', 'India', '15.14000000', '82.18000000', 'Stop Contact 1', '9753113950', 'intermediate', '2026-08-01 02:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(5, 'ba43053a-19bf-4b94-9dea-92a5882cb715', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 1, 'Stop 1', '239 Industrial Road', 'Near School', 'Delhi', 'Delhi', '777519', 'India', '9.80000000', '90.53000000', 'Stop Contact 1', '9755097121', 'intermediate', '2026-08-01 08:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(6, '60f01e47-f04b-416a-9474-5afc0c904a39', 'ba8e5541-eeee-41c3-ac67-e938e38da949', 0, 'Stop 0', '282 Industrial Road', 'Near Bus Stand', 'Pune', 'Maharashtra', '292823', 'India', '21.59000000', '71.85000000', 'Stop Contact 0', '9791975678', 'intermediate', '2026-08-01 03:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(7, '394fde2c-bbb5-480c-96b5-915d53f308ad', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 1, 'Stop 1', '322 Express Road', 'Near School', 'Hyderabad', 'Maharashtra', '992769', 'India', '32.89000000', '84.00000000', 'Stop Contact 1', '9732624950', 'intermediate', '2026-07-31 22:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(8, 'c71ed812-71f4-4dea-8f3b-c4d5e31cb219', '8836195f-1e8d-41c1-b0b6-89e5edfedddb', 2, 'Stop 2', '281 Main Road', 'Near School', 'Bangalore', 'Gujarat', '591143', 'India', '18.93000000', '92.50000000', 'Stop Contact 2', '9788464721', 'intermediate', '2026-08-01 11:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(9, '9970a665-398f-4cd8-9225-dda69296eb0d', '6ab8782b-520e-4586-b47f-8b5b37f53707', 1, 'Stop 1', '847 Industrial Road', 'Near Temple', 'Ahmedabad', 'Maharashtra', '995902', 'India', '29.96000000', '97.82000000', 'Stop Contact 1', '9726838445', 'intermediate', '2026-08-01 11:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(10, 'e64d4863-991e-4386-82b1-fc59d981c1fd', '6ab8782b-520e-4586-b47f-8b5b37f53707', 2, 'Stop 2', '934 Main Road', 'Near School', 'Bangalore', 'Telangana', '893280', 'India', '8.53000000', '97.40000000', 'Stop Contact 2', '9794360755', 'intermediate', '2026-08-01 00:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(11, '4c06bbea-34b0-4fb8-ba96-c73367f6272c', 'a0ecbc3b-5276-4157-b46c-45380aca88de', 1, 'Stop 1', '135 Park Lane', 'Near School', 'Mumbai', 'Maharashtra', '213273', 'India', '13.20000000', '77.73000000', 'Stop Contact 1', '9715829460', 'intermediate', '2026-08-01 04:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(12, 'd4f13781-33d2-4d7e-bb64-7a9485b6c281', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 1, 'Stop 1', '934 Industrial Road', 'Near Bus Stand', 'Delhi', 'Maharashtra', '983518', 'India', '13.32000000', '76.66000000', 'Stop Contact 1', '9778205846', 'intermediate', '2026-07-31 19:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(13, 'c82e6bde-48df-40bb-bba9-729b1e1d4c35', 'a9d31d7e-ae07-498a-ba79-6f97cd88b808', 2, 'Stop 2', '192 Park Lane', 'Near Bus Stand', 'Bangalore', 'Telangana', '199135', 'India', '13.91000000', '71.28000000', 'Stop Contact 2', '9739844993', 'intermediate', '2026-08-01 03:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(14, 'ff98594a-5582-4b5a-a68a-d36b395d0e66', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 1, 'Stop 1', '922 Industrial Road', 'Near Bus Stand', 'Hyderabad', 'Karnataka', '289392', 'India', '26.91000000', '70.90000000', 'Stop Contact 1', '9770127704', 'intermediate', '2026-08-01 07:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(15, '81626a73-3bfd-4607-8014-3647b18fea46', 'f98e0bbf-857f-4db4-b099-1af0035470ae', 2, 'Stop 2', '865 Express Road', 'Near Railway Station', 'Ahmedabad', 'Maharashtra', '932148', 'India', '26.91000000', '82.84000000', 'Stop Contact 2', '9794275885', 'intermediate', '2026-07-31 18:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(16, '2f98b2b2-b470-46b4-8197-5c7376f85cd7', '209da1f3-9fd1-476f-b514-7c9c546b576c', 1, 'Stop 1', '613 Park Lane', 'Near Bus Stand', 'Kolkata', 'West Bengal', '453538', 'India', '11.93000000', '95.91000000', 'Stop Contact 1', '9764267777', 'intermediate', '2026-08-01 04:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(17, '72ebe81c-1a0b-4fb5-a001-aee8c334b7a7', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 1, 'Stop 1', '849 Main Road', 'Near Bus Stand', 'Delhi', 'Maharashtra', '157824', 'India', '21.22000000', '71.65000000', 'Stop Contact 1', '9764949335', 'intermediate', '2026-08-01 14:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(18, 'e655e335-6718-4fba-bf2d-d5d064765a5b', '295f7b8c-16b2-4ef5-b378-1242a4fcbb1f', 0, 'Stop 0', '754 Main Road', 'Near Railway Station', 'Bangalore', 'Tamil Nadu', '772978', 'India', '31.49000000', '84.51000000', 'Stop Contact 0', '9783712990', 'intermediate', '2026-07-31 17:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(19, '37f4e493-382a-4973-9775-b1f39a1326cf', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 1, 'Stop 1', '135 Park Lane', 'Near Hospital', 'Hyderabad', 'Maharashtra', '229256', 'India', '14.64000000', '97.83000000', 'Stop Contact 1', '9786098307', 'intermediate', '2026-07-31 17:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(20, '6763ee4f-7c79-4c97-939b-497b4cefe302', '3afc37a4-c979-4ec2-8e55-67e2874fa798', 0, 'Stop 0', '322 Main Road', 'Near Bus Stand', 'Pune', 'Delhi', '478118', 'India', '22.96000000', '78.25000000', 'Stop Contact 0', '9773376101', 'intermediate', '2026-08-01 18:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(21, '3f193a72-903b-4042-8d2a-81e9eafb94c6', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 1, 'Stop 1', '305 Market Street', 'Near Bus Stand', 'Kolkata', 'Gujarat', '227221', 'India', '8.57000000', '76.28000000', 'Stop Contact 1', '9769600145', 'intermediate', '2026-07-31 18:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(22, '8b60a5e2-99d6-4739-bc6a-acf97b0dd607', 'fac55836-3a3b-4410-933c-87f3d8a274fa', 0, 'Stop 0', '576 Highway', 'Near Hospital', 'Bangalore', 'Telangana', '281035', 'India', '27.74000000', '91.93000000', 'Stop Contact 0', '9795290954', 'intermediate', '2026-07-31 20:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(23, '987e5f1e-a99b-4381-b10f-0911b775ef16', '343a21a2-3501-442d-8066-68fab3b0f0e7', 1, 'Stop 1', '966 Park Lane', 'Near Railway Station', 'Hyderabad', 'Delhi', '404721', 'India', '30.22000000', '96.46000000', 'Stop Contact 1', '9714523406', 'intermediate', '2026-08-01 10:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(24, '57d8e4b9-3be7-4d8a-a40b-27b2a8bc6e83', '343a21a2-3501-442d-8066-68fab3b0f0e7', 0, 'Stop 0', '711 Express Road', 'Near Bus Stand', 'Kolkata', 'Maharashtra', '351538', 'India', '34.15000000', '81.78000000', 'Stop Contact 0', '9768890753', 'intermediate', '2026-08-01 13:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(25, '4bf8b8f9-763e-48a1-85bd-c2df078f6d5b', 'e2f9fb8b-5d2b-43e4-a073-6f712d46f864', 1, 'Stop 1', '571 Express Road', 'Near Temple', 'Bangalore', 'Telangana', '502789', 'India', '29.11000000', '75.29000000', 'Stop Contact 1', '9744857765', 'intermediate', '2026-08-01 16:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(26, '298e7033-3e44-4122-893b-3bbd3782c979', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 1, 'Stop 1', '755 Market Street', 'Near Railway Station', 'Delhi', 'Delhi', '385359', 'India', '16.26000000', '95.98000000', 'Stop Contact 1', '9749029523', 'intermediate', '2026-08-01 03:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(27, '60e088dc-bfb1-488f-8dd8-0b4c88341056', '46eb9bb6-0f53-474e-9a7a-9d558012cdf2', 0, 'Stop 0', '715 Highway', 'Near Temple', 'Chennai', 'Gujarat', '439590', 'India', '34.87000000', '95.43000000', 'Stop Contact 0', '9712750067', 'intermediate', '2026-08-01 14:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(28, 'c87a58b2-87e1-4359-b619-458ea132f81b', 'd19410b5-2803-48e9-bfdd-934a7a4cfe34', 1, 'Stop 1', '492 Market Street', 'Near Bus Stand', 'Kolkata', 'Maharashtra', '280357', 'India', '12.11000000', '86.77000000', 'Stop Contact 1', '9786221831', 'intermediate', '2026-07-31 22:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(29, '69ab3a7f-f56d-4bef-a388-b51f76584130', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 1, 'Stop 1', '857 Main Road', 'Near School', 'Ahmedabad', 'Telangana', '176105', 'India', '23.16000000', '77.87000000', 'Stop Contact 1', '9744354711', 'intermediate', '2026-07-31 18:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(30, 'b30c644c-355a-4bbd-a881-d5f6cc0869c8', '65d30627-dd20-46ad-9a7f-6d1f8bde47d7', 0, 'Stop 0', '594 Highway', 'Near Hospital', 'Mumbai', 'Tamil Nadu', '706810', 'India', '33.15000000', '88.88000000', 'Stop Contact 0', '9796255059', 'intermediate', '2026-07-31 20:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(31, 'bde556e5-c626-410f-829d-b3bcdd48c889', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 1, 'Stop 1', '842 Express Road', 'Near Railway Station', 'Ahmedabad', 'Maharashtra', '167065', 'India', '15.30000000', '84.48000000', 'Stop Contact 1', '9723657157', 'intermediate', '2026-08-01 13:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(32, '9d599a12-4f21-491e-9e82-a4bbd3a49b2c', 'ccfca0c3-93e1-43ac-b258-89583b2cde7b', 0, 'Stop 0', '466 Express Road', 'Near Railway Station', 'Bangalore', 'Gujarat', '382176', 'India', '16.74000000', '78.31000000', 'Stop Contact 0', '9718406484', 'intermediate', '2026-08-01 01:57:13', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 11:27:13', '2026-07-30 11:27:13', NULL),
(33, '0a83c013-8997-451e-89be-7df3637d82bb', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 1, 'Stop 1', '526 Highway', 'Near Temple', 'Hyderabad', 'Maharashtra', '854466', 'India', '17.56000000', '77.98000000', 'Stop Contact 1', '9791188637', 'intermediate', '2026-08-01 12:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(34, '87e7a05f-84fa-48fb-8851-2d6a354c5f97', 'cdf6cb5b-a82e-46fa-b639-153df56e7b83', 2, 'Stop 2', '968 Main Road', 'Near School', 'Mumbai', 'Karnataka', '134206', 'India', '25.11000000', '83.32000000', 'Stop Contact 2', '9775545077', 'intermediate', '2026-07-31 21:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(35, '7dd2c3f7-8319-49b7-a5c2-e182bf50f1fe', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 1, 'Stop 1', '958 Highway', 'Near School', 'Ahmedabad', 'Telangana', '313831', 'India', '19.18000000', '85.41000000', 'Stop Contact 1', '9737111733', 'intermediate', '2026-08-01 02:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(36, 'b06dfa6b-5b56-4ef1-8e24-4d9dd6676ff9', '388e8afd-2f26-4fb2-94a3-fd33be2d3423', 2, 'Stop 2', '877 Industrial Road', 'Near Bus Stand', 'Bangalore', 'Tamil Nadu', '229940', 'India', '29.35000000', '69.68000000', 'Stop Contact 2', '9765115185', 'intermediate', '2026-07-31 22:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(37, '37b2ee18-21dc-4883-a913-9ecf4643c309', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 1, 'Stop 1', '989 Express Road', 'Near Railway Station', 'Mumbai', 'Telangana', '360840', 'India', '32.85000000', '94.92000000', 'Stop Contact 1', '9783116551', 'intermediate', '2026-08-01 10:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(38, 'eadc79cd-d269-4e2a-92b3-c5acdbfb1ab4', 'b266933e-5be5-46a3-8d4f-e1220f1c35b3', 2, 'Stop 2', '419 Industrial Road', 'Near Hospital', 'Bangalore', 'Karnataka', '945503', 'India', '13.69000000', '76.99000000', 'Stop Contact 2', '9751531316', 'intermediate', '2026-07-31 23:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(39, '2a0433bf-5ef1-474f-87db-722263ee33c4', 'd58c6dce-545f-4d05-9ad0-05d56daa840b', 1, 'Stop 1', '675 Industrial Road', 'Near Temple', 'Hyderabad', 'Maharashtra', '767451', 'India', '24.67000000', '90.09000000', 'Stop Contact 1', '9773115818', 'intermediate', '2026-08-01 20:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(40, '3d32861b-d803-4f3f-8a0e-9150f002ed69', 'b800ca3d-e396-4630-8923-704f8c055f43', 1, 'Stop 1', '317 Industrial Road', 'Near Temple', 'Mumbai', 'Maharashtra', '725308', 'India', '27.39000000', '95.00000000', 'Stop Contact 1', '9758592251', 'intermediate', '2026-08-01 09:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(41, '34f9bd4e-ed9e-4edf-8846-a3c96ce61b7f', 'b800ca3d-e396-4630-8923-704f8c055f43', 0, 'Stop 0', '352 Park Lane', 'Near School', 'Ahmedabad', 'Karnataka', '932568', 'India', '17.09000000', '81.88000000', 'Stop Contact 0', '9740516892', 'intermediate', '2026-08-01 01:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(42, 'c9ca7edd-5251-42b2-88dd-6321ba045bf4', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 1, 'Stop 1', '117 Express Road', 'Near School', 'Bangalore', 'Gujarat', '553367', 'India', '9.33000000', '86.33000000', 'Stop Contact 1', '9779631316', 'intermediate', '2026-07-31 22:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(43, '14c79b9f-1396-4a12-ac77-aa7ff5890f21', 'b04e3838-27c9-447d-b064-b1cbfeca66ee', 0, 'Stop 0', '433 Highway', 'Near Bus Stand', 'Kolkata', 'Gujarat', '289252', 'India', '32.15000000', '69.15000000', 'Stop Contact 0', '9787384816', 'intermediate', '2026-08-01 19:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(44, '990808e3-207c-4ae9-92ce-1ead653e54e0', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 1, 'Stop 1', '310 Express Road', 'Near Railway Station', 'Ahmedabad', 'Telangana', '437938', 'India', '9.50000000', '69.68000000', 'Stop Contact 1', '9776321980', 'intermediate', '2026-08-01 04:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(45, '0aa378d7-6355-4313-96cc-d23eaba41483', '9ccaede4-8141-49bc-9188-bcb4a0bcf345', 2, 'Stop 2', '321 Industrial Road', 'Near Bus Stand', 'Bangalore', 'Tamil Nadu', '742338', 'India', '30.53000000', '79.00000000', 'Stop Contact 2', '9744503132', 'intermediate', '2026-08-01 17:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(46, '4d3098b0-1546-4810-b530-1409721609d4', '709ff274-58b5-4333-8233-baf43838e710', 1, 'Stop 1', '673 Industrial Road', 'Near Bus Stand', 'Chennai', 'Telangana', '532953', 'India', '9.52000000', '76.68000000', 'Stop Contact 1', '9740495934', 'intermediate', '2026-08-01 02:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(47, '367c167c-1dcc-467c-a8ba-5ed5ba226e9e', '709ff274-58b5-4333-8233-baf43838e710', 2, 'Stop 2', '580 Market Street', 'Near Temple', 'Mumbai', 'West Bengal', '454918', 'India', '22.49000000', '94.52000000', 'Stop Contact 2', '9783211559', 'intermediate', '2026-08-01 00:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(48, 'da33be3b-105a-474d-bdde-9cb8c527a293', '0103e6b0-b672-4e9c-9f78-949005327ea6', 1, 'Stop 1', '910 Main Road', 'Near Bus Stand', 'Kolkata', 'West Bengal', '166448', 'India', '26.06000000', '80.86000000', 'Stop Contact 1', '9751606761', 'intermediate', '2026-07-31 21:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(49, '68ec08cb-a2f4-42d6-b2da-ea3ef397d969', '0103e6b0-b672-4e9c-9f78-949005327ea6', 2, 'Stop 2', '620 Industrial Road', 'Near Bus Stand', 'Hyderabad', 'Gujarat', '353564', 'India', '17.03000000', '70.89000000', 'Stop Contact 2', '9711596248', 'intermediate', '2026-08-01 17:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(50, '2bdd694b-3977-4667-a657-a979f7d842ec', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 1, 'Stop 1', '635 Industrial Road', 'Near Hospital', 'Pune', 'Karnataka', '789059', 'India', '28.14000000', '82.65000000', 'Stop Contact 1', '9759989603', 'intermediate', '2026-08-01 10:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(51, 'e0a6815f-7730-429c-9641-1bb6134af04a', 'b477ad44-57e0-4f71-83d8-a003f9cffb40', 2, 'Stop 2', '254 Park Lane', 'Near School', 'Kolkata', 'Gujarat', '845401', 'India', '33.26000000', '70.08000000', 'Stop Contact 2', '9788869223', 'intermediate', '2026-08-01 06:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(52, '433bb327-c7ec-41d6-a6e0-872008736190', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 1, 'Stop 1', '976 Market Street', 'Near Bus Stand', 'Hyderabad', 'Delhi', '661002', 'India', '34.64000000', '72.97000000', 'Stop Contact 1', '9739270378', 'intermediate', '2026-08-01 15:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(53, 'd4bc8dcb-7640-4899-8b85-231f651ea438', '78662d31-c53f-41fb-9d47-6ef33a5f9d41', 0, 'Stop 0', '392 Park Lane', 'Near Bus Stand', 'Delhi', 'Telangana', '850233', 'India', '10.87000000', '87.19000000', 'Stop Contact 0', '9780168994', 'intermediate', '2026-08-01 04:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(54, '01d7bc08-b0dd-440b-9d16-e014b6af9c97', '176d110a-b58e-444c-9bcd-140c625c7ddb', 1, 'Stop 1', '409 Industrial Road', 'Near School', 'Mumbai', 'Maharashtra', '157241', 'India', '33.27000000', '96.64000000', 'Stop Contact 1', '9727849194', 'intermediate', '2026-08-01 08:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(55, '6dc30248-d666-4766-99ca-41bae7130b28', '176d110a-b58e-444c-9bcd-140c625c7ddb', 2, 'Stop 2', '203 Market Street', 'Near Railway Station', 'Bangalore', 'Karnataka', '569203', 'India', '30.49000000', '79.01000000', 'Stop Contact 2', '9789903415', 'intermediate', '2026-08-01 19:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(56, '0853a7e6-1855-4f10-9e4b-690a62b1ad29', '08a3ff07-acf9-4339-9f42-8fc01ac5109a', 1, 'Stop 1', '661 Express Road', 'Near Hospital', 'Bangalore', 'Gujarat', '788155', 'India', '33.83000000', '77.69000000', 'Stop Contact 1', '9791546748', 'intermediate', '2026-08-01 08:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(57, 'd7aa70c4-8295-4061-9667-ca54bfba7b8c', '252aafa3-28b4-4b74-930c-9561b6f192b0', 1, 'Stop 1', '771 Industrial Road', 'Near Temple', 'Hyderabad', 'West Bengal', '535196', 'India', '18.94000000', '93.03000000', 'Stop Contact 1', '9733683111', 'intermediate', '2026-08-01 13:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(58, 'c6867c06-7704-416f-ae8f-2da28d0bedfa', '252aafa3-28b4-4b74-930c-9561b6f192b0', 2, 'Stop 2', '351 Market Street', 'Near Bus Stand', 'Kolkata', 'West Bengal', '357367', 'India', '22.13000000', '89.48000000', 'Stop Contact 2', '9777013344', 'intermediate', '2026-08-01 11:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(59, 'f1a1501b-43cf-47ad-810e-05b1b72175b4', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 1, 'Stop 1', '420 Market Street', 'Near Hospital', 'Delhi', 'Maharashtra', '881601', 'India', '29.74000000', '85.18000000', 'Stop Contact 1', '9744120244', 'intermediate', '2026-08-01 13:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(60, '0a67e97a-cdef-42ca-8ebe-84b3cbf36a48', 'a62e28dd-abd5-4074-82ac-aa4c5ef03920', 2, 'Stop 2', '621 Express Road', 'Near Temple', 'Hyderabad', 'Delhi', '285889', 'India', '22.52000000', '76.42000000', 'Stop Contact 2', '9782586604', 'intermediate', '2026-08-01 17:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(61, 'e1205cf8-4ba7-4e9c-a2b1-cab4859ca5d4', '52693403-a4ec-4a49-ac64-03c329b69ec8', 1, 'Stop 1', '966 Highway', 'Near Bus Stand', 'Mumbai', 'Telangana', '782426', 'India', '33.30000000', '85.57000000', 'Stop Contact 1', '9728312651', 'intermediate', '2026-08-01 08:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(62, '13f08305-8a12-44ee-8f73-32ed1dd93f4d', '52693403-a4ec-4a49-ac64-03c329b69ec8', 0, 'Stop 0', '381 Park Lane', 'Near School', 'Kolkata', 'West Bengal', '920152', 'India', '20.03000000', '94.48000000', 'Stop Contact 0', '9738655644', 'intermediate', '2026-08-01 00:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(63, '19116f26-6d87-4ffe-b6f9-f9f67d59ec70', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 1, 'Stop 1', '703 Main Road', 'Near Railway Station', 'Delhi', 'Maharashtra', '705341', 'India', '15.68000000', '85.54000000', 'Stop Contact 1', '9766505247', 'intermediate', '2026-08-01 11:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(64, 'e38e0f44-e2e2-4db3-a069-8b746489ad53', 'ba12c2a3-bef6-4897-afc6-e7308b3483a1', 2, 'Stop 2', '452 Main Road', 'Near Temple', 'Delhi', 'Gujarat', '431484', 'India', '29.26000000', '70.89000000', 'Stop Contact 2', '9736006247', 'intermediate', '2026-08-01 05:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(65, '32fa4f4d-77bf-406f-b266-be67ae565670', '9469d467-c76f-4a54-855e-39528eed20c3', 1, 'Stop 1', '873 Park Lane', 'Near Bus Stand', 'Mumbai', 'West Bengal', '695897', 'India', '19.47000000', '80.81000000', 'Stop Contact 1', '9786989739', 'intermediate', '2026-07-31 22:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(66, 'dea029dd-cd0b-42d6-ac71-019f6772ceb1', '9469d467-c76f-4a54-855e-39528eed20c3', 0, 'Stop 0', '145 Main Road', 'Near Railway Station', 'Chennai', 'Tamil Nadu', '251068', 'India', '11.92000000', '97.66000000', 'Stop Contact 0', '9777173869', 'intermediate', '2026-08-01 06:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(67, '2eb3dd42-4a30-470a-bdd8-2bb30091d447', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 1, 'Stop 1', '277 Express Road', 'Near Railway Station', 'Pune', 'Tamil Nadu', '328946', 'India', '26.03000000', '70.30000000', 'Stop Contact 1', '9771755642', 'intermediate', '2026-08-01 07:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(68, 'efa2891e-3e27-4384-aa5c-f6b3dcd32a2a', 'cbcacd71-ff24-49f5-bf8f-58ded2368e32', 2, 'Stop 2', '101 Park Lane', 'Near Hospital', 'Kolkata', 'Delhi', '495865', 'India', '12.73000000', '87.64000000', 'Stop Contact 2', '9736994412', 'intermediate', '2026-08-01 01:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(69, '457647fd-185f-450e-bb19-81d68ddc08c8', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 1, 'Stop 1', '739 Express Road', 'Near Hospital', 'Delhi', 'Tamil Nadu', '465320', 'India', '18.44000000', '81.57000000', 'Stop Contact 1', '9768590972', 'intermediate', '2026-07-31 20:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL),
(70, '225456b0-524b-4b85-bbaa-8de4ff7d5d73', '9ee5826b-9b8a-46c6-92e8-4e85fbc4a54e', 2, 'Stop 2', '701 Industrial Road', 'Near Temple', 'Chennai', 'Maharashtra', '854106', 'India', '31.86000000', '90.70000000', 'Stop Contact 2', '9755384388', 'intermediate', '2026-08-01 05:03:29', NULL, NULL, 'Intermediate stop', NULL, NULL, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trackings`
--

CREATE TABLE `trackings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(26) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tracking_notifications`
--

CREATE TABLE `tracking_notifications` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) DEFAULT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `customer_uuid` char(36) DEFAULT NULL,
  `notification_type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `delivery_status` varchar(255) NOT NULL DEFAULT 'pending',
  `delivered_at` datetime DEFAULT NULL,
  `failed_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trailers`
--

CREATE TABLE `trailers` (
  `uuid` char(36) NOT NULL,
  `branch_uuid` char(36) NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `make` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `year` year(4) NOT NULL,
  `capacity_tons` decimal(10,2) NOT NULL,
  `length_meters` decimal(8,2) NOT NULL,
  `width_meters` decimal(8,2) NOT NULL,
  `height_meters` decimal(8,2) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','retired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trucks`
--

CREATE TABLE `trucks` (
  `uuid` char(36) NOT NULL,
  `branch_uuid` char(36) NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `make` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `year` year(4) NOT NULL,
  `capacity_tons` decimal(10,2) NOT NULL,
  `length_meters` decimal(8,2) NOT NULL,
  `width_meters` decimal(8,2) NOT NULL,
  `height_meters` decimal(8,2) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','retired') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `upi_payments`
--

CREATE TABLE `upi_payments` (
  `uuid` char(36) NOT NULL,
  `payment_uuid` char(36) NOT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `vpa` varchar(255) DEFAULT NULL COMMENT 'Virtual Payment Address',
  `gateway` varchar(255) DEFAULT NULL COMMENT 'googlepay, phonepe, paytm, etc',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, processing, completed, failed',
  `initiated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int(11) NOT NULL DEFAULT 0,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` enum('driver','customer','transporter','admin') NOT NULL DEFAULT 'customer',
  `password` varchar(255) NOT NULL,
  `mpin` varchar(255) DEFAULT NULL,
  `mpin_updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `email`, `first_name`, `last_name`, `phone`, `user_type`, `password`, `mpin`, `mpin_updated_at`, `status`, `is_verified`, `last_login_at`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`) VALUES
(1, 'ddf20522-1558-4c80-ae1b-22b6c8860bd0', 'admin@test.local', 'Admin', 'User', '+919000000000', 'admin', '$2y$12$PGkP7rzxwiJ7uCXWVlvPwOFlzhz4DLits4OxTLuv5P6y5AbeNI2se', NULL, NULL, 'active', 1, '2026-08-06 10:13:11', '2026-07-30 12:33:25', '2026-08-06 10:13:11', NULL, NULL, NULL),
(2, '349cc365-e531-41bd-9dd6-09e26a770d1e', 'customer1@test.local', 'Customer', '1', '+919000000001', 'customer', '$2y$12$9lg1jGE.NqtGShHUqQBrmu4Kh0tvm4KMuDvDBkb6DgjLVo3bMYiJC', NULL, NULL, 'active', 1, '2026-08-05 10:36:53', '2026-07-30 12:33:25', '2026-08-05 10:36:53', NULL, NULL, NULL),
(3, 'bd044b63-ac1a-4d7f-98ac-b60e7c69e850', 'customer2@test.local', 'Customer', '2', '+919000000002', 'customer', '$2y$12$Uk5sAlsOxUK0yJhRM35m7OtwCtsQS.UVrqwyEmP3pPs80BfrPWUvO', NULL, NULL, 'active', 1, NULL, '2026-07-30 12:33:25', '2026-07-30 12:33:25', NULL, NULL, NULL),
(4, 'bd462d74-f934-4a3f-be07-6909d742d53f', 'customer3@test.local', 'Customer', '3', '+919000000003', 'customer', '$2y$12$jwI4Io98qu5Pp5zu4SK7fewMUjumHF76O9t3YsN10RBTR99s6C4ZW', NULL, NULL, 'active', 1, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL, NULL, NULL),
(5, 'd1d2b174-7c6a-4f8d-bcd2-3d80282ebb56', 'driver1@test.local', 'Driver', '1', '+919000000001', 'driver', '$2y$12$yFcT5416D0saLjOb1OHEteOTEc1R5pmK3vU163tC3GhFZDCOOgth.', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL, NULL, NULL),
(6, '96a011b2-d90a-48b7-8b92-af31586abc7f', 'driver2@test.local', 'Driver', '2', '+919000000002', 'driver', '$2y$12$Bt2Mfk.fDHQ4BIoZ76K6peKudkVtRJdBK0P7HBcBQY8r0FoI8chtK', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:26', '2026-07-30 12:33:26', NULL, NULL, NULL),
(7, '989c8a50-0936-41fd-88d7-ac8517e2e680', 'driver3@test.local', 'Driver', '3', '+919000000003', 'driver', '$2y$12$Js0UUC0XXpKl/HuWN5bhVOkQTjL/.S3Crz/2S7xaMwC61.1ErPPBe', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL, NULL, NULL),
(8, '01f4aec9-b97b-4143-944f-7cf5eaa62cf9', 'driver4@test.local', 'Driver', '4', '+919000000004', 'driver', '$2y$12$pqMwqE3o5mJmnVLHIESSh.T2SUAgLg3TkHQXb5BvDOfMWf1YbUk9K', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL, NULL, NULL),
(9, 'ac869d05-3636-471d-ac80-64ed990e3e5e', 'driver5@test.local', 'Driver', '5', '+919000000005', 'driver', '$2y$12$RIYfWck7.2POVVVT9Nm9UeMS0h2uOSimuzP1KggMly5uUvJCK9QQS', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL, NULL, NULL),
(10, '4667d016-6a06-4832-afec-7305d9bb3029', 'driver6@test.local', 'Driver', '6', '+919000000006', 'driver', '$2y$12$r6yxyKT/jB.Ir5ixCv0Ws.n66FQwRS05JnnMl0E2wqr5UHRZ1q3am', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:27', '2026-07-30 12:33:27', NULL, NULL, NULL),
(11, '6b55de16-ae46-45ae-91bc-5f2216ed9ddc', 'driver7@test.local', 'Driver', '7', '+919000000007', 'driver', '$2y$12$wXMtAEYTojoM0MSoKoOxkuFDCxz6hlHV4rbDGE6BOFi8qA7cvTAXW', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL, NULL, NULL),
(12, 'd19f2bbc-eda2-48c9-9502-37bade26623d', 'driver8@test.local', 'Driver', '8', '+919000000008', 'driver', '$2y$12$8szTV6uNI057jx/MrghPPeIhZMVAun93.sgh1dtGs950HKMzQEkW6', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL, NULL, NULL),
(13, '8fa77656-c85e-4e3b-a0f0-4c149aa435d0', 'driver9@test.local', 'Driver', '9', '+919000000009', 'driver', '$2y$12$UbHB8ZFbuOt8Y1meGSZ.FufFze8YMS02yIfg9NQt.mYK/BZqiFDlS', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:28', '2026-07-30 12:33:28', NULL, NULL, NULL),
(14, '07d46a74-49ab-451c-b7d7-4b2c405b7fb1', 'driver10@test.local', 'Driver', '10', '+919000000010', 'driver', '$2y$12$QIk9yRTWtcauOa7PB3Cf6e04ts0RFAFaGzcMDEhGhXO3oX/bxR36K', NULL, NULL, 'active', 0, NULL, '2026-07-30 12:33:29', '2026-07-30 12:33:29', NULL, NULL, NULL),
(15, 'db93dc4a-b647-4eba-8166-68b5a1618ebc', 'admin@transportseva.com', 'Admin', 'User', '9876543210', 'customer', '$2y$12$CRbvPiZUmtfxGM0E/n2DYuTnbUO6.OZ.GF7Amtx0GjMYxjuzUylF6', NULL, NULL, 'active', 1, '2026-08-05 10:36:36', '2026-08-05 10:36:05', '2026-08-05 10:36:36', NULL, NULL, NULL),
(16, 'adf01823-4c18-49fb-bdde-a201e2a2a129', 'manager@transportseva.com', 'Manager', 'User', '9876543211', 'customer', '$2y$12$SOJgzMXesI0nzCSP/dZ0TOQRZ48QSTkXto/o2M7fOmOPh8m9LTpb2', NULL, NULL, 'active', 1, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL, NULL, NULL),
(17, '4618dca0-522f-48ac-97f1-378fa63a5027', 'employee@transportseva.com', 'Employee', 'User', '9876543212', 'customer', '$2y$12$eOocZ0YocYYMvjeG9LHLaOVorc9P5ToqViEe9gAwsgl8Pmksk9sDu', NULL, NULL, 'active', 0, NULL, '2026-08-05 10:36:05', '2026-08-05 10:36:05', NULL, NULL, NULL),
(18, '4e0731c6-b4da-4c2a-ab87-bbf00365cdb5', 'driver@transportseva.com', 'Driver', 'User', '9876543213', 'customer', '$2y$12$vy6B75zcX7xlZRdqhQ8Jfe1156hKbhM49PKwzphFsspaFrwIbmg5O', NULL, NULL, 'active', 1, NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06', NULL, NULL, NULL),
(19, '7a0d6868-fa31-4b2f-84b1-94fe1ac13d9a', 'test.admin@transportseva.com', 'Test', 'Admin', '9876543214', 'customer', '$2y$12$vbRo6Ye5osJN8InQU3RgEOjbAKqp9sAdBleMtS8h3Qou5pMEBe55y', NULL, NULL, 'active', 1, NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06', NULL, NULL, NULL),
(20, 'f2b4cbd7-1a6c-4eb0-9add-96715a485d3f', 'test.manager@transportseva.com', 'Test', 'Manager', '9876543215', 'customer', '$2y$12$8CFAlmqjFLWND3kNnZWd.ORI3bSfbz6xlwygryPOrhdmHTd4Y2xcK', NULL, NULL, 'active', 1, NULL, '2026-08-05 10:36:06', '2026-08-05 10:36:06', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(26) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_fitness`
--

CREATE TABLE `vehicle_fitness` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `certificate_number` varchar(255) NOT NULL,
  `issued_by` varchar(255) NOT NULL,
  `issued_at` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_gps`
--

CREATE TABLE `vehicle_gps` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `device_id` varchar(255) NOT NULL,
  `device_model` varchar(255) NOT NULL,
  `manufacturer` varchar(255) NOT NULL,
  `sim_number` varchar(255) NOT NULL,
  `sim_provider` varchar(255) NOT NULL,
  `imei_number` varchar(255) NOT NULL,
  `installation_date` date NOT NULL,
  `last_sync_at` datetime DEFAULT NULL,
  `status` enum('active','inactive','faulty') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_insurance`
--

CREATE TABLE `vehicle_insurance` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `policy_number` varchar(255) NOT NULL,
  `insurer_name` varchar(255) NOT NULL,
  `coverage_type` varchar(255) NOT NULL,
  `premium_amount` decimal(10,2) NOT NULL,
  `issued_at` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_permits`
--

CREATE TABLE `vehicle_permits` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `permit_number` varchar(255) NOT NULL,
  `permit_type` varchar(255) NOT NULL,
  `issuing_authority` varchar(255) NOT NULL,
  `issued_at` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `routes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`routes`)),
  `document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_pollution`
--

CREATE TABLE `vehicle_pollution` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `certificate_number` varchar(255) NOT NULL,
  `emission_type` varchar(255) NOT NULL,
  `tested_at` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `test_center` varchar(255) NOT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_rc`
--

CREATE TABLE `vehicle_rc` (
  `uuid` char(36) NOT NULL,
  `truck_uuid` char(36) NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `rc_number` varchar(255) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `issued_at` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit_limit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_transactions` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active' COMMENT 'active, inactive, suspended, frozen',
  `last_transaction_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`uuid`, `customer_uuid`, `balance`, `credit_limit`, `total_transactions`, `status`, `last_transaction_at`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('4b9ccfd5-99f3-4a39-93e3-6b41d4f0178c', '0747f409-a6d4-4cdb-9efb-076102f2b6c9', '23000.00', '29556.00', 0, 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('7caa507b-c0eb-40b5-96bb-66b041c168b1', '406d0808-68a9-4f43-86c7-742774b247b2', '45524.00', '76861.00', 0, 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('8b0ce969-bf7e-4761-9af5-900515b3d892', '3290bd11-dfa5-45a4-9fe4-8b42507bf73b', '19429.00', '43545.00', 0, 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('9148c5d8-5e4d-4778-9aad-e5e8415513ec', '447b85f3-03bd-4bac-9966-180a174185e7', '25371.00', '31151.00', 0, 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('ffd2f7f1-c039-4446-a0c4-5ff342dce634', '34b4d050-3750-4ef3-a71f-902d8024ca7a', '20258.00', '74077.00', 0, 'active', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `uuid` char(36) NOT NULL,
  `wallet_uuid` char(36) NOT NULL,
  `transaction_type` varchar(255) NOT NULL COMMENT 'credit, debit, refund, adjustment',
  `amount` decimal(12,2) NOT NULL,
  `balance_before` decimal(12,2) NOT NULL,
  `balance_after` decimal(12,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'completed' COMMENT 'pending, completed, failed, reversed',
  `reference_type` varchar(255) DEFAULT NULL COMMENT 'booking, payment, refund',
  `reference_uuid` char(36) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`uuid`, `wallet_uuid`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `status`, `reference_type`, `reference_uuid`, `description`, `remarks`, `created_by`, `updated_by`, `deleted_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('00358460-dcd9-45f3-b152-ab357252f6cd', '8b0ce969-bf7e-4761-9af5-900515b3d892', 'debit', '4003.00', '19429.00', '23526.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('0efbe4c9-63db-4c22-bd0e-bca173421012', '8b0ce969-bf7e-4761-9af5-900515b3d892', 'credit', '2418.00', '19429.00', '21880.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('101614b9-c956-4c79-9e1f-8f3d8d6c00d6', '7caa507b-c0eb-40b5-96bb-66b041c168b1', 'debit', '310.00', '45524.00', '48106.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('409ad902-a4fe-4cea-b884-c8f40a299b85', '4b9ccfd5-99f3-4a39-93e3-6b41d4f0178c', 'debit', '2198.00', '23000.00', '22898.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('43f9423f-9c8b-4eb5-9206-03ecb38ccd16', '9148c5d8-5e4d-4778-9aad-e5e8415513ec', 'credit', '4454.00', '25371.00', '22603.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('7c0ba7f7-65ad-4e93-8b7d-b08743f72d6d', '4b9ccfd5-99f3-4a39-93e3-6b41d4f0178c', 'credit', '1725.00', '23000.00', '27611.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('819f32a4-e2ea-43c2-be81-43eeb1fb4ae0', '7caa507b-c0eb-40b5-96bb-66b041c168b1', 'credit', '663.00', '45524.00', '49443.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('88c33d6f-97d6-4468-b6b0-bbee491124aa', '7caa507b-c0eb-40b5-96bb-66b041c168b1', 'credit', '338.00', '45524.00', '50378.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('ab931e50-cf3b-4b80-b435-e2d083dc9414', '4b9ccfd5-99f3-4a39-93e3-6b41d4f0178c', 'debit', '3030.00', '23000.00', '20612.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('bbd2b44a-b08a-439c-85da-ebf13516fbaa', 'ffd2f7f1-c039-4446-a0c4-5ff342dce634', 'credit', '1803.00', '20258.00', '18228.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('bfdcc423-4f12-48f2-8b29-ec8e3bf4c5d1', 'ffd2f7f1-c039-4446-a0c4-5ff342dce634', 'debit', '3046.00', '20258.00', '16062.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('e2a9e189-4a97-4eb0-a3e0-32d5f4bcdb34', '8b0ce969-bf7e-4761-9af5-900515b3d892', 'debit', '4488.00', '19429.00', '18699.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('e8843562-f59e-4746-a056-4b437729b506', '9148c5d8-5e4d-4778-9aad-e5e8415513ec', 'credit', '1700.00', '25371.00', '24029.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('f16f3341-a2f7-43f8-9ad1-8152ecbcfd83', '9148c5d8-5e4d-4778-9aad-e5e8415513ec', 'debit', '4924.00', '25371.00', '29025.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL),
('f19b5f44-17be-4e5b-829b-70c70215f5d5', 'ffd2f7f1-c039-4446-a0c4-5ff342dce634', 'debit', '3164.00', '20258.00', '23363.00', 'completed', 'booking', NULL, 'Sample wallet transaction', NULL, NULL, NULL, NULL, '2026-07-30 11:27:19', '2026-07-30 11:27:19', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `access_tokens_token_unique` (`token`),
  ADD KEY `access_tokens_user_uuid_index` (`user_uuid`),
  ADD KEY `access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `addresses_uuid_index` (`uuid`),
  ADD KEY `addresses_customer_uuid_index` (`customer_uuid`),
  ADD KEY `addresses_address_type_index` (`address_type`),
  ADD KEY `addresses_is_primary_index` (`is_primary`),
  ADD KEY `addresses_city_state_index` (`city`,`state`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `bookings_booking_reference_unique` (`booking_reference`),
  ADD KEY `bookings_customer_uuid_index` (`customer_uuid`),
  ADD KEY `bookings_driver_uuid_index` (`driver_uuid`),
  ADD KEY `bookings_vehicle_uuid_index` (`vehicle_uuid`),
  ADD KEY `bookings_fleet_uuid_index` (`fleet_uuid`),
  ADD KEY `bookings_status_index` (`status`),
  ADD KEY `bookings_payment_status_index` (`payment_status`),
  ADD KEY `bookings_created_at_index` (`created_at`);

--
-- Indexes for table `booking_token_orders`
--
ALTER TABLE `booking_token_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_token_orders_booking_uuid_party_uuid_unique` (`booking_uuid`,`party_uuid`),
  ADD UNIQUE KEY `booking_token_orders_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `booking_token_orders_provider_order_id_unique` (`provider_order_id`),
  ADD UNIQUE KEY `booking_token_orders_provider_refund_id_unique` (`provider_refund_id`),
  ADD KEY `booking_token_orders_booking_uuid_status_index` (`booking_uuid`,`status`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `branches_code_unique` (`code`),
  ADD KEY `branches_uuid_index` (`uuid`),
  ADD KEY `branches_company_uuid_index` (`company_uuid`),
  ADD KEY `branches_status_index` (`status`),
  ADD KEY `branches_code_index` (`code`),
  ADD KEY `branches_name_index` (`name`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `businesses_pan_unique` (`pan`),
  ADD KEY `businesses_uuid_index` (`uuid`),
  ADD KEY `businesses_customer_uuid_index` (`customer_uuid`),
  ADD KEY `businesses_pan_index` (`pan`),
  ADD KEY `businesses_business_type_index` (`business_type`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cod_payments`
--
ALTER TABLE `cod_payments`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `cod_payments_payment_uuid_foreign` (`payment_uuid`),
  ADD KEY `cod_payments_status_index` (`status`),
  ADD KEY `cod_payments_collection_method_index` (`collection_method`),
  ADD KEY `cod_payments_driver_uuid_index` (`driver_uuid`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `companies_registration_number_unique` (`registration_number`),
  ADD UNIQUE KEY `companies_email_unique` (`email`),
  ADD UNIQUE KEY `companies_tax_id_unique` (`tax_id`),
  ADD UNIQUE KEY `companies_gst_number_unique` (`gst_number`),
  ADD UNIQUE KEY `companies_pan_number_unique` (`pan_number`),
  ADD KEY `companies_name_index` (`name`),
  ADD KEY `companies_status_index` (`status`),
  ADD KEY `companies_display_order_index` (`display_order`),
  ADD KEY `companies_created_at_index` (`created_at`);

--
-- Indexes for table `containers`
--
ALTER TABLE `containers`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `containers_container_number_unique` (`container_number`),
  ADD KEY `containers_branch_uuid_foreign` (`branch_uuid`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `customers_uuid_index` (`uuid`),
  ADD KEY `customers_user_uuid_index` (`user_uuid`),
  ADD KEY `customers_customer_type_index` (`customer_type`),
  ADD KEY `customers_kyc_status_index` (`kyc_status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `departments_code_unique` (`code`),
  ADD KEY `departments_name_index` (`name`),
  ADD KEY `departments_is_active_index` (`is_active`),
  ADD KEY `departments_display_order_index` (`display_order`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `designations_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `designations_code_unique` (`code`),
  ADD KEY `designations_uuid_index` (`uuid`),
  ADD KEY `designations_status_index` (`status`),
  ADD KEY `designations_name_index` (`name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documents_uuid_unique` (`uuid`),
  ADD KEY `idx_company_uuid` (`company_uuid`),
  ADD KEY `idx_entity_type_uuid` (`entity_type`,`entity_uuid`),
  ADD KEY `idx_document_category` (`document_category`),
  ADD KEY `documents_is_verified_index` (`is_verified`),
  ADD KEY `documents_expiry_date_index` (`expiry_date`);

--
-- Indexes for table `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_approval_per_doc` (`document_id`),
  ADD UNIQUE KEY `document_approvals_uuid_unique` (`uuid`),
  ADD KEY `document_approvals_company_uuid_foreign` (`company_uuid`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `document_approvals_status_index` (`status`);

--
-- Indexes for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_templates_uuid_unique` (`uuid`),
  ADD KEY `idx_document_templates_company_uuid` (`company_uuid`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `document_templates_is_active_index` (`is_active`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `drivers_user_uuid_unique` (`user_uuid`),
  ADD UNIQUE KEY `drivers_license_number_unique` (`license_number`);

--
-- Indexes for table `driver_aadhaar`
--
ALTER TABLE `driver_aadhaar`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `driver_aadhaar_driver_uuid_unique` (`driver_uuid`),
  ADD UNIQUE KEY `driver_aadhaar_aadhaar_number_unique` (`aadhaar_number`),
  ADD KEY `driver_aadhaar_aadhaar_hash_index` (`aadhaar_hash`);

--
-- Indexes for table `driver_emergency_contacts`
--
ALTER TABLE `driver_emergency_contacts`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `driver_emergency_contacts_driver_uuid_foreign` (`driver_uuid`);

--
-- Indexes for table `driver_experience`
--
ALTER TABLE `driver_experience`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `driver_experience_driver_uuid_foreign` (`driver_uuid`);

--
-- Indexes for table `driver_licenses`
--
ALTER TABLE `driver_licenses`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `driver_licenses_driver_uuid_unique` (`driver_uuid`),
  ADD UNIQUE KEY `driver_licenses_license_number_unique` (`license_number`);

--
-- Indexes for table `driver_profiles`
--
ALTER TABLE `driver_profiles`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `driver_profiles_driver_uuid_unique` (`driver_uuid`);

--
-- Indexes for table `driver_ratings`
--
ALTER TABLE `driver_ratings`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `driver_ratings_rater_uuid_foreign` (`rater_uuid`),
  ADD KEY `driver_ratings_driver_uuid_rated_at_index` (`driver_uuid`,`rated_at`);

--
-- Indexes for table `drops`
--
ALTER TABLE `drops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `drops_uuid_unique` (`uuid`),
  ADD KEY `drops_booking_uuid_index` (`booking_uuid`),
  ADD KEY `drops_scheduled_at_index` (`scheduled_at`);

--
-- Indexes for table `etas`
--
ALTER TABLE `etas`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `etas_booking_uuid_index` (`booking_uuid`),
  ADD KEY `etas_driver_uuid_index` (`driver_uuid`),
  ADD KEY `etas_status_index` (`status`),
  ADD KEY `etas_estimated_drop_time_index` (`estimated_drop_time`),
  ADD KEY `etas_booking_uuid_status_index` (`booking_uuid`,`status`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `favorite_routes_uuid_index` (`uuid`),
  ADD KEY `favorite_routes_customer_uuid_index` (`customer_uuid`),
  ADD KEY `favorite_routes_is_active_index` (`is_active`),
  ADD KEY `favorite_routes_frequency_index` (`frequency`),
  ADD KEY `favorite_routes_origin_city_destination_city_index` (`origin_city`,`destination_city`);

--
-- Indexes for table `fleets`
--
ALTER TABLE `fleets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fleets_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `fleets_vehicle_number_unique` (`vehicle_number`),
  ADD UNIQUE KEY `fleets_registration_number_unique` (`registration_number`),
  ADD KEY `fleets_company_uuid_index` (`company_uuid`),
  ADD KEY `fleets_status_index` (`status`),
  ADD KEY `fleets_vehicle_number_index` (`vehicle_number`);

--
-- Indexes for table `goods`
--
ALTER TABLE `goods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `goods_uuid_unique` (`uuid`),
  ADD KEY `goods_booking_uuid_index` (`booking_uuid`),
  ADD KEY `goods_item_type_index` (`item_type`);

--
-- Indexes for table `gps_devices`
--
ALTER TABLE `gps_devices`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `gps_devices_device_id_unique` (`device_id`),
  ADD KEY `gps_devices_device_id_index` (`device_id`),
  ADD KEY `gps_devices_vehicle_uuid_index` (`vehicle_uuid`),
  ADD KEY `gps_devices_is_active_index` (`is_active`),
  ADD KEY `gps_devices_status_index` (`status`),
  ADD KEY `gps_devices_last_heartbeat_at_index` (`last_heartbeat_at`),
  ADD KEY `gps_devices_vehicle_uuid_is_active_index` (`vehicle_uuid`,`is_active`);

--
-- Indexes for table `gps_locations`
--
ALTER TABLE `gps_locations`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `gps_locations_booking_uuid_index` (`booking_uuid`),
  ADD KEY `gps_locations_driver_uuid_index` (`driver_uuid`),
  ADD KEY `gps_locations_vehicle_uuid_index` (`vehicle_uuid`),
  ADD KEY `gps_locations_gps_device_uuid_index` (`gps_device_uuid`),
  ADD KEY `gps_locations_source_index` (`source`),
  ADD KEY `gps_locations_recorded_at_index` (`recorded_at`),
  ADD KEY `gps_locations_booking_uuid_recorded_at_index` (`booking_uuid`,`recorded_at`),
  ADD KEY `gps_locations_driver_uuid_recorded_at_index` (`driver_uuid`,`recorded_at`),
  ADD KEY `gps_locations_vehicle_uuid_recorded_at_index` (`vehicle_uuid`,`recorded_at`),
  ADD KEY `gps_locations_gps_device_uuid_recorded_at_index` (`gps_device_uuid`,`recorded_at`);

--
-- Indexes for table `gsts`
--
ALTER TABLE `gsts`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `gsts_gst_number_unique` (`gst_number`),
  ADD KEY `gsts_uuid_index` (`uuid`),
  ADD KEY `gsts_customer_uuid_index` (`customer_uuid`),
  ADD KEY `gsts_gst_number_index` (`gst_number`),
  ADD KEY `gsts_registration_type_index` (`registration_type`);

--
-- Indexes for table `gst_configs`
--
ALTER TABLE `gst_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gst_configs_uuid_unique` (`uuid`),
  ADD KEY `gst_configs_uuid_index` (`uuid`),
  ADD KEY `gst_configs_company_uuid_index` (`company_uuid`),
  ADD KEY `gst_configs_gst_number_index` (`gst_number`),
  ADD KEY `gst_configs_is_active_index` (`is_active`);

--
-- Indexes for table `individuals`
--
ALTER TABLE `individuals`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `individuals_pan_unique` (`pan`),
  ADD KEY `individuals_uuid_index` (`uuid`),
  ADD KEY `individuals_customer_uuid_index` (`customer_uuid`),
  ADD KEY `individuals_pan_index` (`pan`),
  ADD KEY `individuals_aadhaar_index` (`aadhaar`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  ADD KEY `invoices_status_index` (`status`),
  ADD KEY `invoices_invoice_number_index` (`invoice_number`),
  ADD KEY `invoices_due_date_index` (`due_date`),
  ADD KEY `invoices_created_at_index` (`created_at`),
  ADD KEY `invoices_booking_uuid_index` (`booking_uuid`),
  ADD KEY `invoices_customer_uuid_index` (`customer_uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `ledgers_account_code_unique` (`account_code`),
  ADD KEY `ledgers_ledger_type_index` (`ledger_type`),
  ADD KEY `ledgers_status_index` (`status`),
  ADD KEY `ledgers_company_uuid_index` (`company_uuid`),
  ADD KEY `ledgers_customer_uuid_index` (`customer_uuid`);

--
-- Indexes for table `ledger_entries`
--
ALTER TABLE `ledger_entries`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `ledger_entries_transaction_type_index` (`transaction_type`),
  ADD KEY `ledger_entries_is_reconciled_index` (`is_reconciled`),
  ADD KEY `ledger_entries_created_at_index` (`created_at`),
  ADD KEY `ledger_entries_ledger_uuid_index` (`ledger_uuid`),
  ADD KEY `ledger_entries_payment_uuid_index` (`payment_uuid`);

--
-- Indexes for table `live_locations`
--
ALTER TABLE `live_locations`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `live_locations_driver_uuid_unique` (`driver_uuid`),
  ADD KEY `live_locations_booking_uuid_index` (`booking_uuid`),
  ADD KEY `live_locations_driver_uuid_index` (`driver_uuid`),
  ADD KEY `live_locations_is_active_index` (`is_active`);

--
-- Indexes for table `loads`
--
ALTER TABLE `loads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loads_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `loads_load_reference_unique` (`load_reference`),
  ADD KEY `loads_status_pickup_city_drop_city_index` (`status`,`pickup_city`,`drop_city`),
  ADD KEY `loads_vehicle_type_index` (`vehicle_type`);

--
-- Indexes for table `load_applications`
--
ALTER TABLE `load_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `load_applications_load_uuid_applicant_uuid_unique` (`load_uuid`,`applicant_uuid`),
  ADD UNIQUE KEY `load_applications_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `load_applications_application_reference_unique` (`application_reference`),
  ADD KEY `load_applications_load_uuid_status_index` (`load_uuid`,`status`);

--
-- Indexes for table `marketplace_bookings`
--
ALTER TABLE `marketplace_bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `marketplace_bookings_application_uuid_unique` (`application_uuid`),
  ADD UNIQUE KEY `marketplace_bookings_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `marketplace_bookings_booking_reference_unique` (`booking_reference`),
  ADD KEY `marketplace_bookings_owner_uuid_provider_uuid_index` (`owner_uuid`,`provider_uuid`);

--
-- Indexes for table `marketplace_disputes`
--
ALTER TABLE `marketplace_disputes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `marketplace_disputes_uuid_unique` (`uuid`),
  ADD KEY `marketplace_disputes_booking_uuid_status_index` (`booking_uuid`,`status`);

--
-- Indexes for table `marketplace_settlements`
--
ALTER TABLE `marketplace_settlements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `marketplace_settlements_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `marketplace_settlements_booking_uuid_unique` (`booking_uuid`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `mpin_reset_otps`
--
ALTER TABLE `mpin_reset_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mpin_reset_otps_user_uuid_index` (`user_uuid`),
  ADD KEY `mpin_reset_otps_expires_at_index` (`expires_at`);

--
-- Indexes for table `negotiation_offers`
--
ALTER TABLE `negotiation_offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `negotiation_offers_uuid_unique` (`uuid`),
  ADD KEY `negotiation_offers_application_uuid_created_at_index` (`application_uuid`,`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `notifications_channel_status_created_at_index` (`channel`,`status`,`created_at`),
  ADD KEY `notifications_company_uuid_index` (`company_uuid`),
  ADD KEY `notifications_recipient_id_index` (`recipient_id`),
  ADD KEY `notifications_channel_index` (`channel`),
  ADD KEY `notifications_template_key_index` (`template_key`),
  ADD KEY `notifications_status_index` (`status`),
  ADD KEY `notifications_external_id_index` (`external_id`);

--
-- Indexes for table `notification_channel_configs`
--
ALTER TABLE `notification_channel_configs`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `unique_channel_provider` (`company_uuid`,`channel`,`provider`),
  ADD KEY `notification_channel_configs_company_uuid_index` (`company_uuid`),
  ADD KEY `notification_channel_configs_channel_index` (`channel`),
  ADD KEY `notification_channel_configs_provider_index` (`provider`),
  ADD KEY `notification_channel_configs_is_active_index` (`is_active`);

--
-- Indexes for table `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `unique_template_per_channel` (`company_uuid`,`key`,`channel`),
  ADD KEY `notification_templates_company_uuid_index` (`company_uuid`),
  ADD KEY `notification_templates_key_index` (`key`),
  ADD KEY `notification_templates_is_active_index` (`is_active`);

--
-- Indexes for table `online_payments`
--
ALTER TABLE `online_payments`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `online_payments_gateway_payment_id_unique` (`gateway_payment_id`),
  ADD KEY `online_payments_payment_uuid_foreign` (`payment_uuid`),
  ADD KEY `online_payments_status_index` (`status`),
  ADD KEY `online_payments_gateway_index` (`gateway`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  ADD KEY `payments_status_index` (`status`),
  ADD KEY `payments_payment_method_index` (`payment_method`),
  ADD KEY `payments_payment_date_index` (`payment_date`),
  ADD KEY `payments_booking_uuid_index` (`booking_uuid`),
  ADD KEY `payments_customer_uuid_index` (`customer_uuid`);

--
-- Indexes for table `payment_webhook_events`
--
ALTER TABLE `payment_webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_webhook_events_event_key_unique` (`event_key`),
  ADD KEY `payment_webhook_events_provider_event_type_index` (`provider`,`event_type`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `permissions_slug_unique` (`slug`),
  ADD UNIQUE KEY `permissions_code_unique` (`code`),
  ADD KEY `permissions_uuid_index` (`uuid`),
  ADD KEY `permissions_status_index` (`status`),
  ADD KEY `permissions_slug_index` (`slug`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `pickups`
--
ALTER TABLE `pickups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pickups_uuid_unique` (`uuid`),
  ADD KEY `pickups_booking_uuid_index` (`booking_uuid`),
  ADD KEY `pickups_scheduled_at_index` (`scheduled_at`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipts_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`),
  ADD KEY `receipts_uuid_index` (`uuid`),
  ADD KEY `receipts_receipt_number_index` (`receipt_number`),
  ADD KEY `receipts_invoice_uuid_index` (`invoice_uuid`),
  ADD KEY `receipts_customer_uuid_index` (`customer_uuid`),
  ADD KEY `receipts_status_index` (`status`),
  ADD KEY `receipts_receipt_date_index` (`receipt_date`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_unique` (`token`),
  ADD KEY `refresh_tokens_user_uuid_index` (`user_uuid`),
  ADD KEY `refresh_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `registration_otps`
--
ALTER TABLE `registration_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_otps_phone_index` (`phone`),
  ADD KEY `registration_otps_expires_at_index` (`expires_at`),
  ADD KEY `registration_otps_user_uuid_index` (`user_uuid`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `roles_code_unique` (`code`),
  ADD KEY `roles_uuid_index` (`uuid`),
  ADD KEY `roles_status_index` (`status`),
  ADD KEY `roles_name_index` (`name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permission_role_id_permission_id_unique` (`role_id`,`permission_id`),
  ADD KEY `role_permission_role_id_index` (`role_id`),
  ADD KEY `role_permission_permission_id_index` (`permission_id`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_user_role_id_user_id_unique` (`role_id`,`user_id`),
  ADD KEY `role_user_role_id_index` (`role_id`),
  ADD KEY `role_user_user_id_index` (`user_id`);

--
-- Indexes for table `route_histories`
--
ALTER TABLE `route_histories`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `route_histories_booking_uuid_route_sequence_unique` (`booking_uuid`,`route_sequence`),
  ADD KEY `route_histories_booking_uuid_index` (`booking_uuid`),
  ADD KEY `route_histories_driver_uuid_index` (`driver_uuid`),
  ADD KEY `route_histories_timestamp_index` (`timestamp`),
  ADD KEY `route_histories_booking_uuid_route_sequence_index` (`booking_uuid`,`route_sequence`),
  ADD KEY `route_histories_driver_uuid_timestamp_index` (`driver_uuid`,`timestamp`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `sms_messages`
--
ALTER TABLE `sms_messages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sms_messages_message_id_unique` (`message_id`),
  ADD KEY `sms_messages_provider_status_index` (`provider`,`status`),
  ADD KEY `sms_messages_phone_created_at_index` (`phone`,`created_at`);

--
-- Indexes for table `spatie_permissions_backup`
--
ALTER TABLE `spatie_permissions_backup`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `spatie_roles_backup`
--
ALTER TABLE `spatie_roles_backup`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stopages`
--
ALTER TABLE `stopages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stopages_booking_uuid_stop_sequence_unique` (`booking_uuid`,`stop_sequence`),
  ADD UNIQUE KEY `stopages_uuid_unique` (`uuid`),
  ADD KEY `stopages_booking_uuid_index` (`booking_uuid`),
  ADD KEY `stopages_stop_sequence_index` (`stop_sequence`),
  ADD KEY `stopages_scheduled_at_index` (`scheduled_at`);

--
-- Indexes for table `trackings`
--
ALTER TABLE `trackings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trackings_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `trackings_code_unique` (`code`),
  ADD KEY `trackings_uuid_index` (`uuid`),
  ADD KEY `trackings_status_index` (`status`),
  ADD KEY `trackings_name_index` (`name`);

--
-- Indexes for table `tracking_notifications`
--
ALTER TABLE `tracking_notifications`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `tracking_notifications_booking_uuid_index` (`booking_uuid`),
  ADD KEY `tracking_notifications_driver_uuid_index` (`driver_uuid`),
  ADD KEY `tracking_notifications_customer_uuid_index` (`customer_uuid`),
  ADD KEY `tracking_notifications_notification_type_index` (`notification_type`),
  ADD KEY `tracking_notifications_is_read_index` (`is_read`),
  ADD KEY `tracking_notifications_delivery_status_index` (`delivery_status`),
  ADD KEY `tracking_notifications_driver_uuid_is_read_index` (`driver_uuid`,`is_read`),
  ADD KEY `tracking_notifications_customer_uuid_is_read_index` (`customer_uuid`,`is_read`),
  ADD KEY `tracking_notifications_created_at_index` (`created_at`);

--
-- Indexes for table `trailers`
--
ALTER TABLE `trailers`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `trailers_registration_number_unique` (`registration_number`),
  ADD KEY `trailers_branch_uuid_foreign` (`branch_uuid`);

--
-- Indexes for table `trucks`
--
ALTER TABLE `trucks`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `trucks_registration_number_unique` (`registration_number`),
  ADD KEY `trucks_branch_uuid_foreign` (`branch_uuid`);

--
-- Indexes for table `upi_payments`
--
ALTER TABLE `upi_payments`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `upi_payments_payment_uuid_foreign` (`payment_uuid`),
  ADD KEY `upi_payments_status_index` (`status`),
  ADD KEY `upi_payments_upi_id_index` (`upi_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_uuid_unique` (`uuid`),
  ADD KEY `users_status_index` (`status`),
  ADD KEY `users_uuid_index` (`uuid`),
  ADD KEY `users_user_type_index` (`user_type`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicles_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `vehicles_code_unique` (`code`),
  ADD KEY `vehicles_uuid_index` (`uuid`),
  ADD KEY `vehicles_status_index` (`status`),
  ADD KEY `vehicles_name_index` (`name`);

--
-- Indexes for table `vehicle_fitness`
--
ALTER TABLE `vehicle_fitness`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_fitness_certificate_number_unique` (`certificate_number`),
  ADD KEY `vehicle_fitness_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `vehicle_gps`
--
ALTER TABLE `vehicle_gps`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_gps_device_id_unique` (`device_id`),
  ADD KEY `vehicle_gps_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `vehicle_insurance`
--
ALTER TABLE `vehicle_insurance`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_insurance_policy_number_unique` (`policy_number`),
  ADD KEY `vehicle_insurance_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `vehicle_permits`
--
ALTER TABLE `vehicle_permits`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_permits_permit_number_unique` (`permit_number`),
  ADD KEY `vehicle_permits_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `vehicle_pollution`
--
ALTER TABLE `vehicle_pollution`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_pollution_certificate_number_unique` (`certificate_number`),
  ADD KEY `vehicle_pollution_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `vehicle_rc`
--
ALTER TABLE `vehicle_rc`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `vehicle_rc_rc_number_unique` (`rc_number`),
  ADD KEY `vehicle_rc_truck_uuid_foreign` (`truck_uuid`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`uuid`),
  ADD UNIQUE KEY `wallets_customer_uuid_unique` (`customer_uuid`),
  ADD KEY `wallets_status_index` (`status`),
  ADD KEY `wallets_balance_index` (`balance`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`uuid`),
  ADD KEY `wallet_transactions_wallet_uuid_foreign` (`wallet_uuid`),
  ADD KEY `wallet_transactions_transaction_type_index` (`transaction_type`),
  ADD KEY `wallet_transactions_status_index` (`status`),
  ADD KEY `wallet_transactions_reference_type_reference_uuid_index` (`reference_type`,`reference_uuid`),
  ADD KEY `wallet_transactions_created_at_index` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_tokens`
--
ALTER TABLE `access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `booking_token_orders`
--
ALTER TABLE `booking_token_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_approvals`
--
ALTER TABLE `document_approvals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_templates`
--
ALTER TABLE `document_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `drops`
--
ALTER TABLE `drops`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fleets`
--
ALTER TABLE `fleets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goods`
--
ALTER TABLE `goods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `gst_configs`
--
ALTER TABLE `gst_configs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loads`
--
ALTER TABLE `loads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `load_applications`
--
ALTER TABLE `load_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marketplace_bookings`
--
ALTER TABLE `marketplace_bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marketplace_disputes`
--
ALTER TABLE `marketplace_disputes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marketplace_settlements`
--
ALTER TABLE `marketplace_settlements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `mpin_reset_otps`
--
ALTER TABLE `mpin_reset_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `negotiation_offers`
--
ALTER TABLE `negotiation_offers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_webhook_events`
--
ALTER TABLE `payment_webhook_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pickups`
--
ALTER TABLE `pickups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `registration_otps`
--
ALTER TABLE `registration_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `role_user`
--
ALTER TABLE `role_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `sms_messages`
--
ALTER TABLE `sms_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spatie_permissions_backup`
--
ALTER TABLE `spatie_permissions_backup`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spatie_roles_backup`
--
ALTER TABLE `spatie_roles_backup`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `state`
--
ALTER TABLE `state`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stopages`
--
ALTER TABLE `stopages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `trackings`
--
ALTER TABLE `trackings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD CONSTRAINT `access_tokens_user_uuid_foreign` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `cod_payments`
--
ALTER TABLE `cod_payments`
  ADD CONSTRAINT `cod_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `containers`
--
ALTER TABLE `containers`
  ADD CONSTRAINT `containers_branch_uuid_foreign` FOREIGN KEY (`branch_uuid`) REFERENCES `branches` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_company_uuid_foreign` FOREIGN KEY (`company_uuid`) REFERENCES `companies` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD CONSTRAINT `document_approvals_company_uuid_foreign` FOREIGN KEY (`company_uuid`) REFERENCES `companies` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_approvals_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_templates`
--
ALTER TABLE `document_templates`
  ADD CONSTRAINT `document_templates_company_uuid_foreign` FOREIGN KEY (`company_uuid`) REFERENCES `companies` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_user_uuid_foreign` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_aadhaar`
--
ALTER TABLE `driver_aadhaar`
  ADD CONSTRAINT `driver_aadhaar_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_emergency_contacts`
--
ALTER TABLE `driver_emergency_contacts`
  ADD CONSTRAINT `driver_emergency_contacts_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_experience`
--
ALTER TABLE `driver_experience`
  ADD CONSTRAINT `driver_experience_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_licenses`
--
ALTER TABLE `driver_licenses`
  ADD CONSTRAINT `driver_licenses_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_profiles`
--
ALTER TABLE `driver_profiles`
  ADD CONSTRAINT `driver_profiles_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `driver_ratings`
--
ALTER TABLE `driver_ratings`
  ADD CONSTRAINT `driver_ratings_driver_uuid_foreign` FOREIGN KEY (`driver_uuid`) REFERENCES `drivers` (`uuid`) ON DELETE CASCADE,
  ADD CONSTRAINT `driver_ratings_rater_uuid_foreign` FOREIGN KEY (`rater_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `drops`
--
ALTER TABLE `drops`
  ADD CONSTRAINT `drops_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `etas`
--
ALTER TABLE `etas`
  ADD CONSTRAINT `etas_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `favorite_routes`
--
ALTER TABLE `favorite_routes`
  ADD CONSTRAINT `favorite_routes_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `goods`
--
ALTER TABLE `goods`
  ADD CONSTRAINT `goods_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `gps_locations`
--
ALTER TABLE `gps_locations`
  ADD CONSTRAINT `gps_locations_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `gsts`
--
ALTER TABLE `gsts`
  ADD CONSTRAINT `gsts_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `individuals`
--
ALTER TABLE `individuals`
  ADD CONSTRAINT `individuals_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `live_locations`
--
ALTER TABLE `live_locations`
  ADD CONSTRAINT `live_locations_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `spatie_permissions_backup` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `spatie_roles_backup` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mpin_reset_otps`
--
ALTER TABLE `mpin_reset_otps`
  ADD CONSTRAINT `mpin_reset_otps_user_uuid_foreign` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `online_payments`
--
ALTER TABLE `online_payments`
  ADD CONSTRAINT `online_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `pickups`
--
ALTER TABLE `pickups`
  ADD CONSTRAINT `pickups_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_user_uuid_foreign` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `spatie_permissions_backup` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `spatie_roles_backup` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `route_histories`
--
ALTER TABLE `route_histories`
  ADD CONSTRAINT `route_histories_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `stopages`
--
ALTER TABLE `stopages`
  ADD CONSTRAINT `stopages_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `tracking_notifications`
--
ALTER TABLE `tracking_notifications`
  ADD CONSTRAINT `tracking_notifications_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE,
  ADD CONSTRAINT `tracking_notifications_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE SET NULL;

--
-- Constraints for table `trailers`
--
ALTER TABLE `trailers`
  ADD CONSTRAINT `trailers_branch_uuid_foreign` FOREIGN KEY (`branch_uuid`) REFERENCES `branches` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `trucks`
--
ALTER TABLE `trucks`
  ADD CONSTRAINT `trucks_branch_uuid_foreign` FOREIGN KEY (`branch_uuid`) REFERENCES `branches` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `upi_payments`
--
ALTER TABLE `upi_payments`
  ADD CONSTRAINT `upi_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_fitness`
--
ALTER TABLE `vehicle_fitness`
  ADD CONSTRAINT `vehicle_fitness_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_gps`
--
ALTER TABLE `vehicle_gps`
  ADD CONSTRAINT `vehicle_gps_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_insurance`
--
ALTER TABLE `vehicle_insurance`
  ADD CONSTRAINT `vehicle_insurance_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_permits`
--
ALTER TABLE `vehicle_permits`
  ADD CONSTRAINT `vehicle_permits_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_pollution`
--
ALTER TABLE `vehicle_pollution`
  ADD CONSTRAINT `vehicle_pollution_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_rc`
--
ALTER TABLE `vehicle_rc`
  ADD CONSTRAINT `vehicle_rc_truck_uuid_foreign` FOREIGN KEY (`truck_uuid`) REFERENCES `trucks` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_wallet_uuid_foreign` FOREIGN KEY (`wallet_uuid`) REFERENCES `wallets` (`uuid`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
