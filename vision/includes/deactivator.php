<?php
defined('ABSPATH') || exit;

if(!class_exists('Vision_Deactivator')) :

class Vision_Deactivator {
	public function deactivate() {
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = "SELECT COUNT(*) FROM {$table}";
		$count = $wpdb->get_var($sql);
        // phpcs:enable
		
		if($count > 0) {
			return;
		}
		
		// delete all if our tables are empty
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = "DROP TABLE IF EXISTS {$table}";
		$wpdb->query($sql);
        // phpcs:enable
		
		delete_option('vision_db_version');
		delete_option('vision_activated');
		delete_option('vision_settings');
		
		$this->delete_files(VISION_PLUGIN_UPLOAD_DIR . '/');
	}
	
	private function delete_files($target) {
		if(is_dir($target)) {
			$files = glob($target . '*', GLOB_MARK); //GLOB_MARK adds a slash to directories returned
			foreach($files as $file) {
				$this->delete_files($file);
			}
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
			rmdir($target);
		} else if(is_file($target)) {
            wp_delete_file($target);
		}
	}
}

endif;