<?php
defined('ABSPATH') || exit;

$list_table = new Vision_List_Table_Items();
$list_table->prepare_items();
?>
<!-- vision app -->
<div class="vision-root" id="vision-app-items">
	<div class="vision-page-header">
        <div class="vision-title">
            <i class="icon icon-scan-eye"></i>
            <span>Vision<sup><?php echo esc_attr(VISION_PLUGIN_PLAN); ?></sup></span>
            <span> - </span>
            <span><?php esc_html_e('All Items', 'vision'); ?></span>
        </div>
		<div class="vision-actions">
			<a class="vision-button vision-blue" href="?page=vision_item" title="<?php esc_html_e('Create a new item', 'vision'); ?>"><?php esc_html_e('Add Item', 'vision'); ?></a>
		</div>
	</div>
	<div class="vision-app">
		<?php $list_table->views(); ?>
		<form method="post">
			<?php $list_table->search_box(esc_html__('Search Items', 'vision'),'item'); ?>
			<input type="hidden" name="page" value="<?php
                // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotValidated
                echo sanitize_key( filter_var( wp_unslash( $_REQUEST['page'] ), FILTER_DEFAULT ) ) ?>
            ">
			<?php $list_table->display() ?>
		</form>
	</div>
</div>
<!-- /end vision app -->