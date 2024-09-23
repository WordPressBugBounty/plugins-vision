<?php
defined('ABSPATH') || exit;
?>
<div id="vision-modal-{{modalData.id}}" class="vision-modal" tabindex="-1">
	<div class="vision-modal-dialog">
		<div class="vision-modal-header">
			<div class="vision-modal-close" al-on.click="modalData.deferred.resolve('close');">&times;</div>
			<div class="vision-modal-title"><i class="icon icon-info"></i><?php esc_html_e('Confirm Dialog', 'vision'); ?></div>
		</div>
		<div class="vision-modal-data">
			<h4>{{modalData.text}}</h4>
		</div>
		<div class="vision-modal-footer">
			<div class="vision-modal-btn vision-modal-btn-close" al-on.click="modalData.deferred.resolve('close');"><?php esc_html_e('Close', 'vision'); ?></div>
			<div class="vision-modal-btn vision-modal-btn-create" al-on.click="modalData.deferred.resolve(true);"><?php esc_html_e('OK', 'vision'); ?></div>
		</div>
	</div>
</div>