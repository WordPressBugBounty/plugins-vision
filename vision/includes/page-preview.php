<?php
defined('ABSPATH') || exit;

$plugin_url = plugin_dir_url(dirname(__FILE__));
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <?php
    wp_enqueue_style('vision-lucide', $plugin_url . 'assets/vendor/lucide/lucide.css', [], VISION_PLUGIN_VERSION, 'all' );
    wp_enqueue_style('vision-preview', $plugin_url . 'assets/css/preview.css', [], VISION_PLUGIN_VERSION);
    wp_enqueue_script('vision-preview', $plugin_url . 'assets/js/preview.js', ['jquery'], VISION_PLUGIN_VERSION, false);
    wp_enqueue_script('vision-loader', $plugin_url . 'assets/js/loader.js', ['jquery'], VISION_PLUGIN_VERSION, false);
    wp_localize_script('vision-loader', 'vision_globals', $this->getLoaderGlobals($this->vision_map_version));
    wp_head();
    ?>
</head>
<body>
<div class="vision-preview-wrap">
	<div class="vision-preview-header">
        <div class="vision-preview-btn" data-device="image" title="original image size"><i class="icon icon-image"></i></div>
		<div class="vision-preview-btn" data-device="desktop" title="desktop"><i class="icon icon-monitor"></i></div>
		<div class="vision-preview-btn" data-device="tablet" title="tablet"><i class="icon icon-tablet"></i></div>
		<div class="vision-preview-btn" data-device="mobile" title="mobile"><i class="icon icon-monitor-smartphone"></i></div>
	</div>
	<div class="vision-preview-workspace">
		<div id="vision-preview-canvas" class="vision-preview-canvas">
			<?php
                // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                echo $this->shortcode(['id' => $this->vision_map_id]);
            ?>
		</div>
	</div>
</div>
</body>
</html>