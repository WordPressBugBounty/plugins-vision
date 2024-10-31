<?php
defined('ABSPATH') || exit;

$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
?>
<!-- /begin vision app -->
<div class="vision-root" id="vision-app-item" style="display:none;">
	<input id="vision-load-config-from-file" type="file" style="display:none;" />
	<div class="vision-page-header">
        <div class="vision-title">
            <i class="icon icon-scan-eye"></i>
            <span>Vision<sup><?php echo esc_attr(VISION_PLUGIN_PLAN); ?></sup></span>
            <span> - </span>
            <span><?php esc_html_e('Item', 'vision'); ?></span>
        </div>
        <div class="vision-menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <div class="vision-actions">
                <a href="#" al-on.click="appData.fn.saveConfigToFile(appData)" title="<?php esc_html_e('Save config to a JSON file', 'vision'); ?>"><?php esc_html_e('Save Config As...', 'vision'); ?></a>
                <a href="#" al-on.click="appData.fn.loadConfigFromFile(appData)" title="<?php esc_html_e('Load config from a JSON file', 'vision'); ?>"><?php esc_html_e('Load Config As...', 'vision'); ?></a>
            </div>
        </div>
	</div>
	<div class="vision-messages" id="vision-messages">
	</div>
	<div class="vision-app" id="vision-app">
		<div class="vision-loader-wrap">
			<div class="vision-loader">
				<div class="vision-loader-bar"></div>
				<div class="vision-loader-bar"></div>
				<div class="vision-loader-bar"></div>
				<div class="vision-loader-bar"></div>
			</div>
		</div>
		<div class="vision-wrap">
			<div class="vision-main-header">
				<input class="vision-title" type="text" al-text="appData.config.title" placeholder="<?php esc_html_e('Title', 'vision'); ?>">
			</div>
			<div class="vision-workplace">
				<div class="vision-main-menu">
					<div class="vision-left-panel">
						<div class="vision-list">
							<a class="vision-item vision-small vision-lite" href="https://1.envato.market/getvision" target="_blank" al-if="appData.plan=='lite'"><?php esc_html_e('Buy pro version', 'vision'); ?></a>
						</div>
					</div>
					<div class="vision-right-panel">
						<div class="vision-list">
							<div class="vision-item vision-green" al-on.click="appData.fn.preview(appData);" title="<?php esc_html_e('The item should be saved before preview', 'vision'); ?>" al-if="appData.wp_item_id != null"><?php esc_html_e('Preview', 'vision'); ?></div>
							<div class="vision-item vision-blue" al-on.click="appData.fn.saveConfig(appData);" title="<?php esc_html_e('Save config to database', 'vision'); ?>"><?php esc_html_e('Save', 'vision'); ?></div>
						</div>
					</div>
				</div>
				<div class="vision-main-tabs vision-clear-fix">
					<div class="vision-tab" al-attr.class.vision-active="appData.ui.tabs.builder" al-on.click="appData.fn.onTab(appData, 'builder')"><?php esc_html_e('Builder', 'vision'); ?></div>
					<div class="vision-tab" al-attr.class.vision-active="appData.ui.tabs.customCSS" al-on.click="appData.fn.onTab(appData, 'customCSS')"><?php esc_html_e('Custom CSS', 'vision'); ?><div class="vision-status" al-if="appData.config.customCSS.active"></div></div>
					<div class="vision-tab" al-attr.class.vision-active="appData.ui.tabs.customJS" al-on.click="appData.fn.onTab(appData, 'customJS')"><?php esc_html_e('Custom JS', 'vision'); ?><div class="vision-status" al-if="appData.config.customJS.active"></div></div>
					<div class="vision-tab" al-attr.class.vision-active="appData.ui.tabs.shortcode" al-on.click="appData.fn.onTab(appData, 'shortcode')" al-if="appData.wp_item_id"><?php esc_html_e('Shortcode', 'vision'); ?></div>
				</div>
				<div class="vision-main-data">
                    <div class="vision-section" al-attr.class.vision-active="appData.ui.tabs.builder">
                        <div class="vision-stage">
                            <div class="vision-builder">
                                <div class="vision-left-sidebar-panel" al-attr.class.vision-hidden="!appData.ui.builder.leftSidebar" al-style.width="appData.ui.builder.leftSidebarWidth">
                                    <div class="vision-sidebar-resizer" al-on.mousedown="appData.fn.onSidebarResizeStart(appData, $event, 'left')">
                                        <div class="vision-sidebar-hide" al-on.click="appData.fn.toggleSidebarPanel(appData, 'left')">
                                            <i class="icon icon-chevron-left" al-if="appData.ui.builder.leftSidebar"></i>
                                            <i class="icon icon-chevron-right" al-if="!appData.ui.builder.leftSidebar"></i>
                                        </div>
                                    </div>
                                    <div class="vision-tabs">
                                        <div class="vision-tab" al-attr.class.vision-active="appData.ui.leftSidebarTabs.general" al-on.click="appData.fn.onLeftSidebarTab(appData, 'general')"><?php esc_html_e('General', 'vision'); ?></div>
                                        <div class="vision-tab" al-attr.class.vision-active="appData.ui.leftSidebarTabs.layers" al-on.click="appData.fn.onLeftSidebarTab(appData, 'layers')"><?php esc_html_e('Layers', 'vision'); ?></div>
                                    </div>
                                    <div class="vision-data" al-attr.class.vision-active="appData.ui.leftSidebarTabs.general">
                                        <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.generalTab.main">
                                            <div class="vision-block-header" al-on.click="appData.fn.onGeneralTab(appData,'main')">
                                                <div class="vision-block-title"><?php esc_html_e('Settings', 'vision'); ?></div>
                                                <div class="vision-block-state"></div>
                                            </div>
                                            <div class="vision-block-data">
                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Enable/disable item', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Enable item', 'vision'); ?></div>
                                                    <div al-toggle="appData.config.active"></div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets a map image (jpeg or png format)', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Map image', 'vision'); ?></div>
                                                    <div class="vision-input-group">
                                                        <div class="vision-input-group-cell">
                                                            <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.config.image.url" placeholder="<?php esc_html_e('Select an image', 'vision'); ?>">
                                                        </div>
                                                        <div class="vision-input-group-cell vision-pinch">
                                                            <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectImage(appData, appData.rootScope, appData.config.image)" title="<?php esc_html_e('Select an image', 'vision'); ?>"><span><i class="icon icon-folder"></i></span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Specifies a theme of elements', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Theme', 'vision'); ?></div>
                                                    <select class="vision-select vision-capitalize" al-select="appData.config.theme">
                                                        <option al-option="null"><?php esc_html_e('none', 'vision'); ?></option>
                                                        <option al-repeat="theme in appData.themes" al-option="theme.id">{{theme.title}}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.generalTab.container">
                                            <div class="vision-block-header" al-on.click="appData.fn.onGeneralTab(appData,'container')">
                                                <div class="vision-block-title"><?php esc_html_e('Container', 'vision'); ?></div>
                                                <div class="vision-block-state"></div>
                                            </div>
                                            <div class="vision-block-data">
                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('The container width will be auto calculated', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Auto width', 'vision'); ?></div>
                                                    <div al-toggle="appData.config.autoWidth"></div>
                                                </div>

                                                <div class="vision-control" al-if="!appData.config.autoWidth">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets the container width, can be any valid CSS units, not just pixels', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Custom width', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.containerWidth" placeholder="<?php esc_html_e('Default: auto', 'vision'); ?>">
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('The container height will be auto calculated', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Auto height', 'vision'); ?></div>
                                                    <div al-toggle="appData.config.autoHeight"></div>
                                                </div>

                                                <div class="vision-control" al-if="!appData.config.autoHeight">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets the container height, can be any valid CSS units, not just pixels', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Custom height', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.containerHeight" placeholder="<?php esc_html_e('Default: auto', 'vision'); ?>">
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Background color in hexadecimal format (#fff or #555555)', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Background color', 'vision'); ?></div>
                                                    <div class="vision-color" al-color="appData.config.background.color"></div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets a background image (jpeg or png format)', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Background image', 'vision'); ?></div>
                                                    <div class="vision-input-group">
                                                        <div class="vision-input-group-cell">
                                                            <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.config.background.image.url" placeholder="<?php esc_html_e('Select an image', 'vision'); ?>">
                                                        </div>
                                                        <div class="vision-input-group-cell vision-pinch">
                                                            <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectImage(appData, appData.rootScope, appData.config.background.image)" title="<?php esc_html_e('Select a background image', 'vision'); ?>"><span><i class="icon icon-folder"></i></span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Specifies a size of the background image', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Background size', 'vision'); ?></div>
                                                    <div class="vision-select" al-backgroundsize="appData.config.background.size"></div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('How the background image will be repeated', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Background repeat', 'vision'); ?></div>
                                                    <div class="vision-select" al-backgroundrepeat="appData.config.background.repeat"></div>
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets a starting position of the background image', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Background position', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.background.position" placeholder="<?php esc_html_e('Example: 50% 50%', 'vision'); ?>">
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets additional css classes to the container', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Extra CSS classes', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.class">
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets ID to the container', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Container ID', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.containerId">
                                                </div>

                                                <div class="vision-control">
                                                    <div class="vision-helper" title="<?php esc_html_e('Sets the slug for the vision item', 'vision'); ?>"></div>
                                                    <div class="vision-label"><?php esc_html_e('Slug', 'vision'); ?></div>
                                                    <input class="vision-text" type="text" al-text="appData.config.slug" data-regex="^([a-z0-9_-]+)$">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="vision-data" al-attr.class.vision-active="appData.ui.leftSidebarTabs.layers">
                                        <div al-if="appData.config.image.url == null">
                                            <div class="vision-info"><?php esc_html_e('Please set a map image to access settings', 'vision'); ?></div>
                                        </div>
                                        <div class="vision-layers-wrap" al-if="appData.config.image.url != null">
                                            <div class="vision-layers-toolbar">
                                                <div class="vision-left-panel" al-attr.class.vision-hidden="appData.ui.activeLayer == null">
                                                    <i class="icon icon-copy" al-on.click="appData.fn.copyLayer(appData)" title="<?php esc_html_e('copy', 'vision'); ?>"></i>
                                                    <i class="icon icon-arrow-up-from-line" al-on.click="appData.fn.updownLayer(appData, 'down')" title="<?php esc_html_e('move up', 'vision'); ?>"></i>
                                                    <i class="icon icon-arrow-down-from-line" al-on.click="appData.fn.updownLayer(appData, 'up')" title="<?php esc_html_e('move down', 'vision'); ?>"></i>
                                                </div>
                                                <div class="vision-right-panel" al-attr.class.vision-hidden="appData.ui.activeLayer == null">
                                                    <i class="icon icon-trash-2 icon-color-red" al-on.click="appData.fn.deleteLayer(appData)" title="<?php esc_html_e('delete', 'vision'); ?>"></i>
                                                </div>
                                            </div>
                                            <div class="vision-layers-list">
                                                <div class="vision-layer"
                                                     al-attr.class.vision-active="appData.fn.isLayerActive(appData, layer)"
                                                     al-on.click="appData.fn.onLayerItemClick(appData, layer)"
                                                     al-repeat="layer in appData.fn.reverse(appData, appData.config.layers)"
                                                >
                                                    <i class="icon icon-link" al-if="layer.type == 'link'"></i>
                                                    <i class="icon icon-type" al-if="layer.type == 'text'"></i>
                                                    <i class="icon icon-image" al-if="layer.type == 'image'"></i>
                                                    <i class="icon icon-spline" al-if="layer.type == 'svg'"></i>
                                                    <div class="vision-label">{{layer.title ? layer.title : layer.type}}</div>
                                                    <div class="vision-actions">
                                                        <i class="icon icon-message-square-text" al-attr.class.vision-inactive="!layer.tooltip.active" al-on.click="appData.fn.toggleLayerTooltip(appData, layer)" title="<?php esc_html_e('enable/disable tooltip', 'vision'); ?>"></i>
                                                        <i class="icon icon-notepad-text" al-attr.class.vision-inactive="!layer.popover.active" al-on.click="appData.fn.toggleLayerPopover(appData, layer)" title="<?php esc_html_e('enable/disable popover', 'vision'); ?>"></i>
                                                        <i class="icon" al-attr.class.icon-eye="layer.visible" al-attr.class.icon-eye-off="!layer.visible" al-on.click="appData.fn.toggleLayerVisible(appData, layer)" title="<?php esc_html_e('show/hide', 'vision'); ?>"></i>
                                                        <i class="icon" al-attr.class.icon-lock-open="!layer.lock" al-attr.class.icon-lock="layer.lock" al-on.click="appData.fn.toggleLayerLock(appData, layer)" title="<?php esc_html_e('lock/unlock', 'vision'); ?>"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div class="vision-main-panel vision-center">
                                    <div al-attr.class.vision-hidden="appData.config.image.url != null">
                                        <div class="vision-info"><?php esc_html_e('Please set a map image if you want to create layers on it', 'vision'); ?></div>
                                    </div>
                                    <div al-attr.class.vision-hidden="appData.config.image.url == null">
                                        <div class="vision-edit-layers">
                                            <div class="vision-layers-toolbar-top">
                                                <div class="vision-layers-toolbar" al-attr.class.vision-hidden="appData.ui.activeLayer == null">
                                                    <i class="icon icon-chevron-left" al-on.click="appData.fn.prevLayer(appData)" title="<?php esc_html_e('Prev layer', 'vision'); ?>"></i>
                                                    <i class="icon icon-chevron-right" al-on.click="appData.fn.nextLayer(appData)" title="<?php esc_html_e('Next layer', 'vision'); ?>"></i>
                                                </div>
                                                <div class="vision-layers-toolbar">
                                                    <i class="icon icon-link" al-attr.class.vision-active="appData.tools.activeTool == 'link'" al-on.click="appData.fn.addLayerLink(appData)" title="<?php esc_html_e('add link', 'vision'); ?>"></i>
                                                    <i class="icon icon-type" al-attr.class.vision-active="appData.tools.activeTool == 'text'" al-on.click="appData.fn.addLayerText(appData)" title="<?php esc_html_e('add text', 'vision'); ?>"></i>
                                                    <i class="icon icon-image" al-attr.class.vision-active="appData.tools.activeTool == 'image'" al-on.click="appData.fn.addLayerImage(appData)" title="<?php esc_html_e('add image', 'vision'); ?>"></i>
                                                </div>
                                                <div class="vision-layers-toolbar" al-attr.class.vision-hidden="appData.ui.activeLayer == null">
                                                    <i class="icon icon-copy" al-on.click="appData.fn.copyLayer(appData)" title="<?php esc_html_e('copy', 'vision'); ?>"></i>
                                                    <i class="icon icon-arrow-up-from-line" al-on.click="appData.fn.updownLayer(appData, 'down')" title="<?php esc_html_e('move up', 'vision'); ?>"></i>
                                                    <i class="icon icon-arrow-down-from-line" al-on.click="appData.fn.updownLayer(appData, 'up')" title="<?php esc_html_e('move down', 'vision'); ?>"></i>
                                                </div>
                                            </div>
                                            <div class="vision-layers-toolbar-bottom">
                                                <div class="vision-layers-toolbar">
                                                    <div class="vision-icon" al-on.click="appData.fn.canvasZoomIn(appData)" title="<?php esc_html_e('Zoom in', 'vision'); ?>">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                            <circle cx="11" cy="11" r="8"/>
                                                            <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                                                            <line x1="11" x2="11" y1="8" y2="14"/>
                                                            <line x1="8" x2="14" y1="11" y2="11"/>
                                                        </svg>
                                                    </div>
                                                    <span class="vision-zoom-value">{{appData.fn.getCanvasZoomForLabel(appData)}}%</span>
                                                    <div class="vision-icon" al-on.click="appData.fn.canvasZoomOut(appData)" title="<?php esc_html_e('Zoom out', 'vision'); ?>">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                            <circle cx="11" cy="11" r="8"/>
                                                            <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                                                            <line x1="8" x2="14" y1="11" y2="11"/>
                                                        </svg>
                                                    </div>
                                                    <div class="vision-icon" al-on.click="appData.fn.canvasZoomFit(appData)" title="<?php esc_html_e('Zoom fit', 'vision'); ?>">
                                                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                                                            <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                                                            <path d="m3 16v3a2 2 0 0 0 2 2h3"/>
                                                            <path d="m16 21h3a2 2 0 0 0 2-2v-3"/>
                                                            <rect x="6" y="6" width="12" height="12" ry="2" fill="currentColor" stroke="none" />
                                                        </svg>
                                                    </div>
                                                    <div class="vision-icon" al-on.click="appData.fn.canvasZoomDefault(appData)" title="<?php esc_html_e('Zoom default', 'vision'); ?>">
                                                        <svg class="lucide lucide-expand" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/>
                                                            <path d="m3 16.2v4.8h4.8m-4.8 0 6-6"/>
                                                            <path d="m21 7.8v-4.8h-4.8m4.8 0-6 6"/>
                                                            <path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>
                                                        </svg>
                                                    </div>
                                                    <div class="vision-icon" al-on.click="appData.fn.canvasMoveDefault(appData)" title="<?php esc_html_e('Move default', 'vision'); ?>">
                                                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="m12 9v-7m0 7-3.4041-3.3841m3.4041 3.3841 3.3841-3.4041"/>
                                                            <path d="m18.399 15.384-3.4041-3.3841 3.3841-3.4041m-3.3841 3.4041h7.0051"/>
                                                            <path d="m5.5959 8.6159 3.4041 3.3841-3.3841 3.4041m3.3841-3.4041h-7"/>
                                                            <path d="m15.404 18.384-3.4041-3.3841-3.3841 3.4041m3.3841-3.4041v7"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="vision-layers-canvas-wrap" class="vision-layers-canvas-wrap" al-on.mousedown="appData.fn.onMoveCanvasStart(appData, $event)">
                                                <div id="vision-layers-canvas" class="vision-layers-canvas">
                                                    <div id="vision-layers-image" class="vision-layers-image"></div>
                                                    <div class="vision-layers-stage">
                                                        <div class="vision-layer"
                                                             tabindex="1"
                                                             al-on.click="appData.fn.onLayerClick(appData, layer)"
                                                             al-on.keydown="appData.fn.onLayerKeyDown(appData, layer, $event, $element)"
                                                             al-attr.class.vision-active="appData.fn.isLayerActive(appData, layer)"
                                                             al-attr.class.vision-hidden="!layer.visible"
                                                             al-attr.class.vision-lock="layer.lock"
                                                             al-attr.class.vision-layer-link="layer.type == 'link'"
                                                             al-attr.class.vision-layer-text="layer.type == 'text'"
                                                             al-attr.class.vision-layer-image="layer.type == 'image'"
                                                             al-attr.class.vision-layer-svg="layer.type == 'svg'"
                                                             al-style.top="appData.fn.getLayerStyle(appData, layer, 'y')"
                                                             al-style.left="appData.fn.getLayerStyle(appData, layer, 'x')"
                                                             al-style.width="appData.fn.getLayerStyle(appData, layer, 'width')"
                                                             al-style.height="appData.fn.getLayerStyle(appData, layer, 'height')"
                                                             al-style.transform="appData.fn.getLayerStyle(appData, layer, 'angle')"
                                                             al-repeat="layer in appData.config.layers"
                                                             al-init="appData.fn.initLayer(appData, layer, $element)"
                                                        >
                                                            <div class="vision-layer-inner"
                                                                 spellcheck="false"
                                                                 al-style.border-radius="appData.fn.getLayerStyle(appData, layer, 'border-radius')"
                                                                 al-style.background-color="appData.fn.getLayerStyle(appData, layer, 'background-color')"
                                                                 al-style.background-image="appData.fn.getLayerStyle(appData, layer, 'background-image')"
                                                                 al-style.background-size="appData.fn.getLayerStyle(appData, layer, 'background-size')"
                                                                 al-style.background-repeat="appData.fn.getLayerStyle(appData, layer, 'background-repeat')"
                                                                 al-style.background-position="appData.fn.getLayerStyle(appData, layer, 'background-position')"
                                                                 al-style.color="appData.fn.getLayerStyle(appData, layer, 'color')"
                                                                 al-style.font-family="appData.fn.getLayerStyle(appData, layer, 'font-family')"
                                                                 al-style.font-size="appData.fn.getLayerStyle(appData, layer, 'font-size')"
                                                                 al-style.line-height="appData.fn.getLayerStyle(appData, layer, 'line-height')"
                                                                 al-style.text-align="appData.fn.getLayerStyle(appData, layer, 'text-align')"
                                                                 al-style.letter-spacing="appData.fn.getLayerStyle(appData, layer, 'letter-spacing')"
                                                                 al-init="appData.fn.initLayerInner(appData, layer, $element)"
                                                            >
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="vision-right-sidebar-panel" al-attr.class.vision-hidden="!appData.ui.builder.rightSidebar" al-style.width="appData.ui.builder.rightSidebarWidth">
                                    <div class="vision-sidebar-resizer" al-on.mousedown="appData.fn.onSidebarResizeStart(appData, $event, 'right')">
                                        <div class="vision-sidebar-hide" al-on.click="appData.fn.toggleSidebarPanel(appData, 'right')">
                                            <i class="icon icon-chevron-right" al-if="appData.ui.builder.rightSidebar"></i>
                                            <i class="icon icon-chevron-left" al-if="!appData.ui.builder.rightSidebar"></i>
                                        </div>
                                    </div>
                                    <div class="vision-tabs">
                                        <div class="vision-tab" al-attr.class.vision-active="appData.ui.rightSidebarTabs.layer" al-on.click="appData.fn.onRightSidebarTab(appData, 'layer')"><?php esc_html_e('Layer', 'vision'); ?></div>
                                        <div class="vision-tab" al-attr.class.vision-active="appData.ui.rightSidebarTabs.tooltip" al-on.click="appData.fn.onRightSidebarTab(appData, 'tooltip')"><?php esc_html_e('Tooltip', 'vision'); ?><div class="vision-status" al-if="appData.ui.activeLayer != null && appData.ui.activeLayer.tooltip.active"></div></div>
                                        <div class="vision-tab" al-attr.class.vision-active="appData.ui.rightSidebarTabs.popover" al-on.click="appData.fn.onRightSidebarTab(appData, 'popover')"><?php esc_html_e('Popover', 'vision'); ?><div class="vision-status" al-if="appData.ui.activeLayer != null && appData.ui.activeLayer.popover.active"></div></div>
                                    </div>
                                    <div class="vision-data" al-attr.class.vision-active="appData.ui.rightSidebarTabs.layer">
                                        <div al-if="appData.ui.activeLayer == null">
                                            <div class="vision-info"><?php esc_html_e('Please select a layer to access settings', 'vision'); ?></div>
                                        </div>
                                        <div al-if="appData.ui.activeLayer != null">
                                            <div class="vision-block-list">
                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.layerTab.general">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onLayerTab(appData,'general')">
                                                        <div class="vision-block-title"><?php esc_html_e('General', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Set layer title', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('Title', 'vision'); ?></div>
                                                            <input class="vision-text vision-long" type="text" al-text="appData.ui.activeLayer.title">
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Sets a layer id (allow numbers, chars & specials: "_","-"). Should be unique and not empty.', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('Id', 'vision'); ?></div>
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell">
                                                                    <input class="vision-text vision-long vision-no-brr" type="text" al-uuid="appData.ui.activeLayer.id">
                                                                </div>
                                                                <div class="vision-input-group-cell vision-pinch">
                                                                    <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.generateLayerId(appData, appData.rootScope, appData.ui.activeLayer)" title="<?php esc_html_e('Generate a new ID', 'vision'); ?>"><span><i class="icon icon-refresh-ccw"></i></span></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Set layer position', 'vision'); ?>"></div>
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell vision-rgap">
                                                                    <div class="vision-label"><?php esc_html_e('X [px]', 'vision'); ?></div>
                                                                    <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.x">
                                                                </div>
                                                                <div class="vision-input-group-cell vision-lgap">
                                                                    <div class="vision-label"><?php esc_html_e('Y [px]', 'vision'); ?></div>
                                                                    <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.y">
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Set layer size', 'vision'); ?>"></div>
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell vision-rgap">
                                                                    <div class="vision-label"><?php esc_html_e('Width [px]', 'vision'); ?></div>
                                                                    <div class="vision-input-group vision-long">
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.width">
                                                                    </div>
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-pinch">
                                                                            <div al-checkbox="appData.ui.activeLayer.autoWidth"></div>
                                                                        </div>
                                                                        <div class="vision-input-group-cell">
                                                                            <?php esc_html_e('Auto width', 'vision'); ?>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vision-input-group-cell vision-lgap">
                                                                    <div class="vision-label"><?php esc_html_e('Height [px]', 'vision'); ?></div>
                                                                    <div class="vision-input-group vision-long">
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.height">
                                                                    </div>
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-pinch">
                                                                            <div al-checkbox="appData.ui.activeLayer.autoHeight"></div>
                                                                        </div>
                                                                        <div class="vision-input-group-cell">
                                                                            <?php esc_html_e('Auto height', 'vision'); ?>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Set layer angle', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('Angle [deg]', 'vision'); ?></div>
                                                            <input class="vision-number vision-long" al-float="appData.ui.activeLayer.angle">
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.layerTab.data">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onLayerTab(appData,'data')">
                                                        <div class="vision-block-title"><?php esc_html_e('Data', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Adds a specific url to the layer', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('URL', 'vision'); ?></div>
                                                            <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.url" placeholder="<?php esc_html_e('URL', 'vision'); ?>">
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell vision-pinch">
                                                                    <div al-checkbox="appData.ui.activeLayer.urlNewWindow"></div>
                                                                </div>
                                                                <div class="vision-input-group-cell">
                                                                    <?php esc_html_e('Open url in a new window', 'vision'); ?>
                                                                </div>
                                                            </div>
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell vision-pinch">
                                                                    <div al-checkbox="appData.ui.activeLayer.urlNoFollow"></div>
                                                                </div>
                                                                <div class="vision-input-group-cell">
                                                                    <?php esc_html_e('Set the "nofollow" tag', 'vision'); ?>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Adds the inner content data to the layer (shortcodes can be used too)', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('Content data', 'vision'); ?></div>
                                                            <textarea class="vision-long" al-textarea="appData.ui.activeLayer.contentData"></textarea>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Adds a specific string data to the layer, if we want to use it in custom code later', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('User data', 'vision'); ?></div>
                                                            <textarea class="vision-long" al-textarea="appData.ui.activeLayer.userData"></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.layerTab.appearance">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onLayerTab(appData,'appearance')">
                                                        <div class="vision-block-title"><?php esc_html_e('Appearance', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div class="vision-control">
                                                            <div class="vision-input-group vision-long">
                                                                <div class="vision-input-group-cell vision-rgap">
                                                                    <div class="vision-helper" title="<?php esc_html_e('The layer size depends on the image size, it scales with the image', 'vision'); ?>"></div>
                                                                    <div class="vision-label"><?php esc_html_e('Zoom with map', 'vision'); ?></div>
                                                                    <div al-toggle="appData.ui.activeLayer.scaling"></div>
                                                                </div>
                                                                <div class="vision-input-group-cell vision-lgap">
                                                                    <div class="vision-helper" title="<?php esc_html_e('The layer is never the target of mouse events', 'vision'); ?>"></div>
                                                                    <div class="vision-label"><?php esc_html_e('No events', 'vision'); ?></div>
                                                                    <div al-toggle="appData.ui.activeLayer.noevents"></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div al-if="appData.ui.activeLayer.type == 'link'">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Normal color in hexadecimal format (#fff or #555555)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Normal color', 'vision'); ?></div>
                                                                <div class="vision-color vision-long" al-color="appData.ui.activeLayer.link.normalColor"></div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Hover color in hexadecimal format (#fff or #555555)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Hover color', 'vision'); ?></div>
                                                                <div class="vision-color vision-long" al-color="appData.ui.activeLayer.link.hoverColor"></div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Sets a radius (5px or 50%)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Radius', 'vision'); ?></div>
                                                                <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.link.radius" placeholder="<?php esc_html_e('Example: 10px', 'vision'); ?>">
                                                            </div>
                                                        </div>

                                                        <div al-if="appData.ui.activeLayer.type == 'text'">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Add text', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Text', 'vision'); ?></div>
                                                                <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.text.data" placeholder="<?php esc_html_e('Text', 'vision'); ?>">
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Specifies a font of the text', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Font', 'vision'); ?></div>
                                                                <div class="vision-select vision-capitalize vision-long" al-textfont="appData.ui.activeLayer.text.font" data-fonts="appData.fonts"></div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Text color in hexadecimal format (#fff or #555555)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Text color', 'vision'); ?></div>
                                                                <div class="vision-color vision-long" al-color="appData.ui.activeLayer.text.color"></div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets the text size in px', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Text size [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.text.size" placeholder="<?php esc_html_e('Example: 18', 'vision'); ?>">
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets the text line height in px', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Line height [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.text.lineHeight" placeholder="<?php esc_html_e('Example: 18', 'vision'); ?>">
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies the horizontal alignment of the text', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Text align', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-textalign="appData.ui.activeLayer.text.align"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies the spacing behavior between text characters', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Letter spacing [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.text.letterSpacing" placeholder="<?php esc_html_e('Example: 1', 'vision'); ?>">
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Sets a background image (jpeg or png format)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Background image', 'vision'); ?></div>
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell">
                                                                        <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.ui.activeLayer.text.background.file.url" placeholder="<?php esc_html_e('Select an image', 'vision'); ?>">
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-pinch">
                                                                        <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectImage(appData, appData.rootScope, appData.ui.activeLayer.text.background.file)"><span><i class="icon icon-folder"></i></span></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- background color & repeat -->
                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets a background color', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background color', 'vision'); ?></div>
                                                                        <div class="vision-color vision-long" al-color="appData.ui.activeLayer.text.background.color"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('How the background image will be repeated', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background repeat', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-backgroundrepeat="appData.ui.activeLayer.text.background.repeat"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a size of the background image', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background size', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-backgroundsize="appData.ui.activeLayer.text.background.size"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets a starting position of the background image', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background position', 'vision'); ?></div>
                                                                        <input class="vision-text vision-long" type="text" al-text="appData.ui.activeLayer.text.background.position" placeholder="<?php esc_html_e('Example: 50% 50%', 'vision'); ?>">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div al-if="appData.ui.activeLayer.type == 'image'">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Sets a background image (jpeg or png format)', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Background image', 'vision'); ?></div>
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell">
                                                                        <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.ui.activeLayer.image.background.file.url" placeholder="<?php esc_html_e('Select an image', 'vision'); ?>">
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-pinch">
                                                                        <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectImage(appData, appData.rootScope, appData.ui.activeLayer.image.background.file)"><span><i class="icon icon-folder"></i></span></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <!-- background color & repeat -->
                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets a background color', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background color', 'vision'); ?></div>
                                                                        <div class="vision-color vision-long" al-color="appData.ui.activeLayer.image.background.color"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('How the background image will be repeated', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background repeat', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-backgroundrepeat="appData.ui.activeLayer.image.background.repeat"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a size of the background image', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background size', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-backgroundsize="appData.ui.activeLayer.image.background.size"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Sets a starting position of the background image', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Background position', 'vision'); ?></div>
                                                                        <input class="vision-text vision-long" type="text" al-text="appData.ui.activeLayer.image.background.position" placeholder="<?php esc_html_e('Example: 50% 50%', 'vision'); ?>">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div al-if="appData.ui.activeLayer.type == 'svg'">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Set svg file', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('File', 'vision'); ?></div>
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell">
                                                                        <input class="vision-text vision-long" type="text" al-text="appData.ui.activeLayer.svg.file.url" placeholder="<?php esc_html_e('Select a file', 'vision'); ?>">
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-pinch">
                                                                        <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectImage(appData, appData.rootScope, appData.ui.activeLayer.svg.file)"><span><i class="icon icon-folder"></i></span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <div class="vision-helper" title="<?php esc_html_e('Set additional css classes to the layer', 'vision'); ?>"></div>
                                                            <div class="vision-label"><?php esc_html_e('Extra CSS classes', 'vision'); ?></div>
                                                            <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.className">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="vision-data" al-attr.class.vision-active="appData.ui.rightSidebarTabs.tooltip">
                                        <div class="vision-data-block" al-attr.class.vision-active="appData.ui.activeLayer == null">
                                            <div class="vision-info"><?php esc_html_e('Please select a layer to access settings', 'vision'); ?></div>
                                        </div>
                                        <div class="vision-data-block" al-attr.class.vision-active="appData.ui.activeLayer != null">
                                            <div class="vision-block-list">
                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.tooltipTab.data">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onTooltipTab(appData,'data')">
                                                        <div class="vision-block-title"><?php esc_html_e('Data', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div al-if="appData.ui.activeLayer != null">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Enable/disable tooltip for the selected layer', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Enable tooltip', 'vision'); ?></div>
                                                                <div al-toggle="appData.ui.activeLayer.tooltip.active"></div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <?php
                                                            $settings = [
                                                                'tinymce' => true,
                                                                'textarea_name' => 'vision-tooltip-text',
                                                                'wpautop' => false,
                                                                'editor_height' => 200, // In pixels, takes precedence and has no default value
                                                                'drag_drop_upload' => true,
                                                                'media_buttons' => true,
                                                                'teeny' => true,
                                                                'quicktags' => true
                                                            ];
                                                            wp_editor('','vision-tooltip-editor', $settings);
                                                            ?>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.tooltipTab.appearance">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onTooltipTab(appData,'appearance')">
                                                        <div class="vision-block-title"><?php esc_html_e('Appearance', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div al-if="appData.ui.activeLayer != null">
                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a tooltip event trigger', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Trigger', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-tooltiptrigger="appData.ui.activeLayer.tooltip.trigger"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a tooltip placement', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Placement', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-tooltipplacement="appData.ui.activeLayer.tooltip.placement"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Set tooltip offset', 'vision'); ?>"></div>
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-label"><?php esc_html_e('Offset top [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.tooltip.offset.y">
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-label"><?php esc_html_e('Offset left [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.tooltip.offset.x">
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('The tooltip size depends on the image size', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Zoom with map', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.tooltip.scaling"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Determines if the tooltip is placed within the viewport as best it can be if there is not enough space', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Smart', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.tooltip.smart"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap" al-attr.class.vision-nogap="appData.ui.activeLayer.tooltip.widthFromCSS">
                                                                        <div class="vision-helper" title="<?php esc_html_e('If true, the tooltip width will be taken from CSS rules, dont forget to define them', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Width from CSS', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.tooltip.widthFromCSS"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap" al-if="!appData.ui.activeLayer.tooltip.widthFromCSS">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a tooltip width', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Width [px]', 'vision'); ?></div>
                                                                        <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.tooltip.width" placeholder="<?php esc_html_e('auto', 'vision'); ?>">
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control" al-if="appData.ui.activeLayer.tooltip.trigger != 'hover'">
                                                                <div class="vision-helper" title="<?php esc_html_e('The tooltip will be shown immediately once the instance is created', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Show on init', 'vision'); ?></div>
                                                                <div al-toggle="appData.ui.activeLayer.tooltip.showOnInit"></div>
                                                            </div>

                                                            <div class="vision-control" al-if="appData.ui.activeLayer.tooltip.trigger == 'hover'">
                                                                <div class="vision-input-group vision-long">
                                                                    <!--
                                                                <div class="vision-input-group-cell vision-rgap">
                                                                    <div class="vision-helper" title="<?php esc_html_e('Enable/disable tooltip follow the cursor as you hover over the layer', 'vision'); ?>"></div>
                                                                    <div class="vision-label"><?php esc_html_e('Follow the cursor', 'vision'); ?></div>
                                                                    <div al-toggle="appData.ui.activeLayer.tooltip.followCursor"></div>
                                                                </div>
                                                                -->
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('The tooltip will be shown immediately once the instance is created', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Show on init', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.tooltip.showOnInit"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('The tooltip won\'t hide when you hover over or click on them', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Interactive', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.tooltip.interactive"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Set additional css classes to the tooltip', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Extra CSS classes', 'vision'); ?></div>
                                                                <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.tooltip.className">
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Select a show animation effect for the tooltip from the list or write your own', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Show animation', 'vision'); ?></div>
                                                                        <div class="vision-input-group vision-long">
                                                                            <div class="vision-input-group-cell">
                                                                                <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.ui.activeLayer.tooltip.showAnimation">
                                                                            </div>
                                                                            <div class="vision-input-group-cell vision-pinch">
                                                                                <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectShowAnimation(appData, appData.ui.activeLayer.tooltip)" title="<?php esc_html_e('Select an effect', 'vision'); ?>"><span><i class="icon icon-folder"></i></span></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Select a hide animation effect for the tooltip from the list or write your own', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Hide animation', 'vision'); ?></div>
                                                                        <div class="vision-input-group vision-long">
                                                                            <div class="vision-input-group-cell">
                                                                                <input class="vision-text vision-long vision-no-brr" type="text" al-text="appData.ui.activeLayer.tooltip.hideAnimation">
                                                                            </div>
                                                                            <div class="vision-input-group-cell vision-pinch">
                                                                                <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.selectHideAnimation(appData, appData.ui.activeLayer.tooltip)" title="<?php esc_html_e('Select an effect', 'vision'); ?>"><span><i class="icon icon-folder"></i></span></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Set animation duration for show and hide effects', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Duration [ms]', 'vision'); ?></div>
                                                                <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.tooltip.duration">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="vision-data" al-attr.class.vision-active="appData.ui.rightSidebarTabs.popover">
                                        <div class="vision-data-block" al-attr.class.vision-active="appData.ui.activeLayer == null">
                                            <div class="vision-info"><?php esc_html_e('Please select a layer to access settings', 'vision'); ?></div>
                                        </div>
                                        <div class="vision-data-block" al-attr.class.vision-active="appData.ui.activeLayer != null">
                                            <div class="vision-block-list">
                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.popoverTab.data">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onPopoverTab(appData,'data')">
                                                        <div class="vision-block-title"><?php esc_html_e('Data', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div al-if="appData.ui.activeLayer != null">
                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Enable/disable popover for the selected layer', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Enable popover', 'vision'); ?></div>
                                                                <div al-toggle="appData.ui.activeLayer.popover.active"></div>
                                                            </div>
                                                        </div>

                                                        <div class="vision-control">
                                                            <?php
                                                            $settings = [
                                                                'tinymce' => true,
                                                                'textarea_name' => 'vision-popover-text',
                                                                'wpautop' => false,
                                                                'editor_height' => 200, // In pixels, takes precedence and has no default value
                                                                'drag_drop_upload' => true,
                                                                'media_buttons' => true,
                                                                'teeny' => true,
                                                                'quicktags' => true
                                                            ];
                                                            wp_editor('','vision-popover-editor', $settings);
                                                            ?>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="vision-block" al-attr.class.vision-block-folded="appData.ui.popoverTab.appearance">
                                                    <div class="vision-block-header" al-on.click="appData.fn.onPopoverTab(appData,'appearance')">
                                                        <div class="vision-block-title"><?php esc_html_e('Appearance', 'vision'); ?></div>
                                                        <div class="vision-block-state"></div>
                                                    </div>
                                                    <div class="vision-block-data">
                                                        <div al-if="appData.ui.activeLayer != null">
                                                            <div class="vision-control">
                                                                <div class="vision-input-group vision-long">
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a popover desktop type', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Desktop type', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-popovertype="appData.ui.activeLayer.popover.type"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('Specifies a popover mobile type', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Mobile type', 'vision'); ?></div>
                                                                        <div class="vision-select vision-long" al-popovertype="appData.ui.activeLayer.popover.mobileType"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div al-if="!(appData.ui.activeLayer.popover.type == 'tooltip' || appData.ui.activeLayer.popover.mobileType == 'tooltip')">
                                                                <div class="vision-control">
                                                                    <div class="vision-helper" title="<?php esc_html_e('Specifies the event trigger of the popover', 'vision'); ?>"></div>
                                                                    <div class="vision-label"><?php esc_html_e('Trigger', 'vision'); ?></div>
                                                                    <div class="vision-select vision-long" al-popovertrigger="appData.ui.activeLayer.popover.trigger"></div>
                                                                </div>
                                                            </div>

                                                            <div al-if="appData.ui.activeLayer.popover.type == 'tooltip' || appData.ui.activeLayer.popover.mobileType == 'tooltip'">
                                                                <div class="vision-control">
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-rgap">
                                                                            <div class="vision-helper" title="<?php esc_html_e('Specifies a popover event trigger', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Trigger', 'vision'); ?></div>
                                                                            <div class="vision-select vision-long" al-tooltiptrigger="appData.ui.activeLayer.popover.trigger"></div>
                                                                        </div>
                                                                        <div class="vision-input-group-cell vision-lgap">
                                                                            <div class="vision-helper" title="<?php esc_html_e('Specifies a popover placement', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Placement', 'vision'); ?></div>
                                                                            <div class="vision-select vision-long" al-tooltipplacement="appData.ui.activeLayer.popover.placement"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div class="vision-control">
                                                                    <div class="vision-helper" title="<?php esc_html_e('Set popover offset', 'vision'); ?>"></div>
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-rgap">
                                                                            <div class="vision-label"><?php esc_html_e('Offset top [px]', 'vision'); ?></div>
                                                                            <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.popover.offset.top">
                                                                        </div>
                                                                        <div class="vision-input-group-cell vision-lgap">
                                                                            <div class="vision-label"><?php esc_html_e('Offset left [px]', 'vision'); ?></div>
                                                                            <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.popover.offset.left">
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div class="vision-control">
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-rgap">
                                                                            <div class="vision-helper" title="<?php esc_html_e('The popover size depends on the image size', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Zoom with map', 'vision'); ?></div>
                                                                            <div al-toggle="appData.ui.activeLayer.popover.scaling"></div>
                                                                        </div>
                                                                        <div class="vision-input-group-cell vision-lgap">
                                                                            <div class="vision-helper" title="<?php esc_html_e('Determines if the popover is placed within the viewport as best it can be if there is not enough space', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Smart', 'vision'); ?></div>
                                                                            <div al-toggle="appData.ui.activeLayer.popover.smart"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div class="vision-control">
                                                                    <div class="vision-input-group vision-long">
                                                                        <div class="vision-input-group-cell vision-rgap" al-attr.class.vision-nogap="appData.ui.activeLayer.popover.widthFromCSS">
                                                                            <div class="vision-helper" title="<?php esc_html_e('If true, the tooltip width will be taken from CSS rules, dont forget to define them', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Width from CSS', 'vision'); ?></div>
                                                                            <div al-toggle="appData.ui.activeLayer.popover.widthFromCSS"></div>
                                                                        </div>
                                                                        <div class="vision-input-group-cell vision-lgap" al-if="!appData.ui.activeLayer.popover.widthFromCSS">
                                                                            <div class="vision-helper" title="<?php esc_html_e('Specifies the width of the popover', 'vision'); ?>"></div>
                                                                            <div class="vision-label"><?php esc_html_e('Width [px]', 'vision'); ?></div>
                                                                            <input class="vision-number vision-long" al-integer="appData.ui.activeLayer.popover.width" placeholder="<?php esc_html_e('auto', 'vision'); ?>">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control" al-if="appData.ui.activeLayer.popover.trigger != 'hover'">
                                                                <div class="vision-helper" title="<?php esc_html_e('The popover will be shown immediately once the instance is created', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Show on init', 'vision'); ?></div>
                                                                <div al-toggle="appData.ui.activeLayer.popover.showOnInit"></div>
                                                            </div>

                                                            <div class="vision-control" al-if="appData.ui.activeLayer.popover.trigger == 'hover'">
                                                                <div class="vision-input-group vision-long">
                                                                    <!--
                                                                <div class="vision-input-group-cell vision-rgap">
                                                                    <div class="vision-helper" title="<?php esc_html_e('Enable/disable popover follow the cursor as you hover over the layer', 'vision'); ?>"></div>
                                                                    <div class="vision-label"><?php esc_html_e('Follow the cursor', 'vision'); ?></div>
                                                                    <div al-toggle="appData.ui.activeLayer.popover.followCursor"></div>
                                                                </div>
                                                                -->
                                                                    <div class="vision-input-group-cell vision-rgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('The popover will be shown immediately once the instance is created', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Show on init', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.popover.showOnInit"></div>
                                                                    </div>
                                                                    <div class="vision-input-group-cell vision-lgap">
                                                                        <div class="vision-helper" title="<?php esc_html_e('The popover won\'t hide when you hover over or click on them', 'vision'); ?>"></div>
                                                                        <div class="vision-label"><?php esc_html_e('Interactive', 'vision'); ?></div>
                                                                        <div al-toggle="appData.ui.activeLayer.popover.interactive"></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="vision-control">
                                                                <div class="vision-helper" title="<?php esc_html_e('Set additional css classes to the popover', 'vision'); ?>"></div>
                                                                <div class="vision-label"><?php esc_html_e('Extra CSS classes', 'vision'); ?></div>
                                                                <input class="vision-number vision-long" type="text" al-text="appData.ui.activeLayer.popover.className">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="vision-section" al-attr.class.vision-active="appData.ui.tabs.customCSS" al-if="appData.ui.tabs.customCSS">
                        <div class="vision-stage">
                            <div class="vision-main-panel vision-main-panel-general">
                                <div class="vision-data vision-active">
                                    <div class="vision-control">
                                        <div class="vision-helper" title="<?php esc_html_e('Enable/disable custom styles', 'vision'); ?>"></div>
                                        <div class="vision-input-group">
                                            <div class="vision-input-group-cell vision-pinch">
                                                <div al-toggle="appData.config.customCSS.active"></div>
                                            </div>
                                            <div class="vision-input-group-cell">
                                                <div class="vision-label vision-offset-top"><?php esc_html_e('Enable styles', 'vision'); ?></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="vision-control vision-full-height">
                                        <pre id="vision-notepad-css" class="vision-notepad"></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="vision-section" al-attr.class.vision-active="appData.ui.tabs.customJS" al-if="appData.ui.tabs.customJS">
                        <div class="vision-stage">
                            <div class="vision-main-panel vision-main-panel-general">
                                <div class="vision-data vision-active">
                                    <div class="vision-control">
                                        <div class="vision-helper" title="<?php esc_html_e('Enable/disable custom javascript code', 'vision'); ?>"></div>
                                        <div class="vision-input-group">
                                            <div class="vision-input-group-cell vision-pinch">
                                                <div al-toggle="appData.config.customJS.active"></div>
                                            </div>
                                            <div class="vision-input-group-cell">
                                                <div class="vision-label vision-offset-top"><?php esc_html_e('Enable javascript code', 'vision'); ?></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="vision-control vision-full-height">
                                        <pre id="vision-notepad-js" class="vision-notepad"></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="vision-section" al-attr.class.vision-active="appData.ui.tabs.shortcode" al-if="appData.wp_item_id">
                        <div class="vision-main-panel vision-main-panel-general">
                            <div class="vision-data vision-active">
                                <div class="vision-control">
                                    <div class="vision-info"><?php esc_html_e('Use a shortcode like the one below, copy and paste it into a post or page.', 'vision'); ?></div>
                                </div>

                                <div class="vision-control">
                                    <div class="vision-label"><?php esc_html_e('Standard shortcode', 'vision'); ?></div>
                                    <div class="vision-input-group">
                                        <div class="vision-input-group-cell">
                                            <input id="vision-shortcode-1" class="vision-text vision-long" type="text" value='[vision id="{{appData.wp_item_id}}"]' readonly="readonly">
                                        </div>
                                        <div class="vision-input-group-cell vision-pinch">
                                            <div class="vision-btn vision-default vision-no-bl" al-on.click="appData.fn.copyToClipboard(appData, '#vision-shortcode-1')" title="<?php esc_html_e('Copy to clipboard', 'vision'); ?>"><span><i class="icon icon-clipboard"></i></span></div>
                                        </div>
                                    </div>
                                </div>

                                <p><?php esc_html_e('Next to that you can also add a few optional arguments to your shortcode:', 'vision'); ?></p>
                                <table class="vision-table">
                                    <tbody>
                                    <tr>
                                        <th><?php esc_html_e('Variable', 'vision'); ?></th>
                                        <th><?php esc_html_e('Value', 'vision'); ?></th>
                                    </tr>
                                    <tr>
                                        <td><code>id</code></td>
                                        <td><?php esc_html_e('item ID', 'vision'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><code>slug</code></td>
                                        <td><?php esc_html_e('slug identifier', 'vision'); ?></td>
                                    </tr>
                                    <tr>
                                        <td><code>class</code></td>
                                        <td><?php esc_html_e('custom CSS class', 'vision'); ?></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
				</div>
			</div>
		</div>
		<div id="vision-modals" class="vision-modals">
		</div>
	</div>
</div>
<!-- /end vision app -->