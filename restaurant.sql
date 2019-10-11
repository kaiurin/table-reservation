SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for reservation
-- ----------------------------
DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_id` int(11) NOT NULL,
  `reservation_start` int(11) NOT NULL,
  `reservation_end` int(11) NOT NULL,
  `guest_count` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `table_id`(`table_id`) USING BTREE,
  CONSTRAINT `table_id` FOREIGN KEY (`table_id`) REFERENCES `table` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for table
-- ----------------------------
DROP TABLE IF EXISTS `table`;
CREATE TABLE `table`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `capacity` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of table
-- ----------------------------
INSERT INTO `table` VALUES (1, 1, 2);
INSERT INTO `table` VALUES (2, 2, 2);
INSERT INTO `table` VALUES (3, 3, 4);
INSERT INTO `table` VALUES (4, 4, 4);
INSERT INTO `table` VALUES (5, 5, 4);
INSERT INTO `table` VALUES (6, 6, 4);
INSERT INTO `table` VALUES (7, 7, 6);
INSERT INTO `table` VALUES (8, 8, 6);
INSERT INTO `table` VALUES (9, 9, 8);
INSERT INTO `table` VALUES (10, 10, 16);

SET FOREIGN_KEY_CHECKS = 1;
