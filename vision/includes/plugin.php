<?php
defined('ABSPATH') || exit;

class Vision_Builder {
	private $pluginBasename = NULL;

	private $ajax_action_item_update = NULL;
	private $ajax_action_item_update_status = NULL;
	private $ajax_action_settings_update = NULL;
	private $ajax_action_settings_get = NULL;
	private $ajax_action_delete_data = NULL;
	private $ajax_action_modal = NULL;
	
	private $vision_map_id = null;
	private $vision_map_version = null;
	private $shortcodes = [];
	
	function __construct($pluginBasename) {
		$this->pluginBasename = $pluginBasename;
	}
	
	function run() {
		$upload_dir = wp_upload_dir();
		$plugin_url = plugin_dir_url(dirname(__FILE__));
		
		define('VISION_PLUGIN_UPLOAD_DIR', wp_normalize_path($upload_dir['basedir'] . '/vision'));
		define('VISION_PLUGIN_UPLOAD_URL', set_url_scheme($upload_dir['baseurl'] . '/vision/'));
		
		define('VISION_PLUGIN_PLAN', 'lite');
		
		$user = wp_get_current_user(); //is_super_admin()
		$allowed_roles = $this->getAllowedRoles();
		if((array_intersect($allowed_roles, $user->roles) || current_user_can('manage_options')) && is_admin()) {
			$this->ajax_action_item_update = 'vision_ajax_item_update';
			$this->ajax_action_item_update_status = 'vision_ajax_item_update_status';
			$this->ajax_action_settings_update = 'vision_ajax_settings_update';
			$this->ajax_action_settings_get = 'vision_ajax_settings_get';
			$this->ajax_action_delete_data = 'vision_ajax_delete_data';
			$this->ajax_action_modal = 'vision_ajax_modal';
			
			load_plugin_textdomain('vision', false, dirname(dirname(plugin_basename(__FILE__))) . '/languages/');
			
			add_action('admin_menu', [$this, 'admin_menu']);
            add_action('admin_footer', [$this, 'admin_footer']);
			add_action('admin_notices', [$this, 'admin_notices']);
			add_action('in_admin_header', [$this, 'in_admin_header']);
			add_action('wp_loaded', [$this, 'page_redirects']);
			
			// important, because ajax has another url
			add_action('wp_ajax_' . $this->ajax_action_item_update, [$this, 'ajax_item_update']);
			add_action('wp_ajax_' . $this->ajax_action_item_update_status, [$this, 'ajax_item_update_status']);
			add_action('wp_ajax_' . $this->ajax_action_settings_update, [$this, 'ajax_settings_update']);
			add_action('wp_ajax_' . $this->ajax_action_settings_get, [$this, 'ajax_settings_get']);
			add_action('wp_ajax_' . $this->ajax_action_delete_data, [$this, 'ajax_delete_data']);
			add_action('wp_ajax_' . $this->ajax_action_modal, [$this, 'ajax_modal']);
		} else {
			add_shortcode(VISION_SHORTCODE_NAME, [$this, 'shortcode']);
		}
		
		// only logged users with right roles can preview a vision map
		if(array_intersect($allowed_roles, $user->roles) || current_user_can('manage_options')) {
			add_filter('do_parse_request', [$this, 'do_parse_request'], 10, 3);
		}

        add_action('rest_api_init', array($this, 'rest_api_init'));
    }

    function rest_api_init() {
        register_rest_route(
            VISION_PLUGIN_REST_URL, '/item/(?P<id>\d+)',
            [
                'methods' => 'GET',
                'callback' => [$this, 'rest_api_get_item'],
                'permission_callback' => [$this, 'rest_api_permissions_check']
            ]
        );
    }

    function rest_api_get_item($request) {
        $id = intval( $request->get_param('id') );
        $preview = boolval( $request->get_param('preview') );

        global $wpdb;
        $table = $wpdb->prefix . VISION_PLUGIN_NAME;

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $sql = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d AND NOT deleted", $id);
        $item = $wpdb->get_row($sql, OBJECT);
        // phpcs:enable

        $config = null;
        if($item->active) {
            $config = unserialize($item->config);
        }  else if($preview) {
            $user = wp_get_current_user();
            $allowed_roles = $this->getAllowedRoles();

            if(array_intersect($allowed_roles, $user->roles) || current_user_can('manage_options')) {
                $config = unserialize($item->config);
            }
        }

        if($config) {
            return new WP_REST_Response($config);
        }
        return new WP_REST_Response(null, 404);
    }

    function rest_api_permissions_check() {
        return true;
    }

    function filesystem_method() {
        return 'direct';
    }

    function request_filesystem_credentials() {
        return true;
    }

    function getFileSystem() {
        global $wp_filesystem;
        $result = true;

        if(!$wp_filesystem) {
            require_once(ABSPATH . '/wp-admin/includes/file.php');

            add_filter('filesystem_method', [$this, 'filesystem_method']);
            add_filter('request_filesystem_credentials', [$this, 'request_filesystem_credentials']);

            $credentials = request_filesystem_credentials(site_url(), '', true, false, null);

            $result = WP_Filesystem($credentials);

            remove_filter('filesystem_method', [$this, 'filesystem_method']);
            remove_filter('request_filesystem_credentials', [$this, 'request_filesystem_credentials']);
        }

        if($result)
            return $wp_filesystem;
        return null;
    }

	function joinPaths() {
		$paths = [];
		
		foreach(func_get_args() as $arg) {
			if($arg !== '') {
				$paths[] = $arg;
			}
		}
		
		return preg_replace('#/+#','/',join('/', $paths));
	}
	
	function joinUrls() {
		$urls = [];
		
		foreach(func_get_args() as $arg) {
			if($arg !== '') {
				$urls[] = $arg;
			}
		}
		
		return preg_replace('/([^:])(\/{2,})/','$1/',join('/', $urls));
	}
	
	function IsNullOrEmptyString($str) {
		return(!isset($str) || trim($str)==='');
	}
	
	function getAllowedRoles() {
		$allowed_roles = ['administrator'];
		
		$settings_key = 'vision_settings';
		$settings_value = get_option($settings_key);
		if($settings_value) {
			$settings = unserialize($settings_value);
			if(is_array($settings->roles)) $allowed_roles = array_merge($allowed_roles, $settings->roles);
		}
		
		return $allowed_roles;
	}
	
	function getLoaderGlobals($timestamp) {
		$plugin_url = plugin_dir_url(dirname(__FILE__));
		
		$globals = [
			'plan' => VISION_PLUGIN_PLAN,
			'version' => $timestamp,
			'effects_url' => $plugin_url . 'assets/css/vision-effects.css',
			'theme_base_url' => $plugin_url . 'assets/themes/',
			'plugin_base_url' => $plugin_url . 'assets/vendor/vision/',
			'plugin_version' => VISION_PLUGIN_VERSION,
            'ssl' => is_ssl(),
            'api' => [
                'nonce' => wp_create_nonce( 'wp_rest' ),
                'url' => esc_url_raw( rest_url( VISION_PLUGIN_REST_URL ) )
            ]
        ];
		
		return $globals;
	}
	
	function embedLoader($in_footer, $timestamp) {
		$plugin_url = plugin_dir_url(dirname(__FILE__));
		wp_enqueue_script('vision_loader', $plugin_url . 'assets/js/loader.js', ['jquery'], VISION_PLUGIN_VERSION, $in_footer);
		wp_localize_script('vision_loader', 'vision_globals', $this->getLoaderGlobals($timestamp));
	}

	/**
	 * generate main css text
	 */
	function getMainCss($itemData, $itemId) {
		$upload_dir = wp_upload_dir();
		
		// create main css
		$main_css = '';
		$main_css .= '.vision-map-' . $itemId . ' {' . PHP_EOL;
		
		$main_css .= (!$this->IsNullOrEmptyString($itemData->background->color) ? 'background-color:' . $itemData->background->color . ';' . PHP_EOL : '');
		if(!$this->IsNullOrEmptyString($itemData->background->image->url)) {
			$imageUrl = ($itemData->background->image->relative ? $upload_dir['baseurl'] : '') . $itemData->background->image->url;
			$main_css .= 'background-image:url(' . $imageUrl . ');' . PHP_EOL;
		}
		$main_css .= ($itemData->background->size ? 'background-size:' . $itemData->background->size . ';' . PHP_EOL : '');
		$main_css .= ($itemData->background->repeat ? 'background-repeat:' . $itemData->background->repeat . ';' . PHP_EOL : '');
		$main_css .= ($itemData->background->position ? 'background-position:' . $itemData->background->position . ';' . PHP_EOL : '');
		
		$main_css .= '}' . PHP_EOL;
		
		$layerId = 0;
		foreach($itemData->layers as $layerKey => $layer) {
			if(!$layer->visible) {
				continue;
			}
			
			$layerId++;
			$layerSelector = '.vision-map-' . $itemId . ' .vision-layers [data-layer-id="' . $layer->id . '"] .vision-body';
			
			// main
			$main_css .= $layerSelector . ' {' . PHP_EOL;
			switch($layer->type) {
				case 'link': {
					$main_css .= ($layer->link->normalColor ? 'background-color:' . $layer->link->normalColor . ';' . PHP_EOL : '');
					$main_css .= ($layer->link->radius != NULL ? 'border-radius:' . $layer->link->radius . ';' . PHP_EOL : '');
				} break;
				case 'image': {
					$main_css .= (!$this->IsNullOrEmptyString($layer->image->background->color) ? 'background-color:' . $layer->image->background->color . ';' . PHP_EOL : '');
					if(!$this->IsNullOrEmptyString($layer->image->background->file->url)) {
						$imageUrl = ($layer->image->background->file->relative ? $upload_dir['baseurl'] : '') . $layer->image->background->file->url;
						$main_css .= 'background-image:url(' . $imageUrl . ');' . PHP_EOL;
					}
					$main_css .= ($layer->image->background->size ? 'background-size:' . $layer->image->background->size . ';' . PHP_EOL : '');
					$main_css .= ($layer->image->background->repeat ? 'background-repeat:' . $layer->image->background->repeat . ';' . PHP_EOL : '');
					$main_css .= ($layer->image->background->position ? 'background-position:' . $layer->image->background->position . ';' . PHP_EOL : '');
				} break;
				case 'text': {
					$main_css .= (!$this->IsNullOrEmptyString($layer->text->background->color) ? 'background-color:' . $layer->text->background->color . ';' . PHP_EOL : '');
					if(!$this->IsNullOrEmptyString($layer->text->background->file->url)) {
						$imageUrl = ($layer->text->background->file->relative ? $upload_dir['baseurl'] : '') . $layer->text->background->file->url;
						$main_css .= 'background-image:url(' . $imageUrl . ');' . PHP_EOL;
					}
					$main_css .= ($layer->text->background->size ? 'background-size:' . $layer->text->background->size . ';' . PHP_EOL : '');
					$main_css .= ($layer->text->background->repeat ? 'background-repeat:' . $layer->text->background->repeat . ';' . PHP_EOL : '');
					$main_css .= ($layer->text->background->position ? 'background-position:' . $layer->text->background->position . ';' . PHP_EOL : '');
					
					$main_css .= ($layer->text->font ? 'font-family:"' . str_replace('+', ' ', $layer->text->font) . '",sans-serif;' . PHP_EOL : '');
					$main_css .= ($layer->text->color ? 'color:' . $layer->text->color . ';' . PHP_EOL : '');
					$main_css .= ($layer->text->size != NULL ? 'font-size:' . $layer->text->size . 'px;' . PHP_EOL : '');
					$main_css .= ($layer->text->lineHeight != NULL ? 'line-height:' . $layer->text->lineHeight . 'px;' . PHP_EOL : '');
					$main_css .= ($layer->text->align ? 'text-align:' . $layer->text->align . ';' . PHP_EOL : '');
					$main_css .= ($layer->text->letterSpacing != NULL ? 'letter-spacing:' . $layer->text->letterSpacing . 'px;' . PHP_EOL : '');
				} break;
			}
			$main_css .= '}' . PHP_EOL;
			
			if($layer->type == 'link') {
				$main_css .= $layerSelector . ':hover {' . PHP_EOL;
				$main_css .= ($layer->link->hoverColor ? 'background-color:' . $layer->link->hoverColor . ';' . PHP_EOL : '');
				$main_css .= '}' . PHP_EOL;
			}
		}
		
		return $main_css;
	}
	
	/**
	 * Shortcode output for the plugin
	 */
	function shortcode($atts) {
		extract(shortcode_atts(['id'=>0, 'slug'=>NULL, 'class'=>NULL], $atts, VISION_SHORTCODE_NAME));
		
		if(!$id && !$slug) {
			return '<p>' . esc_html__('Error: invalid vision identifier attribute', 'vision') . '</p>';
		}

        $id = intval($id, 10);
        $slug = sanitize_key($slug);
        $class = sanitize_text_field($class);
		
		global $wpdb;
		$table = $wpdb->prefix . VISION_PLUGIN_NAME;
		$upload_dir = wp_upload_dir();

        // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sql = ($id ? $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d AND NOT deleted", $id) : $wpdb->prepare("SELECT * FROM {$table} WHERE slug=%s AND NOT deleted LIMIT 0, 1", $slug));
		$item = $wpdb->get_row($sql, OBJECT);
        // phpcs:enable

		$preview = filter_input(INPUT_GET, 'preview', FILTER_SANITIZE_NUMBER_INT);

		if($item && ($item->active || (!$item->active && $preview == 1))) {
			$version = strtotime(mysql2date('d M Y H:i:s', $item->modified));
			$itemData = unserialize($item->data);
			$id = $item->id;
			$id_postfix = strtolower(wp_generate_password(5, false)); // generate unique postfix for $id to avoid clashes with multiple same shortcode use
			$id_element = 'vision-' . $id . '-' . $id_postfix;
			
			array_push($this->shortcodes, ['id' => $item->id, 'version' => $version]);
			
			if(sizeof($this->shortcodes) == 1) {
				$this->embedLoader(true, $version);
			}

			ob_start(); // turn on buffering

            echo '<!-- vision begin -->' . PHP_EOL;
            echo '<div ';
            echo (property_exists($itemData, 'containerId') && $itemData->containerId ? 'id="' . esc_attr($itemData->containerId) . '" ':'');
            echo 'class="vision-map vision-map-' . esc_attr($id . ($class ? ' ' . $class : '')) . '"';
            echo 'data-json-src="'. esc_url_raw( rest_url( VISION_PLUGIN_REST_URL ) ) . '/item/' . esc_attr($item->id) . ($preview ? '?preview=1' : '') . '" ';
            echo 'data-item-id="' . esc_attr($item->id) . '" ';
            echo 'tabindex="1" ';
            echo '>' . PHP_EOL;
                if (property_exists($itemData, 'image')) {
                    $upload_dir = wp_upload_dir();
                    $imageUrl = ($itemData->image->relative ? $upload_dir['baseurl'] : '') . $itemData->image->url;
                    echo "<img src='" . esc_url($imageUrl). "' class='vision-img-placeholder' width='100%'>";
                }

                //=============================================
                // STORE BEGIN
                echo '<div class="vision-store" style="display:none;">' . PHP_EOL;
                echo '<div class="vision-layers-data">' . PHP_EOL;
				foreach($itemData->layers as $layerKey => $layer) {
					if(!$layer->visible) {
						continue;
					}
					
					//=============================================
					// LAYER BEGIN
                    echo '<div class="vision-layer" data-layer-id="' . esc_attr($layer->id) . '">';
					
					if($layer->contentData) {
                        echo do_shortcode($layer->contentData);
					}
					
					if($layer->type == 'text') {
                        echo wp_kses_post($layer->text->data);
					}

                    echo '</div>' . PHP_EOL;
					// LAYER END
					//=============================================
				}
                echo '</div>' . PHP_EOL;

                echo '<div class="vision-tooltips-data">' . PHP_EOL;
				foreach($itemData->layers as $layerKey => $layer) {
					if(!$layer->visible) {
						continue;
					}
					
					//=============================================
					// TOOLTIP BEGIN
                    echo '<div class="vision-data" data-layer-id="' . esc_attr($layer->id) . '">';
                    echo do_shortcode($layer->tooltip->data);
                    echo '</div>' . PHP_EOL;
					// TOOLTIP END
					//=============================================
				}
                echo '</div>' . PHP_EOL;

                echo '<div class="vision-popovers-data">' . PHP_EOL;
				foreach($itemData->layers as $layerKey => $layer) {
					if(!$layer->visible) {
						continue;
					}
					
					//=============================================
					// POPOVER BEGIN
                    echo '<div class="vision-data" data-layer-id="' . esc_attr($layer->id) . '">';
                    echo do_shortcode($layer->popover->data);
                    echo '</div>' . PHP_EOL;
					// POPOVER END
					//=============================================
				}
                echo '</div>' . PHP_EOL;

                echo '</div>' . PHP_EOL;
				// STORE END
				//=============================================

            echo '</div>' . PHP_EOL;

            $css = $this->getMainCss($itemData, $id) . ($itemData->customCSS->active ? $itemData->customCSS->data : '');
            $css = preg_replace('/[^\/\\\\a-zA-Z0-9\s\_\%\=\[\]\(\)\{\}\:\;\.\,\#\$\-\"\'\']/', '', $css);

            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo '<style>' . $css . '</style>';

            echo '<!-- vision end -->' . PHP_EOL;

			$output = ob_get_contents(); // get the buffered content into a var
			ob_end_clean(); // clean buffer

            return $output;
		}
		
		return '<p>' . esc_html__('Error: the vision item can’t be found', 'vision') . '</p>';
	}

	/**
	* Run a filter to obtain some custom url settings, compare them to the current url
	* and if a match is found the custom callback is fired, the custom view is loaded
	* and request is stopped.
	*/
	function do_parse_request($result) {
		if(current_filter() !== 'do_parse_request') {
			return $result;
		}

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated
        $url = sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) );

		if(preg_match('/vision\/map\/([a-z0-9_-]+)/', $url, $matches)) {
         	$preview = filter_input(INPUT_GET, 'preview', FILTER_SANITIZE_NUMBER_INT);

            global $wpdb;
            $table = $wpdb->prefix . VISION_PLUGIN_NAME;
            $shortcode = false;

			if(is_numeric($matches[1])) {
				$vision_map_id = $matches[1];

				if($vision_map_id != null) {
                    // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%d AND NOT deleted", $vision_map_id);
					$item = $wpdb->get_row($sql, OBJECT);
                    // phpcs:enable
					
					if($item && ($item->active || (!$item->active && $preview == 1))) {
						$this->vision_map_id = $item->id;
						$this->vision_map_version = strtotime(mysql2date('Y-m-d H:i:s', $item->modified));
						$shortcode = true;
					}
				}
			} else {
				$vision_map_slug = $matches[1];

				if($vision_map_slug != null) {
                    // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$sql = $wpdb->prepare("SELECT * FROM {$table} WHERE slug=%s AND NOT deleted", $vision_map_slug);
					$item = $wpdb->get_row($sql, OBJECT);
                    // phpcs:enable
					
					if($item && ($item->active || (!$item->active && $preview == 1))) {
						$this->vision_map_id = $item->id;
						$this->vision_map_version = strtotime(mysql2date('Y-m-d H:i:s', $item->modified));
						
						$shortcode = true;
					}
				}
			}
			
			if($shortcode) {
                require_once(plugin_dir_path(dirname(__FILE__)) . 'includes/page-preview.php');
				exit();
			}
		}
		
		return $result;
	}
	
	/**
	 * Prepare upload directory
	 */
	function admin_notices() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		if(!($page==='vision' || $page==='vision_item')) {
			return;
		}
		
		if(!file_exists(VISION_PLUGIN_UPLOAD_DIR)) {
			wp_mkdir_p(VISION_PLUGIN_UPLOAD_DIR);
		}
		
		if(!file_exists(VISION_PLUGIN_UPLOAD_DIR)) {
            echo '<div class="notice notice-error is-dismissible">';
            echo '<p>' . esc_html__('The plugin upload directory could not be created', 'vision') . '</p>';
            echo '<p>' . esc_html__('Please run the following commands in order to make the directory', 'vision') . '<br>';
            echo '<b>mkdir ' . esc_attr(VISION_PLUGIN_UPLOAD_DIR) . '</b><br>';
            echo '<b>chmod 777 ' . esc_attr(VISION_PLUGIN_UPLOAD_DIR) . '</b></p>';
            echo '</div>';
			return;
		}
		
		if(!wp_is_writable(VISION_PLUGIN_UPLOAD_DIR)) {
            echo '<div class="notice notice-error is-dismissible">';
            echo '<p>' . esc_html__('The plugin upload directory is not writable, therefore the css and js files cannot be saved.', 'vision') . '</p>';
            echo '<p>' . esc_html__('Please run the following commands in order to make the directory', 'vision') . '<br>';
            echo '<b>chmod 777 ' . esc_attr(VISION_PLUGIN_UPLOAD_DIR) . '</b></p>';
            echo '</div>';
			return;
		}
		
		if(!file_exists(VISION_PLUGIN_UPLOAD_DIR . '/' . 'index.php')) {
			$data = '<?php' . PHP_EOL . '// silence is golden' . PHP_EOL . '?>';

            $wp_filesystem = $this->getFileSystem();
            $wp_filesystem->put_contents(VISION_PLUGIN_UPLOAD_DIR . '/' . 'index.php', $data);
		}
	}
	
	/**
	 * Fires at the beginning of the content section in an admin page
	 */
	function in_admin_header() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		
		if(!(($page==='vision') || ($page==='vision_item') || ($page==='vision_settings'))) {
			return;
		}
		
		remove_all_actions('admin_notices');
		remove_all_actions('all_admin_notices');
		add_action('admin_notices', [$this, 'admin_notices']);
	}
	
	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 */
	function admin_menu() {
		// add "edit_posts" if we want to give access to author, editor and contributor roles
		add_menu_page(esc_html__('Vision', 'vision'), esc_html__('Vision', 'vision'), 'read', 'vision', [$this, 'admin_menu_page_items'], 'dashicons-format-image');
		add_submenu_page('vision', esc_html__('Vision', 'vision'), esc_html__('All Items', 'vision'), 'read', 'vision', [$this, 'admin_menu_page_items']);
		add_submenu_page('vision', esc_html__('Vision', 'vision'), esc_html__('Add New', 'vision'), 'read', 'vision_item', [$this, 'admin_menu_page_item']);
		add_submenu_page('vision', esc_html__('Vision', 'vision'), esc_html__('Settings', 'vision'), 'manage_options', 'vision_settings', [$this, 'admin_menu_page_settings']);
        
        add_submenu_page('vision', esc_html__('Vision', 'vision'), esc_html__('Upgrade to Pro', 'vision'), 'manage_options', 'vision_upgrade_to_pro', [$this, 'admin_menu_page_upgrade_to_pro']);
        
	}

    function admin_footer() {
        if(get_current_screen() && get_current_screen()->base !== 'plugins') {
            return;
        }

        $globals = [
            'token' => $this->get_token(),
            'ajax' => [
                'url' => VISION_FEEDBACK_URL
            ]
        ];

        wp_enqueue_style('vision-feedback', VISION_PLUGIN_URL . 'assets/css/feedback.css', [], VISION_PLUGIN_VERSION);
        wp_enqueue_script('vision-feedback', VISION_PLUGIN_URL . 'assets/js/feedback.js', ['jquery'], VISION_PLUGIN_VERSION, false);
        wp_localize_script('vision-feedback', 'vision_feedback_globals', $globals);

        require_once(plugin_dir_path(dirname(__FILE__)) . 'templates/feedback.php');
    }

    function get_token() {
        global $wp_version;
        $current_user = wp_get_current_user();

        $data = [
            'plugin_name' => VISION_PLUGIN_NAME,
            'plugin_version' => VISION_PLUGIN_VERSION,
            'wordpress' => $wp_version,
            'php' => PHP_VERSION,
            'email' => $current_user->user_email,
            'site' => trim(str_replace(['http://', 'https://'], '', get_site_url()), '/')
        ];
        return base64_encode(wp_json_encode($data));
    }
	
	/**
	 * Custom redirects
	 */
	function page_redirects() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));

		if($page==='vision') {
			$action = sanitize_key(filter_input(INPUT_GET, 'action', FILTER_DEFAULT));
			if($action) {
                // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated
                $url = sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) );

				$url = remove_query_arg(['action', 'id', '_wpnonce'], $url );
				header('Refresh:0; url="' . $url . '"', true, 303);
				//wp_redirect($url); // does not work delete and dublicate operations on XAMPP
			}
		}
	}
	
	/**
	 * Show admin menu items page
	 */
	function admin_menu_page_items() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		
		if($page==='vision') {
			$plugin_url = plugin_dir_url( dirname(__FILE__) );
			$upload_dir = wp_upload_dir();

			wp_enqueue_style('vision_admin', $plugin_url . 'assets/css/admin.css', [], VISION_PLUGIN_VERSION, 'all' );
            wp_enqueue_style('vision_lucide', $plugin_url . 'assets/vendor/lucide/lucide.css', [], VISION_PLUGIN_VERSION, 'all' );
			wp_enqueue_script('vision_admin', $plugin_url . 'assets/js/admin.js', ['jquery'], VISION_PLUGIN_VERSION, false );
			
			// global settings to help ajax work
			$globals = [
				'plan' => VISION_PLUGIN_PLAN,
				'msg_pro_title' => esc_html__('Available only in Pro version', 'vision'),
				'upload_url' => $upload_dir['baseurl'],
				'ajax_url' => admin_url('admin-ajax.php'),
				'ajax_nonce' => wp_create_nonce('vision_ajax' ),
				'ajax_msg_error' => esc_html__('Uncaught Error', 'vision') //Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information
            ];
			$globals['ajax_action_update'] = $this->ajax_action_item_update_status;
			
			require_once(plugin_dir_path( dirname(__FILE__) ) . 'includes/list-table-items.php');
			require_once(plugin_dir_path( dirname(__FILE__) ) . 'includes/page-items.php');

			wp_localize_script('vision_admin', 'vision_globals', $globals);
		}
	}
	
	/**
	 * Show admin menu item page
	 */
	function admin_menu_page_item() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		if($page==='vision_item') {
			$plugin_url = plugin_dir_url(dirname(__FILE__));
			$upload_dir = wp_upload_dir();

			wp_enqueue_style('vision_admin', $plugin_url . 'assets/css/admin.css', [], VISION_PLUGIN_VERSION, 'all' );
			wp_enqueue_style('vision_lucide', $plugin_url . 'assets/vendor/lucide/lucide.css', [], VISION_PLUGIN_VERSION, 'all' );
			wp_enqueue_style('vision_vision_effects', $plugin_url . 'assets/css/vision-effects.css', [], VISION_PLUGIN_VERSION, 'all' );

            wp_enqueue_script('vision_ace', $plugin_url . 'assets/vendor/ace/ace.js', [], VISION_PLUGIN_VERSION, false );
			wp_enqueue_script('vision_url', $plugin_url . 'assets/vendor/url/url.js', [], VISION_PLUGIN_VERSION, false );
			wp_enqueue_script('vision_admin', $plugin_url . 'assets/js/admin.js', ['jquery'], VISION_PLUGIN_VERSION, false );

            wp_enqueue_media();
			
			// global settings to help ajax work
			$globals = [
				'plan' => VISION_PLUGIN_PLAN,
				'msg_pro_title' => esc_html__('Available only in Pro version', 'vision'),
				'msg_custom_js_error' => esc_html__('Custom js code error', 'vision'),
				'msg_layer_id_error' => esc_html__('The layer ID should be unique', 'vision'),
				'wp_base_url' => get_site_url(),
				'upload_base_url' => $upload_dir['baseurl'],
				'plugin_base_url' => $plugin_url,
				'ajax_url' => admin_url('admin-ajax.php'),
				'ajax_nonce' => wp_create_nonce('vision_ajax'),
				'ajax_msg_error' => esc_html__('Uncaught Error', 'vision') //Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information
			];
			
			$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
			
			$globals['ajax_action_get'] = $this->ajax_action_settings_get;
			$globals['ajax_action_update'] = $this->ajax_action_item_update;
			$globals['ajax_action_modal'] = $this->ajax_action_modal;
			$globals['ajax_item_id'] = $id;
			$globals['settings'] = NULL;
			$globals['config'] = NULL;
			
			$settings_key = 'vision_settings';
			$settings_value = get_option($settings_key);
			if($settings_value) {
				$globals['settings'] = unserialize($settings_value); // json_encode(unserialize($settings_value)) problem with double quotes
			}
			
			// get item data from DB
			if($id) {
				global $wpdb;
				$table = $wpdb->prefix . VISION_PLUGIN_NAME;

                // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$query = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%s", $id);
				$item = $wpdb->get_row($query, OBJECT);
                // phpcs:enable

				if($item) {
					$globals['config'] = unserialize($item->data); // json_encode(unserialize($item->data)) problem with double quotes
				}
			} else {
				// new item
				$item = (object) [
					'author' => get_current_user_id(),
					'editor' => get_current_user_id(),
					'created' => current_time('mysql', 1),
					'modified' => current_time('mysql', 1)
                ];
			}
			
			require_once( plugin_dir_path( dirname(__FILE__) ) . 'includes/page-item.php' );
			
			// set global settings
			wp_localize_script('vision_admin', 'vision_globals', $globals);
		}
	}
	
	/**
	 * Show admin menu settings page
	 */
	function admin_menu_page_settings() {
		$page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
		if($page==='vision_settings') {
			$plugin_url = plugin_dir_url(dirname(__FILE__));

			wp_enqueue_style('vision_admin', $plugin_url . 'assets/css/admin.css', [], VISION_PLUGIN_VERSION, 'all' );
            wp_enqueue_style('vision_lucide', $plugin_url . 'assets/vendor/lucide/lucide.css', [], VISION_PLUGIN_VERSION, 'all' );
			wp_enqueue_script('vision_admin', $plugin_url . 'assets/js/admin.js', ['jquery'], VISION_PLUGIN_VERSION, false );
			
			// global settings to help ajax work
			$globals = [
				'plan' => VISION_PLUGIN_PLAN,
				'msg_pro_title' => esc_html__('Available only in Pro version', 'vision'),
				'ajax_url' => admin_url('admin-ajax.php'),
				'ajax_nonce' => wp_create_nonce('vision_ajax' ),
				'ajax_msg_error' => esc_html__('Uncaught Error', 'vision') //Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information
			];
			
			$globals['ajax_action_update'] = $this->ajax_action_settings_update;
			$globals['ajax_action_get'] = $this->ajax_action_settings_get;
			$globals['ajax_action_modal'] = $this->ajax_action_modal;
			$globals['ajax_action_delete_data'] = $this->ajax_action_delete_data;
			$globals['config'] = NULL;
			
			// read settings
			$settings_key = 'vision_settings';
			$settings_value = get_option($settings_key);
			if($settings_value) {
				$globals['config'] = wp_json_encode(unserialize($settings_value));
			}
			
			require_once(plugin_dir_path( dirname(__FILE__) ) . 'includes/page-settings.php' );

			wp_localize_script('vision_admin', 'vision_globals', $globals);
		}
	}

    /**
     * Show admin menu upgrade to pro page
     */
    function admin_menu_page_upgrade_to_pro() {
        $page = sanitize_key(filter_input(INPUT_GET, 'page', FILTER_DEFAULT));
        if($page==='vision_upgrade_to_pro') {
            echo '<script>window.location = "https://1.envato.market/getvision"</script>';
        }
    }

	/**
	 * Ajax update item state
	 */
	function ajax_item_update_status() {
		$error = false;
		$data = [];
		$config = filter_input(INPUT_POST, 'config', FILTER_UNSAFE_RAW);
		
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			global $wpdb;
			$table = $wpdb->prefix . VISION_PLUGIN_NAME;

            $config = json_decode($config);
			$result = false;
			
			if(isset($config->id) && isset($config->active)) {
                // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$query = $wpdb->prepare("SELECT * FROM  {$table} WHERE id=%s", $config->id);
				$item = $wpdb->get_row($query, OBJECT );
                // phpcs:enable
				
				if($item && (current_user_can('manage_options') || get_current_user_id()==$item->author) ) {
					$itemData = unserialize($item->data);
					$itemData->active = $config->active;

                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$result = $wpdb->update(
						$table,
						['active' => $itemData->active, 'data' => serialize($itemData)],
						['id' => $config->id]
                    );
				}
			}
			
			if($result) {
				$data['id'] = $config->id;
				$data['msg'] = esc_html__('The item was successfully updated', 'vision');
			} else {
				$error = true;
				$data['msg'] = esc_html__('The operation failed, can\'t update item', 'vision');
			}
		} else {
			$error = true;
			$data['msg'] = esc_html__('The operation failed', 'vision');
		}
		
		if($error) {
			wp_send_json_error($data);
		} else {
			wp_send_json_success($data);
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
	
	/**
	 * Ajax update item data
	 */
	function ajax_item_update() {
		$error = false;
		$data = [];
		
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			global $wpdb;
			$table = $wpdb->prefix . VISION_PLUGIN_NAME;
			
			$inputId = filter_input(INPUT_POST, 'id', FILTER_UNSAFE_RAW);
			$inputData = filter_input(INPUT_POST, 'data', FILTER_UNSAFE_RAW);
			$inputConfig = filter_input(INPUT_POST, 'config', FILTER_UNSAFE_RAW);
			$itemData = json_decode($inputData);
			$itemConfig = json_decode($inputConfig);
			$flag = true;
			
			if(VISION_PLUGIN_PLAN == 'lite' && !$inputId ) {
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$rowcount = $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
				
				if(!($rowcount == 0 || ($rowcount == 1 && $inputId))) {
					$flag = false;
					$error = true;
					$data['msg'] = esc_html__('The operation failed, you can create only one item. To create more, buy the pro version.', 'vision');
				}
			}
			
			if($flag) {
				$itemConfig->modified = current_time('mysql', 1);
				
				if($inputId) {
					$result = false;

                    // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
					$query = $wpdb->prepare("SELECT * FROM {$table} WHERE id=%s", $inputId);
					$item = $wpdb->get_row($query, OBJECT);
                    // phpcs:enable

					if($item && (current_user_can('manage_options') || get_current_user_id()==$item->author) ) {
						$itemData->slug = sanitize_title(($itemData->slug ? $itemData->slug : $itemData->title));

                        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
						$result = $wpdb->update(
							$table,
							[
								'title' => $itemData->title,
								'slug' => $itemData->slug,
								'active' => $itemData->active,
								'data' => serialize($itemData),
								'config' => serialize($itemConfig),
								//'author' => get_current_user_id(),
								'editor' => get_current_user_id(),
								//'date' => NULL,
								'modified' => current_time('mysql', 1)
							],
							['id' => $inputId]
                        );
					}
					
					if($result) {
						$data['id'] = $inputId;
						$data['msg'] = esc_html__('The item was successfully updated', 'vision');
					} else {
						$error = true;
						$data['msg'] = esc_html__('The operation failed, can\'t update item', 'vision');
					}
				} else {
					$itemData->slug = sanitize_title(($itemData->slug ? $itemData->slug : $itemData->title));

                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
					$result = $wpdb->insert(
						$table,
						[
							'title' => $itemData->title,
							'slug' => $itemData->slug,
							'active' => $itemData->active,
							'data' => serialize($itemData),
							'config' => serialize($itemConfig),
							'author' => get_current_user_id(),
							'editor' => get_current_user_id(),
							'created' => current_time('mysql', 1),
							'modified' => current_time('mysql', 1)
						]);
					
					if($result) {
						$data['id'] = $inputId = $wpdb->insert_id;
						$data['msg'] = esc_html__('The item was successfully created', 'vision');
					} else {
						$error = true;
						$data['msg'] = esc_html__('The operation failed, can\'t create item', 'vision');
					}
				}
			}
		} else {
			$error = true;
			$data['msg'] = esc_html__('The operation failed', 'vision');
		}
		
		if($error) {
			wp_send_json_error($data);
		} else {
			wp_send_json_success($data);
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
	
	/**
	 * Ajax update settings data
	 */
	function ajax_settings_update() {
		$error = false;
		$data = [];
		$config = filter_input(INPUT_POST, 'config', FILTER_UNSAFE_RAW);
		
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			$settings_key = 'vision_settings';
			$settings_value = serialize(json_decode($config));
			$result = false;
			
			if(get_option($settings_key) == false) {
				$autoload = 'no';
				$result = add_option($settings_key, $settings_value, "", $autoload);
			} else {
				$old_settings_value = get_option($settings_key);
				if($old_settings_value === $settings_value) {
					$result = true;
				} else {
					$result = update_option($settings_key, $settings_value);
				}
			}
			
			if($result) {
				$data['msg'] = esc_html__('The settings were successfully updated', 'vision');
			} else {
				$error = true;
				$data['msg'] = esc_html__('The operation failed, can\'t update settings', 'vision');
			}
		}
		
		if($error) {
			wp_send_json_error($data);
		} else {
			wp_send_json_success($data);
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
	
	/**
	 * Ajax settings get data
	 */
	function ajax_settings_get() {
		$error = false;
		$data = [];
		$type = sanitize_key(filter_input(INPUT_POST, 'type', FILTER_DEFAULT));
		
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			switch($type) {
				case 'roles': {
					$data['list'] = [];
					
					$roles = wp_roles()->roles;
					foreach($roles as $key => $role) {
						if(array_key_exists('read', $role['capabilities'])) {
							array_push($data['list'], ['id' => $key, 'name' => translate_user_role($role['name'])]);
						}
					}
				}
				break;
				case 'themes': {
					$data['list'] = [];
					
					$files = glob(plugin_dir_path( dirname(__FILE__) ) . 'assets/themes/*.css');
					foreach($files as $file) {
						$filename = basename($file, '.css');
						array_push($data['list'], ['id' => $filename, 'title' => str_replace('-', ' ', $filename)]);
					}
				}
				break;
				case 'editor-themes': {
					$data['list'] = [];
					
					$files = glob(plugin_dir_path( dirname(__FILE__) ) . 'assets/vendor/ace/theme-*.js');
					foreach($files as $file) {
						$filename = str_replace('theme-','',basename($file, '.js'));
						array_push($data['list'], ['id' => $filename, 'title' => str_replace('_', ' ', $filename)]);
					}
				}
				break;
				case 'fonts': {
					$data['list'] = array(
						array('fontname' => 'none'),
						array('fontname' => 'Aclonica'),
						array('fontname' => 'Allan'),
						array('fontname' => 'Annie+Use+Your+Telescope'),
						array('fontname' => 'Anonymous+Pro'),
						array('fontname' => 'Allerta+Stencil'),
						array('fontname' => 'Allerta'),
						array('fontname' => 'Amaranth'),
						array('fontname' => 'Anton'),
						array('fontname' => 'Architects+Daughter'),
						array('fontname' => 'Arimo'),
						array('fontname' => 'Artifika'),
						array('fontname' => 'Arvo'),
						array('fontname' => 'Asset'),
						array('fontname' => 'Astloch'),
						array('fontname' => 'Bangers'),
						array('fontname' => 'Bentham'),
						array('fontname' => 'Bevan'),
						array('fontname' => 'Bigshot+One'),
						array('fontname' => 'Bowlby+One'),
						array('fontname' => 'Bowlby+One+SC'),
						array('fontname' => 'Brawler'),
						array('fontname' => 'Cabin'),
						array('fontname' => 'Calligraffitti'),
						array('fontname' => 'Candal'),
						array('fontname' => 'Cantarell'),
						array('fontname' => 'Cardo'),
						array('fontname' => 'Carter One'),
						array('fontname' => 'Caudex'),
						array('fontname' => 'Cedarville+Cursive'),
						array('fontname' => 'Cherry+Cream+Soda'),
						array('fontname' => 'Chewy'),
						array('fontname' => 'Coda'),
						array('fontname' => 'Coming+Soon'),
						array('fontname' => 'Copse'),
						array('fontname' => 'Cousine'),
						array('fontname' => 'Covered+By+Your+Grace'),
						array('fontname' => 'Crafty+Girls'),
						array('fontname' => 'Crimson+Text'),
						array('fontname' => 'Crushed'),
						array('fontname' => 'Cuprum'),
						array('fontname' => 'Damion'),
						array('fontname' => 'Dancing+Script'),
						array('fontname' => 'Dawning+of+a+New+Day'),
						array('fontname' => 'Didact+Gothic'),
						array('fontname' => 'Droid+Sans'),
						array('fontname' => 'Droid+Sans+Mono'),
						array('fontname' => 'Droid+Serif'),
						array('fontname' => 'EB+Garamond'),
						array('fontname' => 'Expletus+Sans'),
						array('fontname' => 'Fontdiner+Swanky'),
						array('fontname' => 'Forum'),
						array('fontname' => 'Francois+One'),
						array('fontname' => 'Geo'),
						array('fontname' => 'Give+You+Glory'),
						array('fontname' => 'Goblin+One'),
						array('fontname' => 'Goudy+Bookletter+1911'),
						array('fontname' => 'Gravitas+One'),
						array('fontname' => 'Gruppo'),
						array('fontname' => 'Hammersmith+One'),
						array('fontname' => 'Holtwood+One+SC'),
						array('fontname' => 'Homemade+Apple'),
						array('fontname' => 'Inconsolata'),
						array('fontname' => 'Indie+Flower'),
						array('fontname' => 'IM+Fell+DW+Pica'),
						array('fontname' => 'IM+Fell+DW+Pica+SC'),
						array('fontname' => 'IM+Fell+Double+Pica'),
						array('fontname' => 'IM+Fell+Double+Pica+SC'),
						array('fontname' => 'IM+Fell+English'),
						array('fontname' => 'IM+Fell+English+SC'),
						array('fontname' => 'IM+Fell+French+Canon'),
						array('fontname' => 'IM+Fell+French+Canon+SC'),
						array('fontname' => 'IM+Fell+Great+Primer'),
						array('fontname' => 'IM+Fell+Great+Primer+SC'),
						array('fontname' => 'Irish+Grover'),
						array('fontname' => 'Irish+Growler'),
						array('fontname' => 'Istok+Web'),
						array('fontname' => 'Josefin+Sans'),
						array('fontname' => 'Josefin+Slab'),
						array('fontname' => 'Judson'),
						array('fontname' => 'Jura'),
						array('fontname' => 'Just+Another+Hand'),
						array('fontname' => 'Just+Me+Again+Down+Here'),
						array('fontname' => 'Kameron'),
						array('fontname' => 'Kenia'),
						array('fontname' => 'Kranky'),
						array('fontname' => 'Kreon'),
						array('fontname' => 'Kristi'),
						array('fontname' => 'La+Belle+Aurore'),
						array('fontname' => 'Lato'),
						array('fontname' => 'League+Script'),
						array('fontname' => 'Lekton'),  
						array('fontname' => 'Limelight'),  
						array('fontname' => 'Lobster'),
						array('fontname' => 'Lobster Two'),
						array('fontname' => 'Lora'),
						array('fontname' => 'Love+Ya+Like+A+Sister'),
						array('fontname' => 'Loved+by+the+King'),
						array('fontname' => 'Luckiest+Guy'),
						array('fontname' => 'Maiden+Orange'),
						array('fontname' => 'Mako'),
						array('fontname' => 'Maven+Pro'),
						array('fontname' => 'Meddon'),
						array('fontname' => 'MedievalSharp'),
						array('fontname' => 'Megrim'),
						array('fontname' => 'Merriweather'),
						array('fontname' => 'Metrophobic'),
						array('fontname' => 'Michroma'),
						array('fontname' => 'Miltonian+Tattoo'),
						array('fontname' => 'Miltonian'),
						array('fontname' => 'Modern Antiqua'),
						array('fontname' => 'Monofett'),
						array('fontname' => 'Molengo'),
						array('fontname' => 'Mountains of Christmas'),
						array('fontname' => 'Muli'), 
						array('fontname' => 'Neucha'),
						array('fontname' => 'Neuton'),
						array('fontname' => 'News+Cycle'),
						array('fontname' => 'Nixie+One'),
						array('fontname' => 'Nobile'),
						array('fontname' => 'Nova+Cut'),
						array('fontname' => 'Nova+Flat'),
						array('fontname' => 'Nova+Mono'),
						array('fontname' => 'Nova+Oval'),
						array('fontname' => 'Nova+Round'),
						array('fontname' => 'Nova+Script'),
						array('fontname' => 'Nova+Slim'),
						array('fontname' => 'Nova+Square'),
						array('fontname' => 'Nunito'),
						array('fontname' => 'OFL+Sorts+Mill+Goudy+TT'),
						array('fontname' => 'Old+Standard+TT'),
						array('fontname' => 'Open+Sans'),
						array('fontname' => 'Orbitron'),
						array('fontname' => 'Oswald'),
						array('fontname' => 'Over+the+Rainbow'),
						array('fontname' => 'Reenie+Beanie'),
						array('fontname' => 'Pacifico'),
						array('fontname' => 'Patrick+Hand'),
						array('fontname' => 'Paytone+One'), 
						array('fontname' => 'Permanent+Marker'),
						array('fontname' => 'Philosopher'),
						array('fontname' => 'Play'),
						array('fontname' => 'Playfair+Display'),
						array('fontname' => 'Podkova'),
						array('fontname' => 'PT+Sans'),
						array('fontname' => 'PT+Sans+Narrow'),
						array('fontname' => 'PT+Serif'),
						array('fontname' => 'PT+Serif Caption'),
						array('fontname' => 'Puritan'),
						array('fontname' => 'Quattrocento'),
						array('fontname' => 'Quattrocento+Sans'),
						array('fontname' => 'Radley'),
						array('fontname' => 'Redressed'),
						array('fontname' => 'Rock+Salt'),
						array('fontname' => 'Rokkitt'),
						array('fontname' => 'Ruslan+Display'),
						array('fontname' => 'Schoolbell'),
						array('fontname' => 'Shadows+Into+Light'),
						array('fontname' => 'Shanti'),
						array('fontname' => 'Sigmar+One'),
						array('fontname' => 'Six+Caps'),
						array('fontname' => 'Slackey'),
						array('fontname' => 'Smythe'),
						array('fontname' => 'Special+Elite'),
						array('fontname' => 'Stardos+Stencil'),
						array('fontname' => 'Sue+Ellen+Francisco'),
						array('fontname' => 'Sunshiney'),
						array('fontname' => 'Swanky+and+Moo+Moo'),
						array('fontname' => 'Syncopate'),
						array('fontname' => 'Tangerine'),
						array('fontname' => 'Tenor+Sans'),
						array('fontname' => 'Terminal+Dosis+Light'),
						array('fontname' => 'The+Girl+Next+Door'),
						array('fontname' => 'Tinos'),
						array('fontname' => 'Ubuntu'),
						array('fontname' => 'Ultra'),
						array('fontname' => 'Unkempt'),
						array('fontname' => 'UnifrakturMaguntia'),
						array('fontname' => 'Varela'),
						array('fontname' => 'Varela Round'),
						array('fontname' => 'Vibur'),
						array('fontname' => 'Vollkorn'),
						array('fontname' => 'VT323'),
						array('fontname' => 'Waiting+for+the+Sunrise'),
						array('fontname' => 'Wallpoet'),
						array('fontname' => 'Walter+Turncoat'),
						array('fontname' => 'Wire+One'),
						array('fontname' => 'Yanone+Kaffeesatz'),
						array('fontname' => 'Yeseva+One'),
						array('fontname' => 'Zeyada')
					);
				}
				break;
				default: {
					$error = true;
					$data['msg'] = esc_html__('The operation failed', 'vision');
				}
				break;
			}
		} else {
			$error = true;
			$data['msg'] = esc_html__('The operation failed', 'vision');
		}
		
		if($error) {
			wp_send_json_error($data);
		} else {
			wp_send_json_success($data);
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
	
	/**
	 * Ajax delete all data from tables
	 */
	function ajax_delete_data() {
		$error = true;
		$data = [];
		$data['msg'] = esc_html__('The operation failed, can\'t delete data', 'vision');
		
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			global $wpdb;
			$table = $wpdb->prefix . VISION_PLUGIN_NAME;

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			foreach($wpdb->get_results("SELECT id FROM {$table}") as $key => $item) {
				// [filemanager] delete file
				if(wp_is_writable(VISION_PLUGIN_UPLOAD_DIR)) {
					$file_json = 'config.json';
					$file_main_css = 'main.css';
					$file_custom_css = 'custom.css';
					$file_root_path = VISION_PLUGIN_UPLOAD_DIR . '/' . $item->id . '/';

                    if(file_exists($file_root_path . $file_json)) {
                        wp_delete_file($file_root_path . $file_json);
                    }
					wp_delete_file($file_root_path . $file_main_css);
					wp_delete_file($file_root_path . $file_custom_css);

                    $wp_filesystem = $this->getFileSystem();
					if($wp_filesystem->is_dir($file_root_path)) {
                        $wp_filesystem->rmdir($file_root_path);
					}
				}
			}

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$result = $wpdb->query("TRUNCATE TABLE {$table}");
			
			if($result) {
				$error = false;
				$data['msg'] = esc_html__('All data deleted', 'vision');
			}
		}
		
		if($error) {
			wp_send_json_error($data);
		} else {
			wp_send_json_success($data);
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
	
	/**
	 * Ajax settings get data
	 */
	function ajax_modal() {
		if(check_ajax_referer('vision_ajax', 'nonce', false)) {
			$modalName = sanitize_file_name(filter_input(INPUT_GET, 'name', FILTER_DEFAULT));
			$modalPath = plugin_dir_path( dirname(__FILE__) ) . 'includes/modal-' . $modalName . '.php';
			
			if(file_exists($modalPath)) {
				require_once( $modalPath );
			}
		}
		
		wp_die(); // this is required to terminate immediately and return a proper response
	}
}
?>