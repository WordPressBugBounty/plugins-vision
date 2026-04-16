<?php
defined('ABSPATH') || exit;

$vision_reasons = [
    "no_longer_needed" => [
        "label" => esc_html__("I do not need this plugin anymore", 'vision')
    ],
    "found_better" => [
        "label" => esc_html__("I found another plugin that do the job better", 'vision'),
        "input" => esc_html__("Please tell us which one", 'vision')
    ],
    "how_to_use" => [
        "label" => esc_html__("I don't know how to use it", 'vision')
    ],
    "temporary" => [
        "label" => esc_html__("This's temporary deactivation", 'vision')
    ],
    "not_working" => [
        "label" => esc_html__("It's not working on my website", 'vision')
    ],
    "other" => [
        "label" => esc_html__("Other", 'vision'),
        "input" => esc_html__("Please share a reason...", 'vision')
    ]
];
?>
<div id="vision-feedback" class="vision-feedback-wrap" style="display:none;">
    <div class="vision-feedback">
        <div class="vision-header">
            <h2 class="vision-title"><?php esc_html_e("Quick Feedback", 'vision'); ?></h2>
            <div class="vision-close"></div>
        </div>
        <div class="vision-data">
            <p class="vision-description"><?php esc_html_e("Before you deactivate Vision could you let us know why? Your feedback will help us improve the product, please tell us why did you decide to deactivate Vision. Thank you!", 'vision'); ?></p>
            <div class="vision-fields">
            <?php foreach($vision_reasons as $vision_key => $vision_value) { ?>
                <div class="vision-field">
                    <label><input type="radio" name="vision-reason" <?php if ( $vision_key === "temporary" ) echo 'checked'; ?> value="<?php echo esc_attr($vision_key); ?>"><?php echo esc_attr($vision_value["label"]); ?></label>
                    <?php if(isset($vision_value["input"])) { ?>
                        <input type="text" name="reason-<?php echo esc_attr($vision_key); ?>" placeholder="<?php echo esc_attr($vision_value["input"]); ?>">
                    <?php } ?>
                    <?php if(isset($vision_value["text"])) { ?>
                        <p><?php echo esc_html($vision_value["text"]); ?></p>
                    <?php } ?>
                </div>
            <?php } ?>
            </div>
        </div>
        <div class="vision-footer">
            <div class="vision-btn vision-submit"><?php esc_html_e("Submit & Deactivate", 'vision'); ?></div>
            <div class="vision-btn vision-skip"><?php esc_html_e("Skip & Deactivate", 'vision'); ?></div>
        </div>
    </div>
</div>

