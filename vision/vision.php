<?php
/**
 * Plugin Name: Vision - Interactive Image Map Builder
 * Plugin URI: https://1.envato.market/getvision
 * Description: Vision is a lightweight and rich-feature plugin helps you create great interactive image maps.
 * Version: 1.9.0
 * Requires at least: 4.6
 * Requires PHP: 7.4
 * Author: Avirtum
 * Author URI: https://1.envato.market/avirtum
 * License: GPLv3
 * Text Domain: vision
 * Domain Path: /languages
 */
defined('ABSPATH') || exit;

define('VISION_PLUGIN_NAME', 'vision');
define('VISION_PLUGIN_VERSION', '1.9.0');
define('VISION_DB_VERSION', '1.1.0');
define('VISION_SHORTCODE_NAME', 'vision');
define('VISION_PLUGIN_BASE_NAME', plugin_basename(__FILE__));
define('VISION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VISION_PLUGIN_REST_URL', 'vision/v1' );
define('VISION_PLUGIN_PUBLIC_REST_URL', 'vision/public/v1' );
define('VISION_FEEDBACK_URL', 'https://avirtum.com/api/feedback/');
define('VISION_REST_URL', 'vision/v1');

/**
 * The code that runs during plugin activation
 */
function vision_activate() {
	require_once(plugin_dir_path( __FILE__ ) . 'includes/activator.php');
	$activator = new Vision_Activator();
	$activator->activate();
}
register_activation_hook( __FILE__, 'vision_activate' );

/**
 * The code that runs during plugin deactivation
 */
function vision_deactivate() {
	require_once(plugin_dir_path( __FILE__ ) . 'includes/deactivator.php');
	$deactivator = new Vision_Deactivator();
	$deactivator->deactivate();
}
register_deactivation_hook( __FILE__, 'vision_deactivate' );

/**
 * The code that runs after plugins loaded
 */
function vision_check_db() {
	require_once(plugin_dir_path( __FILE__ ) . 'includes/activator.php');
	
	$activator = new Vision_Activator();
	$activator->check_db();
}
add_action('plugins_loaded', 'vision_check_db');

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 */
function vision_run() {
    require_once(plugin_dir_path( __FILE__ ) . 'includes/plugin.php');
	$pluginBasename = plugin_basename(__FILE__);

	$plugin = new Vision_Builder($pluginBasename);
	$plugin->run();
}
add_action('init', 'vision_run');