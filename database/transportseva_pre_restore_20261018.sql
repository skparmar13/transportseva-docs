/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: transportseva
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `transportseva`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `transportseva` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `transportseva`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `addresses_uuid_index` (`uuid`),
  KEY `addresses_customer_uuid_index` (`customer_uuid`),
  KEY `addresses_address_type_index` (`address_type`),
  KEY `addresses_is_primary_index` (`is_primary`),
  KEY `addresses_city_state_index` (`city`,`state`),
  CONSTRAINT `addresses_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_token_orders`
--

DROP TABLE IF EXISTS `booking_token_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_token_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_token_orders_booking_uuid_party_uuid_unique` (`booking_uuid`,`party_uuid`),
  UNIQUE KEY `booking_token_orders_uuid_unique` (`uuid`),
  UNIQUE KEY `booking_token_orders_provider_order_id_unique` (`provider_order_id`),
  UNIQUE KEY `booking_token_orders_provider_refund_id_unique` (`provider_refund_id`),
  KEY `booking_token_orders_booking_uuid_status_index` (`booking_uuid`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_token_orders`
--

LOCK TABLES `booking_token_orders` WRITE;
/*!40000 ALTER TABLE `booking_token_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_token_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `driver_uuid` char(36) DEFAULT NULL,
  `vehicle_uuid` char(36) DEFAULT NULL,
  `fleet_uuid` char(36) DEFAULT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `booking_type` enum('standard','express','scheduled') NOT NULL DEFAULT 'standard',
  `status` enum('pending','confirmed','in_transit','picked_up','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','partially_paid','paid') NOT NULL DEFAULT 'pending',
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_uuid_unique` (`uuid`),
  UNIQUE KEY `bookings_booking_reference_unique` (`booking_reference`),
  KEY `bookings_customer_uuid_index` (`customer_uuid`),
  KEY `bookings_driver_uuid_index` (`driver_uuid`),
  KEY `bookings_vehicle_uuid_index` (`vehicle_uuid`),
  KEY `bookings_fleet_uuid_index` (`fleet_uuid`),
  KEY `bookings_status_index` (`status`),
  KEY `bookings_payment_status_index` (`payment_status`),
  KEY `bookings_created_at_index` (`created_at`),
  CONSTRAINT `bookings_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `businesses_pan_unique` (`pan`),
  KEY `businesses_uuid_index` (`uuid`),
  KEY `businesses_customer_uuid_index` (`customer_uuid`),
  KEY `businesses_pan_index` (`pan`),
  KEY `businesses_business_type_index` (`business_type`),
  CONSTRAINT `businesses_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cod_payments`
--

DROP TABLE IF EXISTS `cod_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `cod_payments_payment_uuid_foreign` (`payment_uuid`),
  KEY `cod_payments_status_index` (`status`),
  KEY `cod_payments_collection_method_index` (`collection_method`),
  KEY `cod_payments_driver_uuid_index` (`driver_uuid`),
  CONSTRAINT `cod_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cod_payments`
--

LOCK TABLES `cod_payments` WRITE;
/*!40000 ALTER TABLE `cod_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `cod_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `customers_uuid_index` (`uuid`),
  KEY `customers_user_uuid_index` (`user_uuid`),
  KEY `customers_customer_type_index` (`customer_type`),
  KEY `customers_kyc_status_index` (`kyc_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drops`
--

DROP TABLE IF EXISTS `drops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `drops` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `drops_uuid_unique` (`uuid`),
  KEY `drops_booking_uuid_index` (`booking_uuid`),
  KEY `drops_scheduled_at_index` (`scheduled_at`),
  CONSTRAINT `drops_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drops`
--

LOCK TABLES `drops` WRITE;
/*!40000 ALTER TABLE `drops` DISABLE KEYS */;
/*!40000 ALTER TABLE `drops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etas`
--

DROP TABLE IF EXISTS `etas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `etas_booking_uuid_index` (`booking_uuid`),
  KEY `etas_driver_uuid_index` (`driver_uuid`),
  KEY `etas_status_index` (`status`),
  KEY `etas_estimated_drop_time_index` (`estimated_drop_time`),
  KEY `etas_booking_uuid_status_index` (`booking_uuid`,`status`),
  CONSTRAINT `etas_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etas`
--

LOCK TABLES `etas` WRITE;
/*!40000 ALTER TABLE `etas` DISABLE KEYS */;
/*!40000 ALTER TABLE `etas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite_routes`
--

DROP TABLE IF EXISTS `favorite_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `favorite_routes_uuid_index` (`uuid`),
  KEY `favorite_routes_customer_uuid_index` (`customer_uuid`),
  KEY `favorite_routes_is_active_index` (`is_active`),
  KEY `favorite_routes_frequency_index` (`frequency`),
  KEY `favorite_routes_origin_city_destination_city_index` (`origin_city`,`destination_city`),
  CONSTRAINT `favorite_routes_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_routes`
--

LOCK TABLES `favorite_routes` WRITE;
/*!40000 ALTER TABLE `favorite_routes` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorite_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goods`
--

DROP TABLE IF EXISTS `goods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `goods` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `goods_uuid_unique` (`uuid`),
  KEY `goods_booking_uuid_index` (`booking_uuid`),
  KEY `goods_item_type_index` (`item_type`),
  CONSTRAINT `goods_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goods`
--

LOCK TABLES `goods` WRITE;
/*!40000 ALTER TABLE `goods` DISABLE KEYS */;
/*!40000 ALTER TABLE `goods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps_devices`
--

DROP TABLE IF EXISTS `gps_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `gps_devices_device_id_unique` (`device_id`),
  KEY `gps_devices_device_id_index` (`device_id`),
  KEY `gps_devices_vehicle_uuid_index` (`vehicle_uuid`),
  KEY `gps_devices_is_active_index` (`is_active`),
  KEY `gps_devices_status_index` (`status`),
  KEY `gps_devices_last_heartbeat_at_index` (`last_heartbeat_at`),
  KEY `gps_devices_vehicle_uuid_is_active_index` (`vehicle_uuid`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps_devices`
--

LOCK TABLES `gps_devices` WRITE;
/*!40000 ALTER TABLE `gps_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `gps_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gps_locations`
--

DROP TABLE IF EXISTS `gps_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `gps_locations_booking_uuid_index` (`booking_uuid`),
  KEY `gps_locations_driver_uuid_index` (`driver_uuid`),
  KEY `gps_locations_vehicle_uuid_index` (`vehicle_uuid`),
  KEY `gps_locations_gps_device_uuid_index` (`gps_device_uuid`),
  KEY `gps_locations_source_index` (`source`),
  KEY `gps_locations_recorded_at_index` (`recorded_at`),
  KEY `gps_locations_booking_uuid_recorded_at_index` (`booking_uuid`,`recorded_at`),
  KEY `gps_locations_driver_uuid_recorded_at_index` (`driver_uuid`,`recorded_at`),
  KEY `gps_locations_vehicle_uuid_recorded_at_index` (`vehicle_uuid`,`recorded_at`),
  KEY `gps_locations_gps_device_uuid_recorded_at_index` (`gps_device_uuid`,`recorded_at`),
  CONSTRAINT `gps_locations_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gps_locations`
--

LOCK TABLES `gps_locations` WRITE;
/*!40000 ALTER TABLE `gps_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `gps_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gst_configs`
--

DROP TABLE IF EXISTS `gst_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gst_configs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gst_configs_uuid_unique` (`uuid`),
  KEY `gst_configs_uuid_index` (`uuid`),
  KEY `gst_configs_company_uuid_index` (`company_uuid`),
  KEY `gst_configs_gst_number_index` (`gst_number`),
  KEY `gst_configs_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gst_configs`
--

LOCK TABLES `gst_configs` WRITE;
/*!40000 ALTER TABLE `gst_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `gst_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gsts`
--

DROP TABLE IF EXISTS `gsts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `gsts_gst_number_unique` (`gst_number`),
  KEY `gsts_uuid_index` (`uuid`),
  KEY `gsts_customer_uuid_index` (`customer_uuid`),
  KEY `gsts_gst_number_index` (`gst_number`),
  KEY `gsts_registration_type_index` (`registration_type`),
  CONSTRAINT `gsts_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gsts`
--

LOCK TABLES `gsts` WRITE;
/*!40000 ALTER TABLE `gsts` DISABLE KEYS */;
/*!40000 ALTER TABLE `gsts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individuals`
--

DROP TABLE IF EXISTS `individuals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `individuals_pan_unique` (`pan`),
  KEY `individuals_uuid_index` (`uuid`),
  KEY `individuals_customer_uuid_index` (`customer_uuid`),
  KEY `individuals_pan_index` (`pan`),
  KEY `individuals_aadhaar_index` (`aadhaar`),
  CONSTRAINT `individuals_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individuals`
--

LOCK TABLES `individuals` WRITE;
/*!40000 ALTER TABLE `individuals` DISABLE KEYS */;
/*!40000 ALTER TABLE `individuals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `uuid` char(36) NOT NULL,
  `booking_uuid` char(36) NOT NULL,
  `customer_uuid` char(36) NOT NULL,
  `company_uuid` char(36) DEFAULT NULL,
  `invoice_number` varchar(255) NOT NULL,
  `invoice_date` timestamp NOT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'draft' COMMENT 'draft, sent, viewed, partial, paid, overdue, cancelled',
  `notes` text DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `deleted_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_status_index` (`status`),
  KEY `invoices_invoice_number_index` (`invoice_number`),
  KEY `invoices_due_date_index` (`due_date`),
  KEY `invoices_created_at_index` (`created_at`),
  KEY `invoices_booking_uuid_index` (`booking_uuid`),
  KEY `invoices_customer_uuid_index` (`customer_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_entries`
--

DROP TABLE IF EXISTS `ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `ledger_entries_transaction_type_index` (`transaction_type`),
  KEY `ledger_entries_is_reconciled_index` (`is_reconciled`),
  KEY `ledger_entries_created_at_index` (`created_at`),
  KEY `ledger_entries_ledger_uuid_index` (`ledger_uuid`),
  KEY `ledger_entries_payment_uuid_index` (`payment_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_entries`
--

LOCK TABLES `ledger_entries` WRITE;
/*!40000 ALTER TABLE `ledger_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledgers`
--

DROP TABLE IF EXISTS `ledgers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `ledgers_account_code_unique` (`account_code`),
  KEY `ledgers_ledger_type_index` (`ledger_type`),
  KEY `ledgers_status_index` (`status`),
  KEY `ledgers_company_uuid_index` (`company_uuid`),
  KEY `ledgers_customer_uuid_index` (`customer_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledgers`
--

LOCK TABLES `ledgers` WRITE;
/*!40000 ALTER TABLE `ledgers` DISABLE KEYS */;
/*!40000 ALTER TABLE `ledgers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_locations`
--

DROP TABLE IF EXISTS `live_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `live_locations_driver_uuid_unique` (`driver_uuid`),
  KEY `live_locations_booking_uuid_index` (`booking_uuid`),
  KEY `live_locations_driver_uuid_index` (`driver_uuid`),
  KEY `live_locations_is_active_index` (`is_active`),
  CONSTRAINT `live_locations_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_locations`
--

LOCK TABLES `live_locations` WRITE;
/*!40000 ALTER TABLE `live_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `load_applications`
--

DROP TABLE IF EXISTS `load_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `load_applications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `load_applications_load_uuid_applicant_uuid_unique` (`load_uuid`,`applicant_uuid`),
  UNIQUE KEY `load_applications_uuid_unique` (`uuid`),
  UNIQUE KEY `load_applications_application_reference_unique` (`application_reference`),
  KEY `load_applications_load_uuid_status_index` (`load_uuid`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `load_applications`
--

LOCK TABLES `load_applications` WRITE;
/*!40000 ALTER TABLE `load_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `load_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loads`
--

DROP TABLE IF EXISTS `loads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `loads` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `applications_count` int(10) unsigned NOT NULL DEFAULT 0,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `loads_uuid_unique` (`uuid`),
  UNIQUE KEY `loads_load_reference_unique` (`load_reference`),
  KEY `loads_status_pickup_city_drop_city_index` (`status`,`pickup_city`,`drop_city`),
  KEY `loads_vehicle_type_index` (`vehicle_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loads`
--

LOCK TABLES `loads` WRITE;
/*!40000 ALTER TABLE `loads` DISABLE KEYS */;
/*!40000 ALTER TABLE `loads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_bookings`
--

DROP TABLE IF EXISTS `marketplace_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `commission_policy_version` int(10) unsigned DEFAULT NULL,
  `status` enum('awaiting_tokens','confirmed','in_transit','completed','cancelled','disputed') NOT NULL DEFAULT 'awaiting_tokens',
  `workflow` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`workflow`)),
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marketplace_bookings_application_uuid_unique` (`application_uuid`),
  UNIQUE KEY `marketplace_bookings_uuid_unique` (`uuid`),
  UNIQUE KEY `marketplace_bookings_booking_reference_unique` (`booking_reference`),
  KEY `marketplace_bookings_owner_uuid_provider_uuid_index` (`owner_uuid`,`provider_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_bookings`
--

LOCK TABLES `marketplace_bookings` WRITE;
/*!40000 ALTER TABLE `marketplace_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_disputes`
--

DROP TABLE IF EXISTS `marketplace_disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_disputes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marketplace_disputes_uuid_unique` (`uuid`),
  KEY `marketplace_disputes_booking_uuid_status_index` (`booking_uuid`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_disputes`
--

LOCK TABLES `marketplace_disputes` WRITE;
/*!40000 ALTER TABLE `marketplace_disputes` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketplace_settlements`
--

DROP TABLE IF EXISTS `marketplace_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketplace_settlements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marketplace_settlements_uuid_unique` (`uuid`),
  UNIQUE KEY `marketplace_settlements_booking_uuid_unique` (`booking_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketplace_settlements`
--

LOCK TABLES `marketplace_settlements` WRITE;
/*!40000 ALTER TABLE `marketplace_settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketplace_settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2024_01_01_000001_create_payments_table',1),
(5,'2024_01_01_000002_create_wallets_table',1),
(6,'2024_01_01_000003_create_wallet_transactions_table',1),
(7,'2024_01_01_000004_create_upi_payments_table',1),
(8,'2024_01_01_000005_create_online_payments_table',1),
(9,'2024_01_01_000006_create_cod_payments_table',1),
(10,'2024_01_01_000007_create_invoices_table',1),
(11,'2024_01_01_000008_create_ledgers_table',1),
(12,'2024_01_01_000009_create_ledger_entries_table',1),
(13,'2024_12_30_create_gst_configs_table',1),
(14,'2024_12_30_create_receipts_table',1),
(15,'2024_12_31_create_notification_channel_configs_table',1),
(16,'2024_12_31_create_notification_templates_table',1),
(17,'2024_12_31_create_notifications_table',1),
(18,'2026080100_create_customers_table',1),
(19,'2026080101_create_addresses_table',1),
(20,'2026080102_create_businesses_table',1),
(21,'2026080103_create_favorite_routes_table',1),
(22,'2026080104_create_gsts_table',1),
(23,'2026080105_create_individuals_table',1),
(24,'2026080199_create_bookings_table',1),
(25,'2026080200_create_pickups_table',1),
(26,'2026080201_create_drops_table',1),
(27,'2026080202_create_goods_table',1),
(28,'2026080203_create_stopages_table',1),
(29,'2026080204_create_gps_locations_table',1),
(30,'2026080205_create_live_locations_table',1),
(31,'2026080206_create_etas_table',1),
(32,'2026080207_create_route_histories_table',1),
(33,'2026080208_create_tracking_notifications_table',1),
(34,'2026080209_create_gps_devices_table',1),
(35,'2026100601_create_loads_table',1),
(36,'2026100602_create_load_applications_table',1),
(37,'2026100603_create_negotiation_offers_table',1),
(38,'2026100604_create_marketplace_bookings_table',1),
(39,'2026100605_create_booking_token_orders_table',1),
(40,'2026100606_create_payment_webhook_events_table',1),
(41,'2026100607_add_refund_fields_to_booking_token_orders_table',1),
(42,'2026100608_add_commission_snapshot_to_marketplace_bookings_table',1),
(43,'2026100609_create_marketplace_settlements_table',1),
(44,'2026100610_create_marketplace_disputes_table',1),
(45,'2026100611_add_workflow_to_marketplace_bookings_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `negotiation_offers`
--

DROP TABLE IF EXISTS `negotiation_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `negotiation_offers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `negotiation_offers_uuid_unique` (`uuid`),
  KEY `negotiation_offers_application_uuid_created_at_index` (`application_uuid`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `negotiation_offers`
--

LOCK TABLES `negotiation_offers` WRITE;
/*!40000 ALTER TABLE `negotiation_offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `negotiation_offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_channel_configs`
--

DROP TABLE IF EXISTS `notification_channel_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `unique_channel_provider` (`company_uuid`,`channel`,`provider`),
  KEY `notification_channel_configs_company_uuid_index` (`company_uuid`),
  KEY `notification_channel_configs_channel_index` (`channel`),
  KEY `notification_channel_configs_provider_index` (`provider`),
  KEY `notification_channel_configs_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_channel_configs`
--

LOCK TABLES `notification_channel_configs` WRITE;
/*!40000 ALTER TABLE `notification_channel_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_channel_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `unique_template_per_channel` (`company_uuid`,`key`,`channel`),
  KEY `notification_templates_company_uuid_index` (`company_uuid`),
  KEY `notification_templates_key_index` (`key`),
  KEY `notification_templates_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `notifications_channel_status_created_at_index` (`channel`,`status`,`created_at`),
  KEY `notifications_company_uuid_index` (`company_uuid`),
  KEY `notifications_recipient_id_index` (`recipient_id`),
  KEY `notifications_channel_index` (`channel`),
  KEY `notifications_template_key_index` (`template_key`),
  KEY `notifications_status_index` (`status`),
  KEY `notifications_external_id_index` (`external_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `online_payments`
--

DROP TABLE IF EXISTS `online_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `online_payments_gateway_payment_id_unique` (`gateway_payment_id`),
  KEY `online_payments_payment_uuid_foreign` (`payment_uuid`),
  KEY `online_payments_status_index` (`status`),
  KEY `online_payments_gateway_index` (`gateway`),
  CONSTRAINT `online_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `online_payments`
--

LOCK TABLES `online_payments` WRITE;
/*!40000 ALTER TABLE `online_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_webhook_events`
--

DROP TABLE IF EXISTS `payment_webhook_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_webhook_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_key` varchar(128) NOT NULL,
  `provider` varchar(40) NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `payload_hash` varchar(128) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_webhook_events_event_key_unique` (`event_key`),
  KEY `payment_webhook_events_provider_event_type_index` (`provider`,`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_webhook_events`
--

LOCK TABLES `payment_webhook_events` WRITE;
/*!40000 ALTER TABLE `payment_webhook_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_webhook_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_payment_method_index` (`payment_method`),
  KEY `payments_payment_date_index` (`payment_date`),
  KEY `payments_booking_uuid_index` (`booking_uuid`),
  KEY `payments_customer_uuid_index` (`customer_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickups`
--

DROP TABLE IF EXISTS `pickups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickups` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pickups_uuid_unique` (`uuid`),
  KEY `pickups_booking_uuid_index` (`booking_uuid`),
  KEY `pickups_scheduled_at_index` (`scheduled_at`),
  CONSTRAINT `pickups_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickups`
--

LOCK TABLES `pickups` WRITE;
/*!40000 ALTER TABLE `pickups` DISABLE KEYS */;
/*!40000 ALTER TABLE `pickups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipts_uuid_unique` (`uuid`),
  UNIQUE KEY `receipts_receipt_number_unique` (`receipt_number`),
  KEY `receipts_uuid_index` (`uuid`),
  KEY `receipts_receipt_number_index` (`receipt_number`),
  KEY `receipts_invoice_uuid_index` (`invoice_uuid`),
  KEY `receipts_customer_uuid_index` (`customer_uuid`),
  KEY `receipts_status_index` (`status`),
  KEY `receipts_receipt_date_index` (`receipt_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_histories`
--

DROP TABLE IF EXISTS `route_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `route_histories_booking_uuid_route_sequence_unique` (`booking_uuid`,`route_sequence`),
  KEY `route_histories_booking_uuid_index` (`booking_uuid`),
  KEY `route_histories_driver_uuid_index` (`driver_uuid`),
  KEY `route_histories_timestamp_index` (`timestamp`),
  KEY `route_histories_booking_uuid_route_sequence_index` (`booking_uuid`,`route_sequence`),
  KEY `route_histories_driver_uuid_timestamp_index` (`driver_uuid`,`timestamp`),
  CONSTRAINT `route_histories_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_histories`
--

LOCK TABLES `route_histories` WRITE;
/*!40000 ALTER TABLE `route_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stopages`
--

DROP TABLE IF EXISTS `stopages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stopages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stopages_booking_uuid_stop_sequence_unique` (`booking_uuid`,`stop_sequence`),
  UNIQUE KEY `stopages_uuid_unique` (`uuid`),
  KEY `stopages_booking_uuid_index` (`booking_uuid`),
  KEY `stopages_stop_sequence_index` (`stop_sequence`),
  KEY `stopages_scheduled_at_index` (`scheduled_at`),
  CONSTRAINT `stopages_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stopages`
--

LOCK TABLES `stopages` WRITE;
/*!40000 ALTER TABLE `stopages` DISABLE KEYS */;
/*!40000 ALTER TABLE `stopages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracking_notifications`
--

DROP TABLE IF EXISTS `tracking_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `tracking_notifications_booking_uuid_index` (`booking_uuid`),
  KEY `tracking_notifications_driver_uuid_index` (`driver_uuid`),
  KEY `tracking_notifications_customer_uuid_index` (`customer_uuid`),
  KEY `tracking_notifications_notification_type_index` (`notification_type`),
  KEY `tracking_notifications_is_read_index` (`is_read`),
  KEY `tracking_notifications_delivery_status_index` (`delivery_status`),
  KEY `tracking_notifications_driver_uuid_is_read_index` (`driver_uuid`,`is_read`),
  KEY `tracking_notifications_customer_uuid_is_read_index` (`customer_uuid`,`is_read`),
  KEY `tracking_notifications_created_at_index` (`created_at`),
  CONSTRAINT `tracking_notifications_booking_uuid_foreign` FOREIGN KEY (`booking_uuid`) REFERENCES `bookings` (`uuid`) ON DELETE CASCADE,
  CONSTRAINT `tracking_notifications_customer_uuid_foreign` FOREIGN KEY (`customer_uuid`) REFERENCES `customers` (`uuid`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracking_notifications`
--

LOCK TABLES `tracking_notifications` WRITE;
/*!40000 ALTER TABLE `tracking_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `tracking_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upi_payments`
--

DROP TABLE IF EXISTS `upi_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `upi_payments_payment_uuid_foreign` (`payment_uuid`),
  KEY `upi_payments_status_index` (`status`),
  KEY `upi_payments_upi_id_index` (`upi_id`),
  CONSTRAINT `upi_payments_payment_uuid_foreign` FOREIGN KEY (`payment_uuid`) REFERENCES `payments` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upi_payments`
--

LOCK TABLES `upi_payments` WRITE;
/*!40000 ALTER TABLE `upi_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `upi_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transactions`
--

DROP TABLE IF EXISTS `wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `wallet_transactions_wallet_uuid_foreign` (`wallet_uuid`),
  KEY `wallet_transactions_transaction_type_index` (`transaction_type`),
  KEY `wallet_transactions_status_index` (`status`),
  KEY `wallet_transactions_reference_type_reference_uuid_index` (`reference_type`,`reference_uuid`),
  KEY `wallet_transactions_created_at_index` (`created_at`),
  CONSTRAINT `wallet_transactions_wallet_uuid_foreign` FOREIGN KEY (`wallet_uuid`) REFERENCES `wallets` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transactions`
--

LOCK TABLES `wallet_transactions` WRITE;
/*!40000 ALTER TABLE `wallet_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `wallets_customer_uuid_unique` (`customer_uuid`),
  KEY `wallets_status_index` (`status`),
  KEY `wallets_balance_index` (`balance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 13:30:17
