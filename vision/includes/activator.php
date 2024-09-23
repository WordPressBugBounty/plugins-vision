<?php
defined('ABSPATH') || exit;

if(!class_exists('Vision_Activator')) :

class Vision_Activator {
	public function activate() {
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        global $wpdb;
        $charsetCollate = $wpdb->has_cap( 'collation' ) ? $wpdb->get_charset_collate() : '';

		$table = $wpdb->prefix . VISION_PLUGIN_NAME;
		$sql = "CREATE TABLE {$table} (
			id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			title text DEFAULT NULL,
			slug varchar(200) DEFAULT NULL,
			active tinyint NOT NULL DEFAULT 1,
			data longtext DEFAULT NULL,
			config longtext DEFAULT NULL,
			author bigint(20) UNSIGNED NOT NULL DEFAULT 0,
			editor bigint(20) UNSIGNED NOT NULL DEFAULT 0,
			deleted tinyint NOT NULL DEFAULT 0,
			created datetime NOT NULL,
			modified datetime NOT NULL,
			UNIQUE KEY id (id)
		) {$charsetCollate};";
		dbDelta($sql);

		update_option('vision_db_version', VISION_DB_VERSION, false);
		
		$this->update_data();
		if(get_option('vision_activated') == false ) {
			$this->install_data();
		}
		update_option('vision_activated', time(), false);
	}
	
	public function update_data() {
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;

		// Add the new column 'deleted'
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_results($wpdb->prepare("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=%s AND column_name='deleted'", $table));
		if(empty($row)) {
            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$sql = "ALTER TABLE {$table} ADD deleted tinyint NOT NULL DEFAULT 0";
			$wpdb->query($sql);
            // phpcs:enable
		}
	}
	
	public function install_data() {
	}
	
	public function check_db() {
		if(get_option('vision_db_version') != VISION_DB_VERSION ) {
			$this->activate();
		}
	}
}

endif;